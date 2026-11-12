import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const coreRoot = join(pkgRoot, "..", "core");
const srcDir = join(pkgRoot, "src");
const stylesDir = join(srcDir, "styles");
const distDir = join(pkgRoot, "dist");

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
mkdirSync(stylesDir, { recursive: true });

const isWin = process.platform === "win32";
const pnpmBin = isWin ? "pnpm.cmd" : "pnpm";

// 1. Ensure @mango-write/ui-core is built first
execFileSync(process.execPath, [join(coreRoot, "scripts", "build.mjs")], {
  cwd: coreRoot,
  stdio: "inherit",
});

// 2. Build @mango-write/ui-mp ESM + declarations
execFileSync(pnpmBin, ["exec", "vite", "build"], {
  cwd: pkgRoot,
  stdio: "inherit",
  shell: isWin,
});

execFileSync(
  pnpmBin,
  ["exec", "vue-tsc", "--declaration", "--emitDeclarationOnly", "-p", "tsconfig.build.json"],
  {
    cwd: pkgRoot,
    stdio: "inherit",
    shell: isWin,
  },
);

// 3. Compile var.css + mobile-tokens.css -> mp-tokens.wxss / mp-tokens.css
const compilerUrl = pathToFileURL(join(distDir, "compiler", "wxss-tokens.js")).href;
const { compileWxssTokens } = await import(compilerUrl);
const varCss = readFileSync(join(coreRoot, "src", "var.css"), "utf8");
const mobileTokensCss = readFileSync(join(coreRoot, "src", "mobile-tokens.css"), "utf8");
const compiled = compileWxssTokens(varCss, mobileTokensCss);

writeFileSync(join(stylesDir, "mp-tokens.wxss"), compiled.wxss, "utf8");
writeFileSync(join(stylesDir, "mp-tokens.css"), compiled.css, "utf8");
writeFileSync(join(distDir, "mp-tokens.wxss"), compiled.wxss, "utf8");
writeFileSync(join(distDir, "mp-tokens.css"), compiled.css, "utf8");

// 4. Emit mp-base.{css,wxss}, mp-components.{css,wxss}, and combined mp-styles.{css,wxss}
const baseCss = readFileSync(join(stylesDir, "mp-base.css"), "utf8");
const baseWxss = baseCss.replace(
  /\.mw-mp-root\s*,[\s\S]*?\.mw-mp-root \*::after\s*\{([\s\S]*?)\}\n\n/,
  ".mw-mp-root {$1}\n\n",
);
function readCssWithImports(filePath) {
  return readFileSync(filePath, "utf8").replace(/^@import\s+["'](.+?)["'];?\s*$/gm, (_match, request) =>
    readCssWithImports(join(dirname(filePath), request)),
  );
}

const componentsCss = readCssWithImports(join(stylesDir, "mp-components.css"));
const componentsWxss = componentsCss.replace(
  /\s*\.mw-mp-root \*,\s*\.mw-mp-root \*::before,\s*\.mw-mp-root \*::after\s*\{[\s\S]*?\}\n/g,
  "",
);

copyFileSync(join(stylesDir, "mp-base.css"), join(distDir, "mp-base.css"));
writeFileSync(join(distDir, "mp-base.wxss"), baseWxss, "utf8");
copyFileSync(join(stylesDir, "mp-components.css"), join(distDir, "mp-components.css"));
writeFileSync(join(distDir, "mp-components.wxss"), componentsWxss, "utf8");

writeFileSync(
  join(distDir, "mp-styles.css"),
  [compiled.css.trim(), baseCss.trim(), componentsCss.trim()].join("\n\n") + "\n",
  "utf8",
);
const combinedWxss = [compiled.wxss.trim(), baseWxss.trim(), componentsWxss.trim()].join("\n\n") + "\n";
writeFileSync(join(stylesDir, "mp-styles.wxss"), combinedWxss, "utf8");
writeFileSync(join(distDir, "mp-styles.wxss"), combinedWxss, "utf8");
