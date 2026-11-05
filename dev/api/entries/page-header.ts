import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "page-header",
  component: "PageHeader",
  title: { zh: "页头", en: "Page header" },
  importPath: "@mango-write/ui",
  rows: [
    {
      name: "title",
      kind: "prop",
      type: "string",
      desc: {
        zh: "页面一级标题（必填）",
        en: "Page title (required)",
      },
    },
    {
      name: "#icon",
      kind: "slot",
      type: "slot",
      desc: {
        zh: "标题左侧 32×32 品牌色淡底图标槽",
        en: "32×32 brand-tinted icon slot to the left of the title",
      },
    },
    {
      name: "#actions",
      kind: "slot",
      type: "slot",
      desc: {
        zh: "右侧操作按钮区",
        en: "Action button area on the right",
      },
    },
  ],
};
