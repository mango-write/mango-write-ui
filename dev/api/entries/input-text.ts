import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "input-text",
  component: "InputText",
  title: "文本框",
  importPath: "@mango-write/ui",
  rows: [
    { name: "v-model", kind: "prop", type: "string", desc: "输入法组合期间不回写，组合结束一次提交" },
    { name: "size", kind: "prop", type: "xs · sm · md · lg", desc: "不传则跟随密度上下文" },
    { name: "invalid / disabled / readonly", kind: "prop", type: "boolean", desc: "状态；错误说明由 <code>FormField</code> 负责" },
    { name: "fluid", kind: "prop", type: "boolean", desc: "撑满父容器宽度" },
  ],
  examples: [
    { title: "基本用法", code: "<script setup lang=\"ts\">\nimport { ref } from \"vue\";\nimport { InputText } from \"@mango-write/ui\";\n\nconst title = ref(\"\");\n</script>\n\n<template>\n  <InputText v-model=\"title\" placeholder=\"论文标题\" fluid />\n</template>" },
  ],
};
