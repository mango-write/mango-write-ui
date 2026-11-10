import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgJson = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8"));

describe("@mango-write/ui-mp package exports & built styles", () => {
  it("keeps exports and publishConfig.exports keys 1:1 aligned", () => {
    const exportKeys = Object.keys(pkgJson.exports ?? {}).sort();
    const publishKeys = Object.keys(pkgJson.publishConfig?.exports ?? {}).sort();
    expect(exportKeys).toEqual(publishKeys);
  });

  it("emits H5 and WXSS style bundles when built", () => {
    const distTokensWxss = join(pkgRoot, "dist", "mp-tokens.wxss");
    if (existsSync(distTokensWxss)) {
      expect(existsSync(join(pkgRoot, "dist", "mp-styles.css"))).toBe(true);
      expect(existsSync(join(pkgRoot, "dist", "mp-styles.wxss"))).toBe(true);
      expect(existsSync(join(pkgRoot, "dist", "mp-base.wxss"))).toBe(true);
      expect(existsSync(join(pkgRoot, "dist", "mp-components.wxss"))).toBe(true);
      const styles = readFileSync(join(pkgRoot, "dist", "mp-styles.wxss"), "utf8");
      expect(styles).not.toMatch(/\.mw-mp-root\s*,\s*\.mw-size-xs/);
      expect(styles).not.toContain(":root");
      expect(styles).not.toContain("[data-theme");
    }
  });
});
