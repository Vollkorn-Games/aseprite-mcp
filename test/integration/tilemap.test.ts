import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { ServerContext } from "../../src/context.js";
import { initContext } from "../setup.js";
import { assertSuccess, assertError, TestCleanup } from "../helpers.js";
import { handleCreateSprite } from "../../src/handlers/sprite-handlers.js";
import {
  handleCreateTilemapLayer,
  handleGetTilesetInfo,
} from "../../src/handlers/tilemap-handlers.js";

describe("Tilemap handlers", () => {
  let ctx: ServerContext;
  const cleanup = new TestCleanup();

  beforeAll(async () => {
    ctx = await initContext();
  });

  afterEach(() => {
    cleanup.run();
  });

  it("creates a tilemap layer", async () => {
    const spritePath = cleanup.track("test_tilemap.aseprite");
    await handleCreateSprite(ctx, {
      width: 64,
      height: 64,
      outputPath: spritePath,
    });

    const res = await handleCreateTilemapLayer(ctx, {
      inputPath: spritePath,
      name: "Ground",
      tileWidth: 16,
      tileHeight: 16,
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.layerName).toBe("Ground");
  });

  it("gets tileset info", async () => {
    const spritePath = cleanup.track("test_tileset_info.aseprite");
    await handleCreateSprite(ctx, {
      width: 64,
      height: 64,
      outputPath: spritePath,
    });
    await handleCreateTilemapLayer(ctx, {
      inputPath: spritePath,
      tileWidth: 16,
      tileHeight: 16,
      outputPath: spritePath,
    });

    const res = await handleGetTilesetInfo(ctx, {
      inputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
  });

  it("returns error for missing inputPath", async () => {
    const res = await handleCreateTilemapLayer(ctx, {});
    assertError(res);
  });

  it("returns error for invalid path", async () => {
    const res = await handleGetTilesetInfo(ctx, {
      inputPath: "../escape",
    });
    assertError(res);
  });
});
