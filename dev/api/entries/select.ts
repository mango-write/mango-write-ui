import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "select",
  component: "Select",
  title: "下拉选择",
  importPath: "@mango-write/ui",
  rows: [
    { name: "options / optionLabel / optionValue / optionDisabled", kind: "prop", type: "string | ((opt) => any)", desc: "候选数组与字段取值访问器" },
    { name: "filter / filterPlaceholder", kind: "prop", type: "boolean / string", desc: "在浮层面板顶部开启过滤输入框" },
    { name: "showClear / allowEmpty", kind: "prop", type: "boolean", desc: "显示清空按钮；<code>allowEmpty=false</code> 时禁止清空" },
    { name: "editable", kind: "prop", type: "boolean", desc: "触发器变为文本输入框，既可选列表项也可自由输入" },
    { name: "size / fluid", kind: "prop", type: "xs · sm · md · lg / boolean", desc: "尺寸档位与是否撑满父容器宽度" },
    { name: "loading / disabled / readonly / invalid", kind: "prop", type: "boolean", desc: "加载旋转指示、禁用、只读与错误态" },
    { name: "#value / #option / #header / #empty", kind: "slot", type: "插槽", desc: "自定义已选展示、选项行、面板头部与空态文案" },
  ],
  examples: [
    { title: "基本用法", code: "<script setup lang=\"ts\">\nimport { ref } from \"vue\";\nimport { Select } from \"@mango-write/ui\";\n\nconst section = ref();\nconst sections = [\n  { label: \"材料与方法\", value: \"methods\" },\n  { label: \"实验结果\", value: \"results\" },\n];\n</script>\n\n<template>\n  <Select\n    v-model=\"section\"\n    :options=\"sections\"\n    option-label=\"label\"\n    option-value=\"value\"\n    placeholder=\"选择章节\"\n  />\n</template>" },
  ],
};
