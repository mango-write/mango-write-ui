import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compileWxssTokens } from "./compiler/wxss-tokens.js";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const coreRoot = join(pkgRoot, "..", "core");
const stylesDir = join(pkgRoot, "src", "styles");
const pkgJson = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8"));

const readUtf8Lf = (filePath: string): string => readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

function readCssWithImports(filePath: string): string {
  return readUtf8Lf(filePath).replace(/^@import\s+["'](.+?)["'];?\s*$/gm, (_match, request: string) =>
    readCssWithImports(join(dirname(filePath), request)),
  );
}

function buildExpectedStylesWxss(): { tokensWxss: string; stylesWxss: string } {
  const varCss = readUtf8Lf(join(coreRoot, "src", "var.css"));
  const mobileTokensCss = readUtf8Lf(join(coreRoot, "src", "mobile-tokens.css"));
  const compiled = compileWxssTokens(varCss, mobileTokensCss);
  const baseWxss = readUtf8Lf(join(stylesDir, "mp-base.css")).replace(
    /\.mw-mp-root\s*,[\s\S]*?\.mw-mp-root \*::after\s*\{([\s\S]*?)\}\n\n/,
    ".mw-mp-root {$1}\n\n",
  );
  const componentsWxss = readCssWithImports(join(stylesDir, "mp-components.css")).replace(
    /\s*\.mw-mp-root \*,\s*\.mw-mp-root \*::before,\s*\.mw-mp-root \*::after\s*\{[\s\S]*?\}\n/g,
    "",
  );
  return {
    tokensWxss: compiled.wxss,
    stylesWxss: [compiled.wxss.trim(), baseWxss.trim(), componentsWxss.trim()].join("\n\n") + "\n",
  };
}

describe("@mango-write/ui-mp package exports & built styles", () => {
  it("keeps exports and publishConfig.exports keys 1:1 aligned", () => {
    const exportKeys = Object.keys(pkgJson.exports ?? {}).sort();
    const publishKeys = Object.keys(pkgJson.publishConfig?.exports ?? {}).sort();
    expect(exportKeys).toEqual(publishKeys);
  });

  it("keeps source WXSS artifacts fresh, free of illegal wcsc selectors, and compilable by wcsc", () => {
    const expected = buildExpectedStylesWxss();
    const srcTokensWxss = readUtf8Lf(join(stylesDir, "mp-tokens.wxss"));
    const srcStylesWxssPath = join(stylesDir, "mp-styles.wxss");
    const srcStylesWxss = readUtf8Lf(srcStylesWxssPath);

    expect(srcTokensWxss).toBe(expected.tokensWxss);
    expect(srcStylesWxss).toBe(expected.stylesWxss);
    expect(srcStylesWxss).not.toMatch(/\.mw-mp-root\s*,\s*\.mw-size-xs/);
    expect(srcStylesWxss).not.toContain(":root");
    expect(srcStylesWxss).not.toContain("[data-theme");

    const withoutComments = srcStylesWxss.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const match of withoutComments.matchAll(/([^{}]+)\{/g)) {
      const selector = match[1]!.trim();
      if (!selector.startsWith("@")) {
        expect(selector).not.toContain("*");
      }
    }

    const distTokensWxss = join(pkgRoot, "dist", "mp-tokens.wxss");
    if (existsSync(distTokensWxss)) {
      expect(existsSync(join(pkgRoot, "dist", "mp-styles.css"))).toBe(true);
      expect(existsSync(join(pkgRoot, "dist", "mp-styles.wxss"))).toBe(true);
      expect(existsSync(join(pkgRoot, "dist", "mp-base.wxss"))).toBe(true);
      expect(existsSync(join(pkgRoot, "dist", "mp-components.wxss"))).toBe(true);
      expect(readFileSync(join(pkgRoot, "dist", "mp-styles.wxss"), "utf8")).toBe(srcStylesWxss);
    }

    const wcscBin =
      process.env.WECHAT_WCSC_BIN ??
      "/Applications/wechatwebdevtools.app/Contents/Resources/app.asar.unpacked/node_modules/wcc-exec/wcsc";
    if (existsSync(wcscBin)) {
      const output = execFileSync(wcscBin, ["-js", srcStylesWxssPath], { encoding: "utf8" });
      expect(output.length).toBeGreaterThan(0);
    }
  });
});
