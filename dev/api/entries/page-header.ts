import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "page-header",
  component: "PageHeader",
  title: "页头",
  importPath: "@mango-write/ui",
  rows: [
    { name: "title", kind: "prop", type: "string", desc: "页面一级标题（必填）" },
    { name: "#icon", kind: "slot", type: "slot", desc: "标题左侧 32×32 品牌色淡底图标槽" },
    { name: "#actions", kind: "slot", type: "slot", desc: "右侧操作按钮区" },
  ],
};
