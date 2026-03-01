import { resolve } from "path";
import { existsSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { ServerContext } from "../src/context.js";
import { detectAsepritePath, setAsepritePath } from "../src/aseprite-path.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export const FIXTURE_PATH = resolve(__dirname, "fixture");
export const OPERATIONS_SCRIPT = resolve(
  __dirname,
  "..",
  "src",
  "scripts",
  "operations.lua",
);

/** Scan common directories for any Aseprite executable. */
function findAsepriteExecutable(): string | null {
  if (process.platform !== "win32") return null;
  const dirs = [
    "C:\\Program Files\\Aseprite",
    "C:\\Program Files (x86)\\Aseprite",
    "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Aseprite",
  ];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir);
    const exe = files.find(
      (f) => f.toLowerCase().startsWith("aseprite") && f.endsWith(".exe"),
    );
    if (exe) return resolve(dir, exe);
  }
  return null;
}

export function createTestContext(): ServerContext {
  return new ServerContext({ debugMode: false }, OPERATIONS_SCRIPT);
}

export async function initContext(): Promise<ServerContext> {
  const ctx = createTestContext();
  await detectAsepritePath(ctx);

  // If standard detection failed, try scanning directories for versioned names
  if (!ctx.asepritePath || !existsSync(ctx.asepritePath)) {
    const found = findAsepriteExecutable();
    if (found) {
      await setAsepritePath(ctx, found);
    }
  }

  if (!ctx.asepritePath) {
    throw new Error(
      "Aseprite not found. Set ASEPRITE_PATH or install Aseprite in a standard location.",
    );
  }
  return ctx;
}
