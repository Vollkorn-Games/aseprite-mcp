import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { ServerContext } from "../../src/context.js";
import { initContext } from "../setup.js";
import { assertSuccess, assertError, TestCleanup } from "../helpers.js";
import { handleCreateSprite } from "../../src/handlers/sprite-handlers.js";
import { handleAddFrame } from "../../src/handlers/frame-handlers.js";
import {
  handleCreateTag,
  handleListTags,
  handleSetTagProperties,
} from "../../src/handlers/tag-handlers.js";

describe("Tag handlers", () => {
  let ctx: ServerContext;
  const cleanup = new TestCleanup();

  beforeAll(async () => {
    ctx = await initContext();
  });

  afterEach(() => {
    cleanup.run();
  });

  it("creates a tag", async () => {
    const spritePath = cleanup.track("test_create_tag.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });
    // Add a few frames for the tag range
    await handleAddFrame(ctx, {
      inputPath: spritePath,
      outputPath: spritePath,
    });
    await handleAddFrame(ctx, {
      inputPath: spritePath,
      outputPath: spritePath,
    });

    const res = await handleCreateTag(ctx, {
      inputPath: spritePath,
      name: "idle",
      fromFrame: 1,
      toFrame: 3,
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.tagName).toBe("idle");
  });

  it("lists tags", async () => {
    const spritePath = cleanup.track("test_list_tags.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleListTags(ctx, { inputPath: spritePath });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.tags).toBeInstanceOf(Array);
  });

  it("sets tag properties", async () => {
    const spritePath = cleanup.track("test_set_tag_props.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });
    await handleAddFrame(ctx, {
      inputPath: spritePath,
      outputPath: spritePath,
    });
    await handleCreateTag(ctx, {
      inputPath: spritePath,
      name: "walk",
      fromFrame: 1,
      toFrame: 2,
      outputPath: spritePath,
    });

    const res = await handleSetTagProperties(ctx, {
      inputPath: spritePath,
      tagName: "walk",
      name: "run",
      aniDir: "pingpong",
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.tagName).toBe("run");
  });

  it("returns error for missing tag name on set_tag_properties", async () => {
    const res = await handleSetTagProperties(ctx, {
      inputPath: "/tmp/test.aseprite",
    });
    assertError(res);
  });

  it("returns error for missing name", async () => {
    const res = await handleCreateTag(ctx, {
      inputPath: "/tmp/test.aseprite",
    });
    assertError(res);
  });

  it("returns error for invalid path", async () => {
    const res = await handleListTags(ctx, {
      inputPath: "../escape",
    });
    assertError(res);
  });
});
