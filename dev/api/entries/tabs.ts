import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "tabs",
  component: "Tabs",
  title: "标签页",
  importPath: "@mango-write/ui",
  exports: ["Tabs","TabList","Tab","TabPanels","TabPanel"],
  rows: [
    { name: "Tabs v-model:value", kind: "prop", type: "string | number", desc: "当前激活的页签值（亦兼容 <code>v-model</code>）" },
    { name: "Tabs orientation", kind: "prop", type: "horizontal · vertical", desc: "排列方向，默认 <code>horizontal</code>" },
    { name: "Tab value", kind: "prop", type: "string | number", desc: "页签唯一标识，与对应 <code>TabPanel</code> 配对" },
    { name: "Tab disabled", kind: "prop", type: "boolean", desc: "禁用该页签，键盘导航自动跳过" },
  ],
  examples: [
    { title: "基本用法", code: "<script setup lang=\"ts\">\nimport { ref } from \"vue\";\nimport { Tab, TabList, TabPanel, TabPanels, Tabs } from \"@mango-write/ui\";\n\nconst active = ref(\"draft\");\n</script>\n\n<template>\n  <Tabs v-model:value=\"active\">\n    <TabList>\n      <Tab value=\"draft\">草稿</Tab>\n      <Tab value=\"refs\">文献</Tab>\n    </TabList>\n    <TabPanels>\n      <TabPanel value=\"draft\">草稿内容</TabPanel>\n      <TabPanel value=\"refs\">文献内容</TabPanel>\n    </TabPanels>\n  </Tabs>\n</template>" },
  ],
};
