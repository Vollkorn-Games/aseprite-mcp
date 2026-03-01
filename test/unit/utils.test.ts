import { describe, it, expect } from "vitest";
import {
  normalizeParameters,
  validatePath,
  createErrorResponse,
  convertCamelToSnakeCase,
} from "../../src/utils.js";

describe("normalizeParameters", () => {
  it("converts known snake_case keys to camelCase", () => {
    const result = normalizeParameters({
      input_path: "/path/to/file",
      output_path: "/path/to/output",
    });
    expect(result).toEqual({
      inputPath: "/path/to/file",
      outputPath: "/path/to/output",
    });
  });

  it("passes through camelCase keys unchanged", () => {
    const result = normalizeParameters({
      inputPath: "/path/to/file",
      width: 32,
    });
    expect(result).toEqual({
      inputPath: "/path/to/file",
      width: 32,
    });
  });

  it("normalizes nested objects", () => {
    const result = normalizeParameters({
      input_path: "/path",
      options: { color_mode: "rgb" },
    });
    expect(result).toEqual({
      inputPath: "/path",
      options: { colorMode: "rgb" },
    });
  });

  it("leaves unknown snake_case keys as-is", () => {
    const result = normalizeParameters({
      some_unknown_key: "value",
    });
    expect(result).toEqual({
      some_unknown_key: "value",
    });
  });

  it("preserves arrays", () => {
    const result = normalizeParameters({
      colors: ["#ff0000", "#00ff00"],
    });
    expect(result).toEqual({
      colors: ["#ff0000", "#00ff00"],
    });
  });
});

describe("convertCamelToSnakeCase", () => {
  it("converts known camelCase keys to snake_case", () => {
    const result = convertCamelToSnakeCase({
      inputPath: "/path/to/file",
      outputPath: "/path/to/output",
    });
    expect(result).toEqual({
      input_path: "/path/to/file",
      output_path: "/path/to/output",
    });
  });

  it("converts unknown camelCase keys using generic conversion", () => {
    const result = convertCamelToSnakeCase({
      someNewKey: "value",
    });
    expect(result).toEqual({
      some_new_key: "value",
    });
  });
});

describe("validatePath", () => {
  it("returns true for valid paths", () => {
    expect(validatePath("/home/user/sprites/test.aseprite")).toBe(true);
    expect(validatePath("/tmp/output.png")).toBe(true);
  });

  it("returns false for empty paths", () => {
    expect(validatePath("")).toBe(false);
  });

  it("returns false for paths with ..", () => {
    expect(validatePath("/home/user/../etc/passwd")).toBe(false);
    expect(validatePath("../../secret")).toBe(false);
  });
});

describe("createErrorResponse", () => {
  it("creates error response with message", () => {
    const response = createErrorResponse("Something went wrong");
    expect(response.isError).toBe(true);
    expect(response.content[0]!.text).toBe("Something went wrong");
    expect(response.content).toHaveLength(1);
  });

  it("includes possible solutions when provided", () => {
    const response = createErrorResponse("Error occurred", [
      "Try solution A",
      "Try solution B",
    ]);
    expect(response.isError).toBe(true);
    expect(response.content).toHaveLength(2);
    expect(response.content[1]!.text).toContain("Try solution A");
    expect(response.content[1]!.text).toContain("Try solution B");
  });
});
