import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "button",
  component: "Button",
  title: "按钮",
  importPath: "@mango-write/ui",
  rows: [
    { name: "variant", kind: "prop", type: "filled · tinted · outlined · text · link", desc: "视觉重量；默认 filled" },
    { name: "severity", kind: "prop", type: "primary · secondary · danger · contrast · success · info · warning", desc: "语义；默认 primary" },
    { name: "size", kind: "prop", type: "xs · sm · md · lg", desc: "不传则跟随密度上下文" },
    { name: "rounded", kind: "prop", type: "boolean", desc: "胶囊形（<code>--radius-full</code>），文字内距自动放宽，icon-only 为正圆" },
    { name: "icon", kind: "prop", type: "Component", desc: "Lucide 图标组件，尺寸取 <code>--control-icon</code>" },
    { name: "loading / disabled", kind: "prop", type: "boolean", desc: "加载时阻断点击并显示指示" },
  ],
  examples: [
    { title: "基本用法", code: "<script setup lang=\"ts\">\nimport { Button } from \"@mango-write/ui\";\n</script>\n\n<template>\n  <Button label=\"保存修改\" @click=\"save\" />\n  <Button severity=\"secondary\" variant=\"outlined\" label=\"取消\" />\n</template>" },
  ],
};
