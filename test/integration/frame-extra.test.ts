import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { ServerContext } from "../../src/context.js";
import { initContext } from "../setup.js";
import { assertSuccess, assertError, TestCleanup } from "../helpers.js";
import { handleCreateSprite } from "../../src/handlers/sprite-handlers.js";
import {
  handleDuplicateFrame,
  handleAddFrames,
  handleSetFrameDurations,
} from "../../src/handlers/frame-handlers.js";

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

  it("adds multiple frames at once", async () => {
    const spritePath = cleanup.track("test_add_frames.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleAddFrames(ctx, {
      inputPath: spritePath,
      count: 5,
      duration: 0.2,
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.framesAdded).toBe(5);
    expect(data.frameCount).toBe(6); // 1 original + 5 new
  });

  it("returns error for missing count on add_frames", async () => {
    const res = await handleAddFrames(ctx, {
      inputPath: "/tmp/test.aseprite",
    });
    assertError(res);
  });

  it("sets durations for multiple frames", async () => {
    const spritePath = cleanup.track("test_set_durations.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });
    await handleAddFrames(ctx, {
      inputPath: spritePath,
      count: 3,
      outputPath: spritePath,
    });

    const res = await handleSetFrameDurations(ctx, {
      inputPath: spritePath,
      durations: { "1": 0.1, "2": 0.2, "3": 0.5 },
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.framesUpdated).toBe(3);
  });

  it("returns error for missing durations on set_frame_durations", async () => {
    const res = await handleSetFrameDurations(ctx, {
      inputPath: "/tmp/test.aseprite",
    });
    assertError(res);
  });
});
