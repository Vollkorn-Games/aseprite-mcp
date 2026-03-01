import type { ChildProcess } from "child_process";
import type { OperationParams, ToolResponse } from "./types.js";

export const PARAMETER_MAPPINGS: Record<string, string> = {
  input_path: "inputPath",
  output_path: "outputPath",
  color_mode: "colorMode",
  layer_name: "layerName",
  layer_index: "layerIndex",
  blend_mode: "blendMode",
  frame_number: "frameNumber",
  frame_duration: "frameDuration",
  from_frame: "fromFrame",
  to_frame: "toFrame",
  tag_name: "tagName",
  palette_index: "paletteIndex",
  sheet_type: "sheetType",
  sheet_width: "sheetWidth",
  sheet_height: "sheetHeight",
  border_padding: "borderPadding",
  shape_padding: "shapePadding",
  inner_padding: "innerPadding",
  file_path: "filePath",
  data_path: "dataPath",
  ani_dir: "aniDir",
  flip_type: "flipType",
};

export const REVERSE_PARAMETER_MAPPINGS: Record<string, string> = {};
for (const [snakeCase, camelCase] of Object.entries(PARAMETER_MAPPINGS)) {
  REVERSE_PARAMETER_MAPPINGS[camelCase] = snakeCase;
}

export function logDebug(debugMode: boolean, message: string): void {
  if (debugMode) {
    console.error(`[DEBUG] ${message}`);
  }
}

/** Kill a child process and wait for it to exit (with a timeout fallback). */
export function killProcess(
  proc: ChildProcess,
  timeoutMs = 3000,
): Promise<void> {
  return new Promise((resolve) => {
    if (!proc.pid || proc.exitCode !== null) {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      resolve();
    }, timeoutMs);
    proc.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
    proc.kill();
  });
}

export function createErrorResponse(
  message: string,
  possibleSolutions: string[] = [],
): ToolResponse {
  console.error(`[SERVER] Error response: ${message}`);
  if (possibleSolutions.length > 0) {
    console.error(
      `[SERVER] Possible solutions: ${possibleSolutions.join(", ")}`,
    );
  }

  const response: ToolResponse = {
    content: [
      {
        type: "text",
        text: message,
      },
    ],
    isError: true,
  };

  if (possibleSolutions.length > 0) {
    response.content.push({
      type: "text",
      text: "Possible solutions:\n- " + possibleSolutions.join("\n- "),
    });
  }

  return response;
}

export function validatePath(path: string): boolean {
  if (!path || path.includes("..")) {
    return false;
  }
  return true;
}

export function normalizeParameters(params: OperationParams): OperationParams {
  const result: OperationParams = {};

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      let normalizedKey = key;

      if (key.includes("_") && PARAMETER_MAPPINGS[key]) {
        normalizedKey = PARAMETER_MAPPINGS[key];
      }

      if (
        typeof params[key] === "object" &&
        params[key] !== null &&
        !Array.isArray(params[key])
      ) {
        result[normalizedKey] = normalizeParameters(
          params[key] as OperationParams,
        );
      } else {
        result[normalizedKey] = params[key];
      }
    }
  }

  return result;
}

export function convertCamelToSnakeCase(
  params: OperationParams,
): OperationParams {
  const result: OperationParams = {};

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const snakeKey =
        REVERSE_PARAMETER_MAPPINGS[key] ??
        key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

      if (
        typeof params[key] === "object" &&
        params[key] !== null &&
        !Array.isArray(params[key])
      ) {
        result[snakeKey] = convertCamelToSnakeCase(
          params[key] as OperationParams,
        );
      } else {
        result[snakeKey] = params[key];
      }
    }
  }

  return result;
}
