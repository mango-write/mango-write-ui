import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "app-logo",
  component: "AppLogo",
  title: "品牌标识",
  importPath: "@mango-write/ui",
  rows: [
    { name: "markOnly", kind: "prop", type: "boolean", desc: "仅渲染左侧芒果图形标并收缩 SVG viewBox，默认 <code>false</code>" },
  ],
};
