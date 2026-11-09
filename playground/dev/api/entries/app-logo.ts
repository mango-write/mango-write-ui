import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "app-logo",
  component: "AppLogo",
  title: { zh: "品牌标识", en: "App logo" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "markOnly",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "仅渲染左侧芒果图形标并收缩 SVG viewBox，默认 <code>false</code>",
        en: "Render only the mango mark and shrink the SVG viewBox; defaults to <code>false</code>",
      },
    },
  ],
};
