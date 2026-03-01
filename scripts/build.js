import { cpSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const srcScripts = join(root, "src", "scripts");
const buildScripts = join(root, "build", "scripts");

// Ensure build/scripts/ exists
mkdirSync(buildScripts, { recursive: true });

// Copy all Lua scripts to build/scripts/
cpSync(srcScripts, buildScripts, { recursive: true });

console.log("Copied Lua scripts to build/scripts/");
