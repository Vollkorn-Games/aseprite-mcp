import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { existsSync } from "fs";
import type { ServerContext } from "../../src/context.js";
import { initContext } from "../setup.js";
import { assertSuccess, assertError, TestCleanup } from "../helpers.js";
import { handleCreateSprite } from "../../src/handlers/sprite-handlers.js";
import { handleDrawRect } from "../../src/handlers/drawing-handlers.js";
import {
  handleExportPng,
  handleExportSpritesheet,
} from "../../src/handlers/export-handlers.js";

describe("Export handlers", () => {
  let ctx: ServerContext;
  const cleanup = new TestCleanup();

  beforeAll(async () => {
    ctx = await initContext();
  });

  afterEach(() => {
    cleanup.run();
  });

  it("exports a sprite as PNG", async () => {
    const spritePath = cleanup.track("test_export_src.aseprite");
    const pngPath = cleanup.track("test_export.png");

    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });
    await handleDrawRect(ctx, {
      inputPath: spritePath,
      x: 2,
      y: 2,
      width: 12,
      height: 12,
      color: "#ff0000",
      outputPath: spritePath,
    });

    const res = await handleExportPng(ctx, {
      inputPath: spritePath,
      outputPath: pngPath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(existsSync(pngPath)).toBe(true);
  });

  it("exports a sprite sheet", async () => {
    const spritePath = cleanup.track("test_sheet_src.aseprite");
    const sheetPath = cleanup.track("test_sheet.png");
    const dataPath = cleanup.track("test_sheet.json");

    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleExportSpritesheet(ctx, {
      inputPath: spritePath,
      outputPath: sheetPath,
      dataPath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
  });

  it("returns error for missing outputPath", async () => {
    const res = await handleExportPng(ctx, {
      inputPath: "/tmp/test.aseprite",
    });
    assertError(res);
  });

  it("returns error for missing inputPath", async () => {
    const res = await handleExportPng(ctx, {
      outputPath: "/tmp/out.png",
    });
    assertError(res);
  });
});
