import { describe, expect, it } from "vitest";
// @ts-expect-error -- 纯 JS 门禁脚本，无类型声明
import { checkTokens, scanPiIcons } from "./check-tokens.mjs";

describe("设计 token 门禁", () => {
  it("组件样式零违规（未定义 / 旧名 / 色板 / 裸值 / 霜面实色 / 遗留图标）", () => {
    const violations = checkTokens() as { file: string; line: number; rule: string; detail: string }[];
    expect(violations.map((v) => `${v.file}:${v.line} ${v.rule} ${v.detail}`)).toEqual([]);
  });

  it("no-pi-icon 拦截 pi-* 类名与 primeicons 引用", () => {
    const sample = [
      '<template>',
      '  <span class="mw-icon pi pi-check" />',
      '</template>',
      '<style>',
      '@import "primeicons/primeicons.css";',
      '</style>',
    ].join("\n");
    expect(scanPiIcons("src/components/Sample.vue", sample)).toEqual([
      { file: "src/components/Sample.vue", line: 2, rule: "no-pi-icon", detail: "pi-check" },
      { file: "src/components/Sample.vue", line: 5, rule: "no-pi-icon", detail: "primeicons" },
    ]);
  });
});
