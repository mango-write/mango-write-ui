import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "chip",
  component: "Chip",
  title: { zh: "纸片", en: "Chip" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "label",
      kind: "prop",
      type: "string",
      desc: {
        zh: "纸片显示的文本，同时作为根元素的 <code>aria-label</code>",
        en: "The chip's text, also used as the root element's <code>aria-label</code>",
      },
    },
    {
      name: "icon",
      kind: "prop",
      type: "Component",
      desc: { zh: "前置 Lucide 图标组件", en: "Leading Lucide icon component" },
    },
    {
      name: "image",
      kind: "prop",
      type: "string",
      desc: {
        zh: "前置圆形缩略图 URL，优先级高于 <code>icon</code>",
        en: "Leading circular thumbnail URL, taking precedence over <code>icon</code>",
      },
    },
    {
      name: "removable",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "是否显示尾部移除按钮；默认 <code>false</code>",
        en: "Show the trailing remove button; defaults to <code>false</code>",
      },
    },
    {
      name: "@remove",
      kind: "event",
      type: "(event: Event) => void",
      desc: {
        zh: "点击移除或键盘触发移除时派发",
        en: "Emitted on click or keyboard removal",
      },
    },
    {
      name: "#default / #removeicon",
      kind: "slot",
      type: "—",
      desc: {
        zh: "自定义内容或自定义移除按钮（暴露 <code>removeCallback</code> 与 <code>keydownCallback</code>）",
        en: "Custom content or a custom remove button (exposes <code>removeCallback</code> and <code>keydownCallback</code>)",
      },
    },
  ],
};
