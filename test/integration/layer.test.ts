import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { ServerContext } from "../../src/context.js";
import { initContext } from "../setup.js";
import { assertSuccess, assertError, TestCleanup } from "../helpers.js";
import { handleCreateSprite } from "../../src/handlers/sprite-handlers.js";
import {
  handleAddLayer,
  handleListLayers,
} from "../../src/handlers/layer-handlers.js";

describe("Layer handlers", () => {
  let ctx: ServerContext;
  const cleanup = new TestCleanup();

  beforeAll(async () => {
    ctx = await initContext();
  });

  afterEach(() => {
    cleanup.run();
  });

  it("adds a layer to a sprite", async () => {
    const spritePath = cleanup.track("test_add_layer.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleAddLayer(ctx, {
      inputPath: spritePath,
      name: "TestLayer",
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.layerName).toBe("TestLayer");
  });

  it("lists layers", async () => {
    const spritePath = cleanup.track("test_list_layers.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleListLayers(ctx, { inputPath: spritePath });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.layers).toBeInstanceOf(Array);
    expect(data.count).toBeGreaterThan(0);
  });

  it("returns error for missing inputPath", async () => {
    const res = await handleAddLayer(ctx, { name: "Test" });
    assertError(res);
  });

  it("returns error for invalid path", async () => {
    const res = await handleListLayers(ctx, { inputPath: "../../escape" });
    assertError(res);
  });
});
