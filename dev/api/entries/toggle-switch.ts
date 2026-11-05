import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "toggle-switch",
  component: "ToggleSwitch",
  title: "开关",
  importPath: "@mango-write/ui",
  rows: [
    { name: "modelValue", kind: "prop", type: "boolean", desc: "开关状态（<code>v-model</code>），默认 <code>false</code>" },
    { name: "inputId / id / name", kind: "prop", type: "string", desc: "关联 <code><label></code> 与表单字段标识" },
    { name: "disabled / readonly", kind: "prop", type: "boolean", desc: "禁用或只读，阻断状态变更" },
    { name: "invalid / required", kind: "prop", type: "boolean", desc: "表单校验状态与必填标记" },
  ],
  examples: [
    { title: "基本用法", code: "<script setup lang=\"ts\">\nimport { ref } from \"vue\";\nimport { ToggleSwitch } from \"@mango-write/ui\";\n\nconst autosave = ref(true);\n</script>\n\n<template>\n  <ToggleSwitch v-model=\"autosave\" aria-label=\"自动保存\" />\n</template>" },
  ],
};
