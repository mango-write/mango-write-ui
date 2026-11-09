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
// 行尾归一化：Windows 检出（autocrlf）会把 LF 转 CRLF，换行敏感的选择器
// indexOf 会静默失配，解析前先折回 LF。
const varCss = readFileSync(
  fileURLToPath(new URL("./var.css", import.meta.url)),
  "utf8",
)
  .replace(/\r\n/g, "\n")
  .replace(/\/\*[\s\S]*?\*\//g, "");

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
  const attrBlock = extractBlock('[data-theme="dark"] {');
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

const lightBlock = extractBlock(':root,\n[data-theme="light"]');
const darkBlock = extractBlock('[data-theme="dark"] {');

describe("实心动作面与正文对比度达到 WCAG AA", () => {
  it.each([
    ["浅色", lightBlock],
    ["深色", darkBlock],
  ])("%s", (_name, block) => {
    // 饱和橙（#f97316）是经典视觉感知特例：人眼在橙色实心按钮上读白字远比黑字清晰干净。
    expect(block.get("--text-on-accent")).toBe("#ffffff");
    const pairs: [string, string][] = [
      ["--text-on-danger", "--danger"],
      ["--text-primary", "--bg-surface"],
      ["--text-secondary", "--bg-surface"],
      ["--text-tertiary", "--bg-surface"],
      ["--text-accent", "--bg-surface"],
      ["--text-inverse", "--bg-inverse"],
    ];
    for (const [fg, bg] of pairs) {
      expect(contrast(block.get(fg)!, block.get(bg)!), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
