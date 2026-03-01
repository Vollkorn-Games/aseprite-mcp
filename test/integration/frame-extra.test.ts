import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { ServerContext } from "../../src/context.js";
import { initContext } from "../setup.js";
import { assertSuccess, assertError, TestCleanup } from "../helpers.js";
import { handleCreateSprite } from "../../src/handlers/sprite-handlers.js";
import { handleDuplicateFrame } from "../../src/handlers/frame-handlers.js";

describe("Frame extra handlers", () => {
  let ctx: ServerContext;
  const cleanup = new TestCleanup();

  beforeAll(async () => {
    ctx = await initContext();
  });

  afterEach(() => {
    cleanup.run();
  });

  it("duplicates a frame", async () => {
    const spritePath = cleanup.track("test_dup_frame.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleDuplicateFrame(ctx, {
      inputPath: spritePath,
      frameNumber: 1,
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.sourceFrame).toBe(1);
    expect(data.frameCount).toBe(2);
  });

  it("returns error for missing inputPath", async () => {
    const res = await handleDuplicateFrame(ctx, {});
    assertError(res);
  });
});
