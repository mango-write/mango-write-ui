import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "skeleton",
  component: "Skeleton",
  title: "骨架屏",
  importPath: "@mango-write/ui",
  rows: [
    { name: "shape", kind: "prop", type: "rectangle · circle", desc: "几何形状；默认 <code>rectangle</code>" },
    { name: "size", kind: "prop", type: "string", desc: "同时设置宽高（如 <code>\"40px\"</code>），优先级高于 <code>width</code> 与 <code>height</code>" },
    { name: "width", kind: "prop", type: "string", desc: "宽度 CSS 值；默认 <code>\"100%\"</code>" },
    { name: "height", kind: "prop", type: "string", desc: "高度 CSS 值；默认 <code>\"1rem\"</code>" },
    { name: "borderRadius", kind: "prop", type: "string", desc: "自定义圆角半径；默认矩形取 <code>var(--radius-sm)</code>，圆形取 <code>var(--radius-full)</code>" },
    { name: "animation", kind: "prop", type: "wave · none", desc: "扫掠动画或静态无动画；默认 <code>wave</code>" },
  ],
};
