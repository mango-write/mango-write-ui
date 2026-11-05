import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "textarea",
  component: "Textarea",
  title: "多行文本",
  importPath: "@mango-write/ui",
  rows: [
    { name: "v-model", kind: "prop", type: "string", desc: "输入法组合期间不回写" },
    { name: "rows", kind: "prop", type: "number", desc: "初始行数，默认 3" },
    { name: "autoResize", kind: "prop", type: "boolean", desc: "随内容增高，关闭手动拖拽" },
    { name: "invalid / disabled / readonly", kind: "prop", type: "boolean", desc: "状态" },
  ],
  examples: [
    { title: "基本用法", code: "<script setup lang=\"ts\">\nimport { ref } from \"vue\";\nimport { Textarea } from \"@mango-write/ui\";\n\nconst abstract = ref(\"\");\n</script>\n\n<template>\n  <Textarea v-model=\"abstract\" :rows=\"4\" auto-resize placeholder=\"摘要\" />\n</template>" },
  ],
};
