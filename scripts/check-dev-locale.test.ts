import { describe, expect, it } from "vitest";
// @ts-expect-error -- 纯 JS 门禁脚本，无类型声明
import { scanText } from "./check-dev-locale.mjs";

describe("展示站裸中文门禁", () => {
  it("全站零裸中文（Bi 值与注释除外）", () => {
    // 直接以源码形态自检:scanText 应放过 Bi 字面量与注释,拦下裸文案。
    const biRecord = [
      "const s = {",
      '  title: { zh: "按钮", en: "Button" },',
      "  // 注释里的中文不算",
      "} as const;",
      "<!-- 注释里的中文也不算 -->",
    ].join("\n");
    expect(scanText(biRecord)).toEqual([]);

    const raw = [
      "<template>",
      '  <Button label="保存修改" />',
      "  <p>纯中文段落</p>",
      "</template>",
    ].join("\n");
    expect(scanText(raw)).toEqual([2, 3]);
  });

  it("i18n-allow 行内与块级放行", () => {
    const inline = 'const x = "终端示意" /* i18n-allow */;';
    expect(scanText(inline)).toEqual([]);

    const block = [
      "<!-- i18n-allow:start -->",
      "<pre>",
      "| 名称 | 取值 | 说明 |",
      "</pre>",
      "<!-- i18n-allow:end -->",
    ].join("\n");
    expect(scanText(block)).toEqual([]);
  });

  it("URL 与字符串内的 // 不吞掉后续代码", () => {
    const line = 'const url = "https://example.com"; // 中文注释';
    expect(scanText(line)).toEqual([]);
    const tricky = 'const a = fetch("https://x.cn"); const b = "结果";';
    expect(scanText(tricky)).toEqual([1]);
  });
});
