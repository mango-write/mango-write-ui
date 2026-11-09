import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "avatar",
  component: "Avatar",
  title: { zh: "头像", en: "Avatar" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "shape",
      kind: "prop",
      type: "square · circle",
      desc: { zh: "外观形状；默认 <code>square</code>", en: "Visual shape; defaults to <code>square</code>" },
    },
    {
      name: "size",
      kind: "prop",
      type: "xs · sm · md · lg · normal · large · xlarge",
      desc: {
        zh: "尺寸档位；不传则跟随容器密度上下文",
        en: "Size tier; follows the container's density context when omitted",
      },
    },
    {
      name: "image",
      kind: "prop",
      type: "string",
      desc: {
        zh: "头像图片地址；加载失败时自动回退至 <code>label</code> 或 <code>icon</code>",
        en: "Image URL; falls back to <code>label</code> or <code>icon</code> on load failure",
      },
    },
    {
      name: "label",
      kind: "prop",
      type: "string",
      desc: { zh: "首字母或短字符缩略文本", en: "Initials or a short character" },
    },
    {
      name: "icon",
      kind: "prop",
      type: "Component",
      desc: { zh: "Lucide 图标组件（尺寸跟随容器密度）", en: "Lucide icon component (sized by container density)" },
    },
    {
      name: "ariaLabel",
      kind: "prop",
      type: "string",
      desc: {
        zh: "无障碍名称，同时用于图片 <code>alt</code>",
        en: "Accessible name, also used as the image <code>alt</code>",
      },
    },
    {
      name: "@error / @click",
      kind: "event",
      type: "Event",
      desc: { zh: "图片加载失败事件与点击事件", en: "Image load failure and click events" },
    },
    {
      name: "#default / #icon",
      kind: "slot",
      type: "—",
      desc: { zh: "自定义头像主体或图标插槽", en: "Custom avatar body or icon slots" },
    },
  ],
};
