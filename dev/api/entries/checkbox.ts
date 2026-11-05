import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "checkbox",
  component: "Checkbox",
  title: "复选框",
  importPath: "@mango-write/ui",
  rows: [
    { name: "modelValue", kind: "prop", type: "any | any[]", desc: "绑定值；传数组且未开启 <code>binary</code> 时按集合模式增删 <code>value</code>" },
    { name: "value", kind: "prop", type: "any", desc: "数组模式下的当前项值" },
    { name: "binary", kind: "prop", type: "boolean", desc: "单一布尔模式，在 <code>trueValue</code> 与 <code>falseValue</code> 间切换" },
    { name: "indeterminate", kind: "prop", type: "boolean", desc: "半选态（<code>aria-checked=\"mixed\"</code>），点击后进入选中态" },
    { name: "size", kind: "prop", type: "sm · md · lg", desc: "尺寸档位，默认 <code>md</code>" },
    { name: "disabled / readonly / invalid", kind: "prop", type: "boolean", desc: "禁用、只读与校验失败态" },
  ],
  examples: [
    { title: "基本用法", code: "<script setup lang=\"ts\">\nimport { ref } from \"vue\";\nimport { Checkbox } from \"@mango-write/ui\";\n\nconst agreed = ref(false);\n</script>\n\n<template>\n  <Checkbox v-model=\"agreed\" binary aria-label=\"同意许可条款\" />\n</template>" },
  ],
};
