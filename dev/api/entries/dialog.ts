import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "dialog",
  component: "Dialog",
  title: "对话框",
  importPath: "@mango-write/ui",
  rows: [
    { name: "v-model:open / v-model:visible", kind: "prop", type: "boolean", desc: "受控打开状态（主契约 <code>open</code>，兼容 <code>visible</code>）" },
    { name: "title / description", kind: "prop", type: "string", desc: "弹窗标题（兼容 <code>header</code>）与副标题说明文案" },
    { name: "width", kind: "prop", type: "string", desc: "自定义宽度，默认 <code>min(32rem, calc(100vw - var(--space-8)))</code>" },
    { name: "maximizable / closable / showHeader", kind: "prop", type: "boolean", desc: "最大化按钮（默认 false）、关闭按钮（默认 true）、头部显隐（默认 true）" },
    { name: "dismissableMask / closeOnEscape", kind: "prop", type: "boolean", desc: "点击遮罩关闭（默认 false）、按 Escape 关闭（默认 true）" },
    { name: "#header / #lead / #default / #footer", kind: "slot", type: "插槽", desc: "标题区、正文上方固定引导区、可滚动主体、底栏动作区（默认 md 密度）" },
  ],
  examples: [
    { title: "基本用法", code: "<script setup lang=\"ts\">\nimport { ref } from \"vue\";\nimport { Button, Dialog } from \"@mango-write/ui\";\n\nconst open = ref(false);\n</script>\n\n<template>\n  <Button label=\"导出\" @click=\"open = true\" />\n  <Dialog v-model:open=\"open\" title=\"导出为 PDF\" description=\"包含全部正文与图表\">\n    <p>导出范围与版式可在下一步确认。</p>\n    <template #footer>\n      <Button variant=\"text\" severity=\"secondary\" label=\"取消\" @click=\"open = false\" />\n      <Button label=\"开始导出\" />\n    </template>\n  </Dialog>\n</template>" },
  ],
};
