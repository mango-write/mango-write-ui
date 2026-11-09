import { describe, expect, it } from "vitest";
import { buildSearchIndex, searchDocs, scoreItem } from "./search";

describe("searchDocs", () => {
  it("索引覆盖全部文档页,组件带接口关键词", () => {
    const items = buildSearchIndex();
    expect(items.length).toBeGreaterThanOrEqual(60);
    const button = items.find((i) => i.url.endsWith("/components/button"));
    expect(button).toBeDefined();
    expect(button!.keywords).toContain("variant");
    expect(button!.keywords).toContain("rounded");
  });

  it("标题命中排在关键词命中之前", () => {
    const hits = searchDocs("button");
    expect(hits[0].item.en).toBe("Button");
  });

  it("多词是 AND 语义:一个词不命中即整条落选", () => {
    expect(searchDocs("button 表格里才有词")).toHaveLength(0);
  });

  it("中文与属性名都能检索", () => {
    expect(searchDocs("按钮")[0]?.item.en).toBe("Button");
    // v-model:open 是多个浮层组件(Dialog/Popover/ActionMenu…)的公共接口行,
    // 平分命中按 url 序决胜,断言「能检索到 Dialog」而非「排第一」。
    expect(searchDocs("v-model:open").map((h) => h.item.en)).toContain("Dialog");
    expect(searchDocs("useNotify")[0]?.item.en).toBe("Toast");
  });

  it("空查询返回空", () => {
    expect(searchDocs("   ")).toHaveLength(0);
  });

  it("scoreItem 空串为 0", () => {
    const item = buildSearchIndex()[0];
    expect(scoreItem(item, "")).toBe(0);
  });
});
