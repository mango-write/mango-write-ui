import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "tabs",
  component: "Tabs",
  title: { zh: "标签页", en: "Tabs" },
  importPath: "@mango-write/ui-vue",
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
      name: "TabList hideWhenSingle",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "当列表内仅包含 1 个页签时自动隐藏标签栏（默认 <code>false</code>），适用于单/多子视图自适应模块",
        en: "Auto-hides the tab bar when only 1 tab is rendered (default <code>false</code>), useful for single-vs-multi subview modules",
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
      name: "Tab badge",
      kind: "prop",
      type: "string | number",
      desc: {
        zh: "页签右侧等宽胶囊计数或简短状态角标，激活态自动切换主色柔和底",
        en: "Tabular pill badge rendered on the trailing side of the tab; switches to accent tint when active",
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
