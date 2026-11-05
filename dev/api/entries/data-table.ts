import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "data-table",
  component: "DataTable",
  title: "数据表格",
  importPath: "@mango-write/ui",
  exports: ["DataTable","Column"],
  rows: [
    { name: "size", kind: "prop", type: "xs · sm · md · lg", desc: "行高档；不传则行高 40px、字号跟随密度上下文" },
    { name: "rowHover", kind: "prop", type: "boolean", desc: "行 hover 叠层；有选择模式时自动开启" },
    { name: "stripedRows", kind: "prop", type: "boolean", desc: "斑马纹（极浅墨色）" },
    { name: "selection / selectionMode", kind: "prop", type: "single · multiple", desc: "行选择；勾选列用 <code>Column selection-mode</code>" },
    { name: "loading", kind: "prop", type: "boolean", desc: "半透明蒙层 + 指示器，<code>#loading</code> 可覆盖" },
    { name: "#empty", kind: "slot", type: "插槽", desc: "空态：说明 + 下一步动作" },
    { name: "--mw-datatable-bg / -border / -radius", kind: "css", type: "CSS 变量", desc: "外框定制钩子（嵌入已有卡片时去框）" },
  ],
  examples: [
    { title: "基本用法", code: "<script setup lang=\"ts\">\nimport { Column, DataTable } from \"@mango-write/ui\";\n\nconst papers = [\n  { id: 1, title: \"引文锚点研究\", cited: 12 },\n  { id: 2, title: \"协同编辑一致性\", cited: 8 },\n];\n</script>\n\n<template>\n  <DataTable :value=\"papers\" data-key=\"id\" striped-rows>\n    <Column field=\"title\" header=\"标题\" sortable />\n    <Column field=\"cited\" header=\"被引\" sortable />\n  </DataTable>\n</template>" },
  ],
};
