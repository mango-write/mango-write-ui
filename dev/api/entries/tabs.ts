import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "tabs",
  component: "Tabs",
  title: { zh: "标签页", en: "Tabs" },
  importPath: "@mango-write/ui",
  exports: ["Tabs", "TabList", "Tab", "TabPanels", "TabPanel"],
  rows: [
    {
      name: "Tabs v-model:value",
      kind: "prop",
      type: "string | number",
      desc: {
        zh: "当前激活的页签值（亦兼容 <code>v-model</code>）",
        en: "The active tab value (<code>v-model</code> also works)",
      },
    },
    {
      name: "Tabs orientation",
      kind: "prop",
      type: "horizontal · vertical",
      desc: {
        zh: "排列方向，默认 <code>horizontal</code>",
        en: "Layout direction, default <code>horizontal</code>",
      },
    },
    {
      name: "Tab value",
      kind: "prop",
      type: "string | number",
      desc: {
        zh: "页签唯一标识，与对应 <code>TabPanel</code> 配对",
        en: "Unique tab id, paired with its <code>TabPanel</code>",
      },
    },
    {
      name: "Tab disabled",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "禁用该页签，键盘导航自动跳过",
        en: "Disables the tab; keyboard navigation skips it",
      },
    },
  ],
};
