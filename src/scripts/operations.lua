-- Aseprite MCP Operations Script
-- Dispatches operations based on app.params.operation
-- Params are passed as JSON via app.params.params
-- Results are printed as JSON to stdout

-- JSON helper: simple encoder for result output
local function json_encode(val)
  if val == nil then
    return "null"
  end
  local t = type(val)
  if t == "boolean" then
    return val and "true" or "false"
  elseif t == "number" then
    if val ~= val then return "null" end -- NaN
    if val == math.huge or val == -math.huge then return "null" end
    return tostring(val)
  elseif t == "string" then
    val = val:gsub('\\', '\\\\')
    val = val:gsub('"', '\\"')
    val = val:gsub('\n', '\\n')
    val = val:gsub('\r', '\\r')
    val = val:gsub('\t', '\\t')
    return '"' .. val .. '"'
  elseif t == "table" then
    -- Check if array
    local is_array = true
    local max_index = 0
    for k, _ in pairs(val) do
      if type(k) ~= "number" or k < 1 or math.floor(k) ~= k then
        is_array = false
        break
      end
      if k > max_index then max_index = k end
    end
    if is_array and max_index == #val then
      local parts = {}
      for i = 1, #val do
        parts[i] = json_encode(val[i])
      end
      return "[" .. table.concat(parts, ",") .. "]"
    else
      local parts = {}
      for k, v in pairs(val) do
        table.insert(parts, json_encode(tostring(k)) .. ":" .. json_encode(v))
      end
      return "{" .. table.concat(parts, ",") .. "}"
    end
  end
  return "null"
end

-- JSON helper: simple decoder for params input
local function json_decode(str)
  if not str or str == "" then return {} end
  -- Use Aseprite's built-in json module if available
  if json then
    return json.decode(str)
  end
  -- Fallback: use load (safe subset)
  str = str:gsub("null", "nil")
  str = str:gsub("true", "true")
  str = str:gsub("false", "false")
  local fn = load("return " .. str)
  if fn then
    return fn()
  end
  return {}
end

local function send_result(result)
  print(json_encode(result))
end

local function send_error(message)
  print(json_encode({ error = message }))
end

-- Color helper: parse color from params (supports hex string, rgba table, or palette index)
local function parse_color(c)
  if type(c) == "string" then
    -- Hex color: "#RRGGBB" or "#RRGGBBAA"
    local hex = c:gsub("^#", "")
    local r = tonumber(hex:sub(1, 2), 16) or 0
    local g = tonumber(hex:sub(3, 4), 16) or 0
    local b = tonumber(hex:sub(5, 6), 16) or 0
    local a = 255
    if #hex >= 8 then
      a = tonumber(hex:sub(7, 8), 16) or 255
    end
    return Color(r, g, b, a)
  elseif type(c) == "table" then
    return Color(c.r or c.red or 0, c.g or c.green or 0, c.b or c.blue or 0, c.a or c.alpha or 255)
  elseif type(c) == "number" then
    return Color(c)
  end
  return Color(0, 0, 0, 255)
end

-- ============================================================
-- Operation handlers
-- ============================================================

local operations = {}

-- Sprite operations

function operations.create_sprite(params)
  local width = params.width or 32
  local height = params.height or 32
  local colorMode = ColorMode.RGB
  if params.colorMode == "indexed" then
    colorMode = ColorMode.INDEXED
  elseif params.colorMode == "grayscale" then
    colorMode = ColorMode.GRAY
  end

  local sprite = Sprite(width, height, colorMode)

  if params.outputPath then
    sprite:saveCopyAs(params.outputPath)
  end

  local result = {
    success = true,
    width = sprite.width,
    height = sprite.height,
    colorMode = tostring(sprite.colorMode),
    layers = #sprite.layers,
    frames = #sprite.frames,
  }

  if params.outputPath then
    result.savedTo = params.outputPath
  end

  send_result(result)
end

