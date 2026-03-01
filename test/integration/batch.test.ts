import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { ServerContext } from "../../src/context.js";
import { initContext } from "../setup.js";
import { assertSuccess, assertError, TestCleanup } from "../helpers.js";
import { handleCreateSprite } from "../../src/handlers/sprite-handlers.js";
import { handleExportPng } from "../../src/handlers/export-handlers.js";
import {
  handleBatchExport,
  handleBatchResize,
  handleImportSpritesheet,
} from "../../src/handlers/batch-handlers.js";

describe("Batch handlers", () => {
  let ctx: ServerContext;
  const cleanup = new TestCleanup();

  beforeAll(async () => {
    ctx = await initContext();
  });

  afterEach(() => {
    cleanup.run();
  });

  it("batch exports frames", async () => {
    const spritePath = cleanup.track("test_batch_export.aseprite");
    const outPattern = cleanup.track("test_batch_{frame}.png");

    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleBatchExport(ctx, {
      inputPath: spritePath,
      outputPattern: outPattern,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.exportedCount).toBeGreaterThan(0);
  });

  it("batch resizes sprites", async () => {
    const spritePath = cleanup.track("test_batch_resize.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleBatchResize(ctx, {
      inputPaths: [spritePath],
      scale: 2,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.count).toBe(1);
  });

  it("imports a spritesheet", async () => {
    const spritePath = cleanup.track("test_import_src.aseprite");
    const pngPath = cleanup.track("test_import_sheet.png");
    const outputPath = cleanup.track("test_import_result.aseprite");

    // Create a small sprite and export as PNG to use as "spritesheet"
    await handleCreateSprite(ctx, {
      width: 32,
      height: 16,
      outputPath: spritePath,
    });
    await handleExportPng(ctx, {
      inputPath: spritePath,
      outputPath: pngPath,
    });

    const res = await handleImportSpritesheet(ctx, {
      imagePath: pngPath,
      outputPath,
      frameWidth: 16,
      frameHeight: 16,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.frameCount).toBe(2);
    expect(data.cols).toBe(2);
    expect(data.rows).toBe(1);
  });

  it("returns error for missing outputPattern", async () => {
    const res = await handleBatchExport(ctx, {
      inputPath: "/tmp/test.aseprite",
    });
    assertError(res);
  });

  it("returns error for missing inputPaths", async () => {
    const res = await handleBatchResize(ctx, { scale: 2 });
    assertError(res);
  });

  it("returns error for missing frameWidth", async () => {
    const res = await handleImportSpritesheet(ctx, {
      imagePath: "/tmp/test.png",
      outputPath: "/tmp/out.aseprite",
    });
    assertError(res);
  });
});
