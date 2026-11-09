import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "progress-spinner",
  component: "ProgressSpinner",
  title: { zh: "加载指示", en: "Progress spinner" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "strokeWidth",
      kind: "prop",
      type: "string | number",
      desc: {
        zh: "SVG 圆环描边宽度（基于 50×50 viewBox）；默认 <code>\"4\"</code>",
        en: "SVG ring stroke width (on a 50×50 viewBox); defaults to <code>\"4\"</code>",
      },
    },
    {
      name: "fill",
      kind: "prop",
      type: "string",
      desc: {
        zh: "圆环内部填充色；默认 <code>\"none\"</code>",
        en: "Inner fill color of the ring; defaults to <code>\"none\"</code>",
      },
    },
    {
      name: "animationDuration",
      kind: "prop",
      type: "string",
      desc: {
        zh: "外层旋转周期；默认 <code>\"2s\"</code>",
        en: "Outer rotation period; defaults to <code>\"2s\"</code>",
      },
    },
    {
      name: "ariaLabel",
      kind: "prop",
      type: "string",
      desc: {
        zh: "无障碍 <code>progressbar</code> 标签说明",
        en: "Accessible <code>progressbar</code> label",
      },
    },
    {
      name: "--mw-progress-spinner-size",
      kind: "css",
      type: "<length>",
      desc: {
        zh: "控制宽高尺寸的 CSS 变量；默认 <code>var(--space-10)</code>",
        en: "CSS variable controlling width and height; defaults to <code>var(--space-10)</code>",
      },
    },
  ],
};
