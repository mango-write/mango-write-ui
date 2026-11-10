import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const srcDir = dirname(fileURLToPath(import.meta.url));

function collectTsFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectTsFiles(full));
    } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      results.push(full);
    }
  }
  return results;
}

const FORBIDDEN_IMPORTS = [
  /^vue(\/.*)?$/,
  /^vue-i18n(\/.*)?$/,
  /^vue-router(\/.*)?$/,
  /^react(\/.*)?$/,
  /^react-dom(\/.*)?$/,
  /^reka-ui(\/.*)?$/,
  /^@tanstack\/.*$/,
  /^lucide-.*$/,
  /^@mango-write\/ui-vue(\/.*)?$/,
  /^@mango-write\/ui-react(\/.*)?$/,
  /^@mango-write\/ui-mp(\/.*)?$/,
];

const FORBIDDEN_DOM_GLOBALS = [
  /\bwindow\./,
  /\bdocument\./,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bnavigator\./,
  /\bmatchMedia\s*\(/,
  /\bMutationObserver\b/,
  /\bResizeObserver\b/,
  /\bIntersectionObserver\b/,
  /\bHTMLElement\b/,
  /\bHTMLInputElement\b/,
];

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

describe("@mango-write/ui-core 纯净度门禁", () => {
  it("不包含任何框架绑定或第三方视图组件依赖", () => {
    const files = collectTsFiles(srcDir);
    expect(files.length).toBeGreaterThan(0);

    const violations: string[] = [];
    const importRegex = /(?:import|export)\s+(?:type\s+)?(?:[^"']*from\s+)?["']([^"']+)["']/g;

    for (const file of files) {
      const content = readFileSync(file, "utf8");
      let match: RegExpExecArray | null;
      while ((match = importRegex.exec(content)) !== null) {
        const spec = match[1]!;
        if (FORBIDDEN_IMPORTS.some((re) => re.test(spec))) {
          violations.push(`${file}: forbidden import "${spec}"`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("不直接访问浏览器 DOM / Storage / Observer 全局对象", () => {
    const files = collectTsFiles(srcDir);
    const violations: string[] = [];

    for (const file of files) {
      const clean = stripComments(readFileSync(file, "utf8"));
      for (const pattern of FORBIDDEN_DOM_GLOBALS) {
        const m = pattern.exec(clean);
        if (m) {
          violations.push(`${file}: forbidden DOM global "${m[0]}"`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
