import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "skeleton",
  component: "Skeleton",
  title: { zh: "骨架屏", en: "Skeleton" },
  importPath: "@mango-write/ui",
  rows: [
    {
      name: "shape",
      kind: "prop",
      type: "rectangle · circle",
      desc: { zh: "几何形状；默认 <code>rectangle</code>", en: "Shape; defaults to <code>rectangle</code>" },
    },
    {
      name: "size",
      kind: "prop",
      type: "string",
      desc: {
        zh: "同时设置宽高（如 <code>\"40px\"</code>），优先级高于 <code>width</code> 与 <code>height</code>",
        en: "Sets width and height together (e.g. <code>\"40px\"</code>), overriding <code>width</code> and <code>height</code>",
      },
    },
    {
      name: "width",
      kind: "prop",
      type: "string",
      desc: { zh: "宽度 CSS 值；默认 <code>\"100%\"</code>", en: "Width CSS value; defaults to <code>\"100%\"</code>" },
    },
    {
      name: "height",
      kind: "prop",
      type: "string",
      desc: { zh: "高度 CSS 值；默认 <code>\"1rem\"</code>", en: "Height CSS value; defaults to <code>\"1rem\"</code>" },
    },
    {
      name: "borderRadius",
      kind: "prop",
      type: "string",
      desc: {
        zh: "自定义圆角半径；默认矩形取 <code>var(--radius-sm)</code>，圆形取 <code>var(--radius-full)</code>",
        en: "Custom radius; rectangles default to <code>var(--radius-sm)</code>, circles to <code>var(--radius-full)</code>",
      },
    },
    {
      name: "animation",
      kind: "prop",
      type: "wave · none",
      desc: {
        zh: "扫掠动画或静态无动画；默认 <code>wave</code>",
        en: "Sweep animation or static; defaults to <code>wave</code>",
      },
    },
  ],
};