function operations.open_sprite(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local layers = {}
  for i, layer in ipairs(sprite.layers) do
    layers[i] = {
      name = layer.name,
      opacity = layer.opacity,
      blendMode = tostring(layer.blendMode),
      isVisible = layer.isVisible,
      isEditable = layer.isEditable,
    }
  end

  local tags = {}
  for i, tag in ipairs(sprite.tags) do
    tags[i] = {
      name = tag.name,
      fromFrame = tag.fromFrame.frameNumber,
      toFrame = tag.toFrame.frameNumber,
      aniDir = tostring(tag.aniDir),
    }
  end

  local frames = {}
  for i, frame in ipairs(sprite.frames) do
    frames[i] = {
      frameNumber = frame.frameNumber,
      duration = frame.duration,
    }
  end

  send_result({
    success = true,
    width = sprite.width,
    height = sprite.height,
    colorMode = tostring(sprite.colorMode),
    filename = sprite.filename,
    layers = layers,
    tags = tags,
    frames = frames,
    paletteSize = #sprite.palettes[1],
  })
end

function operations.get_sprite_info(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local layers = {}
  for i, layer in ipairs(sprite.layers) do
    layers[i] = {
      name = layer.name,
      opacity = layer.opacity,
      blendMode = tostring(layer.blendMode),
      isVisible = layer.isVisible,
    }
  end

  local tags = {}
  for i, tag in ipairs(sprite.tags) do
    tags[i] = {
      name = tag.name,
      fromFrame = tag.fromFrame.frameNumber,
      toFrame = tag.toFrame.frameNumber,
    }
  end

  local frames = {}
  for i, frame in ipairs(sprite.frames) do
    frames[i] = {
      frameNumber = frame.frameNumber,
      duration = frame.duration,
    }
  end

  local palette = sprite.palettes[1]
  local paletteColors = {}
  if palette then
    local count = #palette
    -- Limit to first 256 colors for output size
    local maxColors = math.min(count, 256)
    for i = 0, maxColors - 1 do
      local c = palette:getColor(i)
      paletteColors[#paletteColors + 1] = {
        index = i,
        r = c.red,
        g = c.green,
        b = c.blue,
        a = c.alpha,
        hex = string.format("#%02x%02x%02x%02x", c.red, c.green, c.blue, c.alpha),
      }
    end
  end

  local slices = {}
  for i, slice in ipairs(sprite.slices) do
    slices[i] = {
      name = slice.name,
      bounds = {
        x = slice.bounds.x,
        y = slice.bounds.y,
        width = slice.bounds.width,
        height = slice.bounds.height,
      },
    }
  end

  send_result({
    success = true,
    width = sprite.width,
    height = sprite.height,
    colorMode = tostring(sprite.colorMode),
    filename = sprite.filename,
    layers = layers,
    tags = tags,
    frames = frames,
    palette = paletteColors,
    slices = slices,
    tilesets = #sprite.tilesets,
  })

  sprite:close()
end

function operations.save_sprite(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.resize_sprite(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local newWidth = params.width or sprite.width
  local newHeight = params.height or sprite.height

  sprite:resize(newWidth, newHeight)

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    width = sprite.width,
    height = sprite.height,
    savedTo = savePath,
  })

  sprite:close()
end

-- Layer operations

function operations.add_layer(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local layer
  if params.type == "group" then
    layer = sprite:newGroup()
  else
    layer = sprite:newLayer()
  end

  if params.name then
    layer.name = params.name
  end
  if params.opacity then
    layer.opacity = params.opacity
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    layerName = layer.name,
    layerCount = #sprite.layers,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.remove_layer(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local layer = nil
  if params.layerName then
    for _, l in ipairs(sprite.layers) do
      if l.name == params.layerName then
        layer = l
        break
      end
    end
  elseif params.layerIndex then
    layer = sprite.layers[params.layerIndex]
  end

  if not layer then
    send_error("Layer not found")
    sprite:close()
    return
  end

  sprite:deleteLayer(layer)

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    layerCount = #sprite.layers,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.set_layer_properties(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local layer = nil
  if params.layerName then
    for _, l in ipairs(sprite.layers) do
      if l.name == params.layerName then
        layer = l
        break
      end
    end
  elseif params.layerIndex then
    layer = sprite.layers[params.layerIndex]
  end

  if not layer then
    send_error("Layer not found")
    sprite:close()
    return
  end

  if params.name then
    layer.name = params.name
  end
  if params.opacity ~= nil then
    layer.opacity = params.opacity
  end
  if params.isVisible ~= nil then
    layer.isVisible = params.isVisible
  end
  if params.isEditable ~= nil then
    layer.isEditable = params.isEditable
  end
  if params.blendMode then
    local modes = {
      normal = BlendMode.NORMAL,
      multiply = BlendMode.MULTIPLY,
      screen = BlendMode.SCREEN,
      overlay = BlendMode.OVERLAY,
      darken = BlendMode.DARKEN,
      lighten = BlendMode.LIGHTEN,
      color_dodge = BlendMode.COLOR_DODGE,
      color_burn = BlendMode.COLOR_BURN,
      hard_light = BlendMode.HARD_LIGHT,
      soft_light = BlendMode.SOFT_LIGHT,
      difference = BlendMode.DIFFERENCE,
      exclusion = BlendMode.EXCLUSION,
      hue = BlendMode.HSL_HUE,
      saturation = BlendMode.HSL_SATURATION,
      color = BlendMode.HSL_COLOR,
      luminosity = BlendMode.HSL_LUMINOSITY,
      addition = BlendMode.ADDITION,
      subtract = BlendMode.SUBTRACT,
      divide = BlendMode.DIVIDE,
    }
    if modes[params.blendMode] then
      layer.blendMode = modes[params.blendMode]
    end
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    layerName = layer.name,
    opacity = layer.opacity,
    isVisible = layer.isVisible,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.list_layers(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local layers = {}
  for i, layer in ipairs(sprite.layers) do
    layers[i] = {
      name = layer.name,
      opacity = layer.opacity,
      blendMode = tostring(layer.blendMode),
      isVisible = layer.isVisible,
      isEditable = layer.isEditable,
      isGroup = layer.isGroup,
      isTilemap = layer.isTilemap,
    }
  end

  send_result({
    success = true,
    layers = layers,
    count = #layers,
  })

  sprite:close()
end

function operations.flatten_layers(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  sprite:flatten()

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    layerCount = #sprite.layers,
    savedTo = savePath,
  })

  sprite:close()
end

-- Frame operations

function operations.add_frame(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local frame
  if params.copyFrom then
    local sourceFrame = sprite.frames[params.copyFrom]
    if not sourceFrame then
      send_error("Source frame not found: " .. tostring(params.copyFrom))
      sprite:close()
      return
    end
    frame = sprite:newFrame(sourceFrame)
  else
    frame = sprite:newEmptyFrame(params.afterFrame or (#sprite.frames + 1))
  end

  if params.duration then
    frame.duration = params.duration
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    frameNumber = frame.frameNumber,
    frameCount = #sprite.frames,
    duration = frame.duration,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.remove_frame(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local frameNumber = params.frameNumber or #sprite.frames
  local frame = sprite.frames[frameNumber]
  if not frame then
    send_error("Frame not found: " .. tostring(frameNumber))
    sprite:close()
    return
  end

  if #sprite.frames <= 1 then
    send_error("Cannot remove the last frame")
    sprite:close()
    return
  end

  sprite:deleteFrame(frame)

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    frameCount = #sprite.frames,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.set_frame_duration(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local frameNumber = params.frameNumber or 1
  local frame = sprite.frames[frameNumber]
  if not frame then
    send_error("Frame not found: " .. tostring(frameNumber))
    sprite:close()
    return
  end

  frame.duration = params.duration or 0.1

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    frameNumber = frame.frameNumber,
    duration = frame.duration,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.list_frames(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local frames = {}
  for i, frame in ipairs(sprite.frames) do
    frames[i] = {
      frameNumber = frame.frameNumber,
      duration = frame.duration,
    }
  end

  send_result({
    success = true,
    frames = frames,
    count = #frames,
  })

  sprite:close()
end

function operations.reorder_frames(params)
  -- Aseprite doesn't have a direct frame reorder API,
  -- but we can reverse frames within a range
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  if params.reverse then
    -- Reverse all frames
    local fromFrame = params.fromFrame or 1
    local toFrame = params.toFrame or #sprite.frames
    -- Select the range and reverse
    app.range.frames = {}
    for i = fromFrame, toFrame do
      app.range.frames[#app.range.frames + 1] = sprite.frames[i]
    end
    app.command.ReverseFrames()
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    frameCount = #sprite.frames,
    savedTo = savePath,
  })

  sprite:close()
end

-- Drawing operations

function operations.draw_pixel(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local frameNumber = params.frameNumber or 1
  local layerIndex = params.layerIndex or 1

  app.sprite = sprite
  app.layer = sprite.layers[layerIndex]
  app.frame = sprite.frames[frameNumber]

  local cel = app.cel
  if not cel then
    cel = sprite:newCel(app.layer, app.frame)
  end

  local image = cel.image
  local color = parse_color(params.color or "#000000")
  local pixelValue = app.pixelColor.rgba(color.red, color.green, color.blue, color.alpha)

  local x = (params.x or 0) - cel.position.x
  local y = (params.y or 0) - cel.position.y

  if x >= 0 and x < image.width and y >= 0 and y < image.height then
    image:drawPixel(x, y, pixelValue)
    cel.image = image
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    x = params.x or 0,
    y = params.y or 0,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.draw_pixels(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local frameNumber = params.frameNumber or 1
  local layerIndex = params.layerIndex or 1

  app.sprite = sprite
  app.layer = sprite.layers[layerIndex]
  app.frame = sprite.frames[frameNumber]

  local cel = app.cel
  if not cel then
    cel = sprite:newCel(app.layer, app.frame)
  end

  local image = cel.image
  local pixels = params.pixels or {}
  local count = 0

  for _, p in ipairs(pixels) do
    local color = parse_color(p.color or "#000000")
    local pixelValue = app.pixelColor.rgba(color.red, color.green, color.blue, color.alpha)
    local x = (p.x or 0) - cel.position.x
    local y = (p.y or 0) - cel.position.y
    if x >= 0 and x < image.width and y >= 0 and y < image.height then
      image:drawPixel(x, y, pixelValue)
      count = count + 1
    end
  end

  cel.image = image

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    pixelsDrawn = count,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.draw_line(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local frameNumber = params.frameNumber or 1
  local layerIndex = params.layerIndex or 1

  app.sprite = sprite
  app.layer = sprite.layers[layerIndex]
  app.frame = sprite.frames[frameNumber]

  local color = parse_color(params.color or "#000000")
  app.fgColor = color

  app.useTool{
    tool = "line",
    color = color,
    points = { Point(params.x1 or 0, params.y1 or 0), Point(params.x2 or 0, params.y2 or 0) },
    brush = Brush{ size = params.brushSize or 1 },
    layer = app.layer,
    frame = app.frame,
  }

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    from = { x = params.x1 or 0, y = params.y1 or 0 },
    to = { x = params.x2 or 0, y = params.y2 or 0 },
    savedTo = savePath,
  })

  sprite:close()
end

function operations.draw_rect(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local frameNumber = params.frameNumber or 1
  local layerIndex = params.layerIndex or 1

  app.sprite = sprite
  app.layer = sprite.layers[layerIndex]
  app.frame = sprite.frames[frameNumber]

  local color = parse_color(params.color or "#000000")
  local x = params.x or 0
  local y = params.y or 0
  local w = params.width or 10
  local h = params.height or 10
  local filled = params.filled ~= false -- default true

  if filled then
    app.useTool{
      tool = "filled_rectangle",
      color = color,
      points = { Point(x, y), Point(x + w - 1, y + h - 1) },
      brush = Brush{ size = params.brushSize or 1 },
      layer = app.layer,
      frame = app.frame,
    }
  else
    app.useTool{
      tool = "rectangle",
      color = color,
      points = { Point(x, y), Point(x + w - 1, y + h - 1) },
      brush = Brush{ size = params.brushSize or 1 },
      layer = app.layer,
      frame = app.frame,
    }
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    rect = { x = x, y = y, width = w, height = h },
    filled = filled,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.draw_ellipse(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local frameNumber = params.frameNumber or 1
  local layerIndex = params.layerIndex or 1

  app.sprite = sprite
  app.layer = sprite.layers[layerIndex]
  app.frame = sprite.frames[frameNumber]

  local color = parse_color(params.color or "#000000")
  local x = params.x or 0
  local y = params.y or 0
  local w = params.width or 10
  local h = params.height or 10
  local filled = params.filled ~= false

  if filled then
    app.useTool{
      tool = "filled_ellipse",
      color = color,
      points = { Point(x, y), Point(x + w - 1, y + h - 1) },
      brush = Brush{ size = params.brushSize or 1 },
      layer = app.layer,
      frame = app.frame,
    }
  else
    app.useTool{
      tool = "ellipse",
      color = color,
      points = { Point(x, y), Point(x + w - 1, y + h - 1) },
      brush = Brush{ size = params.brushSize or 1 },
      layer = app.layer,
      frame = app.frame,
    }
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    ellipse = { x = x, y = y, width = w, height = h },
    filled = filled,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.flood_fill(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local frameNumber = params.frameNumber or 1
  local layerIndex = params.layerIndex or 1

  app.sprite = sprite
  app.layer = sprite.layers[layerIndex]
  app.frame = sprite.frames[frameNumber]

  local color = parse_color(params.color or "#000000")

  app.useTool{
    tool = "paint_bucket",
    color = color,
    points = { Point(params.x or 0, params.y or 0) },
    layer = app.layer,
    frame = app.frame,
  }

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    x = params.x or 0,
    y = params.y or 0,
    savedTo = savePath,
  })

  sprite:close()
end

-- Palette operations

function operations.get_palette(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local palette = sprite.palettes[1]
  local colors = {}
  if palette then
    local count = #palette
    for i = 0, count - 1 do
      local c = palette:getColor(i)
      colors[#colors + 1] = {
        index = i,
        r = c.red,
        g = c.green,
        b = c.blue,
        a = c.alpha,
        hex = string.format("#%02x%02x%02x", c.red, c.green, c.blue),
      }
    end
  end

  send_result({
    success = true,
    colors = colors,
    count = #colors,
  })

  sprite:close()
end

function operations.set_palette_color(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local palette = sprite.palettes[1]
  local index = params.paletteIndex or params.index or 0
  local color = parse_color(params.color or "#000000")

  if index >= #palette then
    palette:resize(index + 1)
  end
  palette:setColor(index, color)

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    index = index,
    color = { r = color.red, g = color.green, b = color.blue, a = color.alpha },
    savedTo = savePath,
  })

  sprite:close()
end

function operations.load_palette(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end
  if not params.palettePath then
    send_error("palettePath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  sprite:loadPalette(params.palettePath)

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    paletteSize = #sprite.palettes[1],
    savedTo = savePath,
  })

  sprite:close()
end

function operations.create_palette(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local colors = params.colors or {}
  local palette = Palette(#colors)

  for i, c in ipairs(colors) do
    palette:setColor(i - 1, parse_color(c))
  end

  sprite:setPalette(palette)

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    paletteSize = #palette,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.resize_palette(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local palette = sprite.palettes[1]
  local newSize = params.size or #palette

  palette:resize(newSize)

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    paletteSize = #palette,
    savedTo = savePath,
  })

  sprite:close()
end

-- Selection operations

function operations.select_rect(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local x = params.x or 0
  local y = params.y or 0
  local w = params.width or sprite.width
  local h = params.height or sprite.height

  sprite.selection = Selection(Rectangle(x, y, w, h))

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    selection = { x = x, y = y, width = w, height = h },
    savedTo = savePath,
  })

  sprite:close()
end

function operations.select_all(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  app.sprite = sprite
  app.command.MaskAll()

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    selection = { x = 0, y = 0, width = sprite.width, height = sprite.height },
    savedTo = savePath,
  })

  sprite:close()
end

function operations.deselect(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  app.sprite = sprite
  app.command.DeselectMask()

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.invert_selection(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  app.sprite = sprite
  app.command.InvertMask()

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    savedTo = savePath,
  })

  sprite:close()
end

-- Transform operations

function operations.flip_sprite(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  app.sprite = sprite
  local orientation = params.orientation or "horizontal"

  if orientation == "horizontal" then
    app.command.Flip{ target = "canvas", orientation = "horizontal" }
  else
    app.command.Flip{ target = "canvas", orientation = "vertical" }
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    orientation = orientation,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.rotate_sprite(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  app.sprite = sprite
  local angle = params.angle or 90

  if angle == 90 then
    app.command.Rotate{ angle = "90" }
  elseif angle == 180 then
    app.command.Rotate{ angle = "180" }
  elseif angle == 270 or angle == -90 then
    app.command.Rotate{ angle = "270" }
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    angle = angle,
    width = sprite.width,
    height = sprite.height,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.crop_sprite(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  if params.x and params.y and params.width and params.height then
    sprite:crop(params.x, params.y, params.width, params.height)
  else
    -- Crop to content
    app.sprite = sprite
    app.command.AutocropSprite()
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    width = sprite.width,
    height = sprite.height,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.trim_sprite(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  app.sprite = sprite
  app.command.AutocropSprite()

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    width = sprite.width,
    height = sprite.height,
    savedTo = savePath,
  })

  sprite:close()
end

-- Tag operations

function operations.create_tag(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local fromFrame = params.fromFrame or 1
  local toFrame = params.toFrame or #sprite.frames

  if fromFrame > #sprite.frames or toFrame > #sprite.frames then
    send_error("Frame range out of bounds")
    sprite:close()
    return
  end

  local tag = sprite:newTag(fromFrame, toFrame)
  if params.name then
    tag.name = params.name
  end
  if params.color then
    tag.color = parse_color(params.color)
  end
  if params.aniDir then
    local dirs = {
      forward = AniDir.FORWARD,
      reverse = AniDir.REVERSE,
      pingpong = AniDir.PING_PONG,
    }
    if dirs[params.aniDir] then
      tag.aniDir = dirs[params.aniDir]
    end
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    tagName = tag.name,
    fromFrame = tag.fromFrame.frameNumber,
    toFrame = tag.toFrame.frameNumber,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.remove_tag(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local tag = nil
  if params.tagName then
    for _, t in ipairs(sprite.tags) do
      if t.name == params.tagName then
        tag = t
        break
      end
    end
  end

  if not tag then
    send_error("Tag not found: " .. tostring(params.tagName))
    sprite:close()
    return
  end

  sprite:deleteTag(tag)

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    tagCount = #sprite.tags,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.list_tags(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local tags = {}
  for i, tag in ipairs(sprite.tags) do
    tags[i] = {
      name = tag.name,
      fromFrame = tag.fromFrame.frameNumber,
      toFrame = tag.toFrame.frameNumber,
      aniDir = tostring(tag.aniDir),
    }
  end

  send_result({
    success = true,
    tags = tags,
    count = #tags,
  })

  sprite:close()
end

-- Export operations

function operations.export_png(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end
  if not params.outputPath then
    send_error("outputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  -- If outputPath contains {frame}, export all frames
  if params.outputPath:find("{frame") then
    for i, frame in ipairs(sprite.frames) do
      local path = params.outputPath:gsub("{frame}", tostring(i))
      path = path:gsub("{frame0}", string.format("%d", i))
      path = path:gsub("{frame00}", string.format("%02d", i))
      path = path:gsub("{frame000}", string.format("%03d", i))

      -- Render frame
      local img = Image(sprite.spec)
      img:drawSprite(sprite, frame)
      img:saveAs(path)
    end

    send_result({
      success = true,
      frameCount = #sprite.frames,
      outputPattern = params.outputPath,
    })
  else
    -- Export single image (first frame or specified frame)
    local frameNumber = params.frameNumber or 1
    local img = Image(sprite.spec)
    img:drawSprite(sprite, frameNumber)
    img:saveAs(params.outputPath)

    send_result({
      success = true,
      savedTo = params.outputPath,
      width = sprite.width,
      height = sprite.height,
    })
  end

  sprite:close()
end

function operations.export_spritesheet(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end
  if not params.outputPath then
    send_error("outputPath is required")
    return
  end

  -- Use Aseprite CLI for spritesheet export (more reliable)
  -- This operation returns the CLI args to use instead
  local result = {
    success = true,
    useCli = true,
    inputPath = params.inputPath,
    outputPath = params.outputPath,
    dataPath = params.dataPath,
    sheetType = params.sheetType or "packed",
    borderPadding = params.borderPadding or 0,
    shapePadding = params.shapePadding or 0,
    innerPadding = params.innerPadding or 0,
  }

  send_result(result)
end

function operations.export_gif(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end
  if not params.outputPath then
    send_error("outputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  sprite:saveCopyAs(params.outputPath)

  send_result({
    success = true,
    savedTo = params.outputPath,
    frameCount = #sprite.frames,
  })

  sprite:close()
end

-- Cel operations

function operations.clear_cel(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local frameNumber = params.frameNumber or 1
  local layerIndex = params.layerIndex or 1

  local layer = sprite.layers[layerIndex]
  local frame = sprite.frames[frameNumber]

  if layer and frame then
    sprite:deleteCel(layer, frame)
  end

  local savePath = params.outputPath or params.inputPath
  sprite:saveCopyAs(savePath)

  send_result({
    success = true,
    savedTo = savePath,
  })

  sprite:close()
end

function operations.get_cel_info(params)
  if not params.inputPath then
    send_error("inputPath is required")
    return
  end

  local sprite = Sprite{ fromFile = params.inputPath }
  if not sprite then
    send_error("Failed to open sprite: " .. params.inputPath)
    return
  end

  local frameNumber = params.frameNumber or 1
  local layerIndex = params.layerIndex or 1

  local layer = sprite.layers[layerIndex]
  local frame = sprite.frames[frameNumber]

  if not layer or not frame then
    send_error("Layer or frame not found")
    sprite:close()
    return
  end

  app.sprite = sprite
  app.layer = layer
  app.frame = frame

  local cel = app.cel

  if not cel then
    send_result({
      success = true,
      hasCel = false,
      layerName = layer.name,
      frameNumber = frame.frameNumber,
    })
    sprite:close()
    return
  end

  send_result({
    success = true,
    hasCel = true,
    layerName = layer.name,
    frameNumber = frame.frameNumber,
    position = { x = cel.position.x, y = cel.position.y },
    opacity = cel.opacity,
    bounds = {
      x = cel.bounds.x,
      y = cel.bounds.y,
      width = cel.bounds.width,
      height = cel.bounds.height,
    },
  })

  sprite:close()
end

-- ============================================================
-- Main dispatch
-- ============================================================

local operation = app.params.operation
local paramsStr = app.params.params or "{}"
local params = json_decode(paramsStr)

if not operation then
  send_error("No operation specified. Pass --script-param operation=<name>")
  return
end

if not operations[operation] then
  send_error("Unknown operation: " .. operation)
  return
end

-- Execute the operation
local ok, err = pcall(operations[operation], params)
if not ok then
  send_error("Operation failed: " .. tostring(err))
end
