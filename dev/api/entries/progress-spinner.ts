import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "progress-spinner",
  component: "ProgressSpinner",
  title: "加载指示",
  importPath: "@mango-write/ui",
  rows: [
    { name: "strokeWidth", kind: "prop", type: "string | number", desc: "SVG 圆环描边宽度（基于 50×50 viewBox）；默认 <code>\"4\"</code>" },
    { name: "fill", kind: "prop", type: "string", desc: "圆环内部填充色；默认 <code>\"none\"</code>" },
    { name: "animationDuration", kind: "prop", type: "string", desc: "外层旋转周期；默认 <code>\"2s\"</code>" },
    { name: "ariaLabel", kind: "prop", type: "string", desc: "无障碍 <code>progressbar</code> 标签说明" },
    { name: "--mw-progress-spinner-size", kind: "css", type: "<length>", desc: "控制宽高尺寸的 CSS 变量；默认 <code>var(--space-10)</code>" },
  ],
};
