import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(pkgRoot, "src");
const distDir = join(pkgRoot, "dist");

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

execFileSync("pnpm", ["exec", "tsc6", "-p", "tsconfig.build.json"], {
  cwd: pkgRoot,
  stdio: "inherit",
});

for (const file of ["var.css", "mobile-tokens.css", "base.css", "theme.css"]) {
  copyFileSync(join(srcDir, file), join(distDir, file));
}
copyFileSync(join(srcDir, "var.css"), join(distDir, "tokens.css"));

const srcComponentsDir = join(srcDir, "styles", "components");
const distComponentsDir = join(distDir, "styles", "components");
if (existsSync(srcComponentsDir)) {
  mkdirSync(distComponentsDir, { recursive: true });
  for (const name of readdirSync(srcComponentsDir)) {
    if (name.endsWith(".css")) {
      copyFileSync(join(srcComponentsDir, name), join(distComponentsDir, name));
    }
  }
}

const rawComponentsCss = readFileSync(join(srcDir, "components.css"), "utf8");
const inlinedComponentsCss = rawComponentsCss.replace(
  /@import\s+["']\.\/styles\/components\/([^"']+)["']\s*;/g,
  (_match, relName) => readFileSync(join(srcComponentsDir, relName), "utf8").trim(),
);
writeFileSync(join(distDir, "components.css"), `${inlinedComponentsCss.trim()}\n`, "utf8");
