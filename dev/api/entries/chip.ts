import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "chip",
  component: "Chip",
  title: "纸片",
  importPath: "@mango-write/ui",
  rows: [
    { name: "label", kind: "prop", type: "string", desc: "纸片显示的文本，同时作为根元素的 <code>aria-label</code>" },
    { name: "icon", kind: "prop", type: "Component", desc: "前置 Lucide 图标组件" },
    { name: "image", kind: "prop", type: "string", desc: "前置圆形缩略图 URL，优先级高于 <code>icon</code>" },
    { name: "removable", kind: "prop", type: "boolean", desc: "是否显示尾部移除按钮；默认 <code>false</code>" },
    { name: "@remove", kind: "event", type: "(event: Event) => void", desc: "点击移除或键盘触发移除时派发" },
    { name: "#default / #removeicon", kind: "slot", type: "—", desc: "自定义内容或自定义移除按钮（暴露 <code>removeCallback</code> 与 <code>keydownCallback</code>）" },
  ],
};
