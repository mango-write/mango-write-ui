import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const coreDistDts = join(root, "..", "core", "dist", "index.d.ts");

if (!existsSync(coreDistDts)) {
  await import(pathToFileURL(join(root, "..", "core", "scripts", "build.mjs")).href);
}
