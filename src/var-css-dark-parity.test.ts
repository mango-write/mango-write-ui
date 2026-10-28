import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// 深色 token 的两处入口必须逐条一致（issue #110 · P6）：
//   1. `:root[data-theme="dark"]`——JS 落定属性后的主入口；
//   2. `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`
//      ——首帧兜底（属性落定前深色系统用户不闪白）。
// CSS 没有原生的「一处声明两处引用」，这两块只能并列存在；本测试把
// 「同源」变成机器约束：任何一侧改了深色值而另一侧没跟，这里就红。
// 剥注释后再解析：选择器名在文件头注释里也出现，直接 indexOf 会抓到注释块。
const varCss = readFileSync(
  fileURLToPath(new URL("./var.css", import.meta.url)),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

function extractBlock(selector: string): Map<string, string> {
  const start = varCss.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = varCss.indexOf("{", start);
  let depth = 1;
  let end = open + 1;
  while (depth > 0 && end < varCss.length) {
    if (varCss[end] === "{") depth += 1;
    else if (varCss[end] === "}") depth -= 1;
    end += 1;
  }
  const body = varCss.slice(open + 1, end - 1);
  const decls = new Map<string, string>();
  for (const raw of body.split(";")) {
    const line = raw.trim();
    if (!line || line.startsWith("/*") || line.startsWith("*")) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    decls.set(
      line.slice(0, colon).trim(),
      line.slice(colon + 1).trim().replace(/\s+/g, " "),
    );
  }
  return decls;
}

describe("var.css 深色双入口一致性（issue #110 · P6）", () => {
  const attrBlock = extractBlock(':root[data-theme="dark"]');
  const mediaBlock = extractBlock(":root:not([data-theme=\"light\"])");

  it("两块都存在且非空", () => {
    expect(attrBlock.size).toBeGreaterThan(50);
    expect(mediaBlock.size).toBeGreaterThan(50);
  });

  it("声明键集合完全一致", () => {
    expect([...mediaBlock.keys()].sort()).toEqual([...attrBlock.keys()].sort());
  });

  it("同名声明的值逐条一致", () => {
    const mismatches: string[] = [];
    for (const [key, value] of attrBlock) {
      if (mediaBlock.get(key) !== value) {
        mismatches.push(`${key}: attr=${value} media=${mediaBlock.get(key)}`);
      }
    }
    expect(mismatches).toEqual([]);
  });
});

function luminance(hex: string): number {
  const channels = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)?.slice(1);
  if (!channels) throw new Error(`expected six-digit hex color: ${hex}`);
  const [r, g, b] = channels.map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string): number {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

describe("filled 品牌面正文对比度", () => {
  it.each([
    ["浅色", extractBlock(":root {")],
    ["深色", extractBlock(':root[data-theme="dark"]')],
  ])("%s达到 WCAG AA", (_name, block) => {
    const foreground = block.get("--color-text-on-brand")!;
    const background = block.get("--color-brand-500")!;
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
