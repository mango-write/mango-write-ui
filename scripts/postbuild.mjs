import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");
const distDir = join(root, "dist");

for (const cssFile of ["var.css", "base.css", "theme.css"]) {
  cpSync(join(srcDir, cssFile), join(distDir, cssFile));
}

const baseComponentsCss = readFileSync(join(srcDir, "components.css"), "utf8").trim();
const extractedComponentsCss = existsSync(join(distDir, "components.css"))
  ? readFileSync(join(distDir, "components.css"), "utf8").trim()
  : "";
const mergedComponentsCss = extractedComponentsCss.startsWith(baseComponentsCss)
  ? extractedComponentsCss
  : `${baseComponentsCss}\n${extractedComponentsCss}`;
writeFileSync(join(distDir, "components.css"), `${mergedComponentsCss}\n`);

function emitVueDeclarationBridges(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      emitVueDeclarationBridges(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".vue.d.ts")) {
      const stem = basename(entry.name, ".vue.d.ts");
      const bridgePath = join(dir, `${stem}.d.ts`);
      writeFileSync(
        bridgePath,
        `export { default } from "./${stem}.vue.js";\nexport * from "./${stem}.vue.js";\n`,
      );
    } else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
      const stem = basename(entry.name, ".d.ts");
      const jsPath = join(dir, `${stem}.js`);
      if (!existsSync(jsPath)) {
        writeFileSync(jsPath, "export {};\n");
      }
    }
  }
}

emitVueDeclarationBridges(distDir);
