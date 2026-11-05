import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "tooltip",
  component: "Tooltip",
  title: { zh: "文字提示", en: "Tooltip" },
  importPath: "@mango-write/ui",
  rows: [
    {
      name: "v-tooltip=\"text\"",
      kind: "prop",
      type: "string",
      desc: {
        zh: "提示纯文本；为空字符串时不渲染面板",
        en: "Plain-text hint; no panel is rendered for an empty string",
      },
    },
    {
      name: ".top / .right / .bottom / .left",
      kind: "prop",
      type: { zh: "修饰符", en: "Modifiers" },
      desc: {
        zh: "首选弹出方向，不传默认 <code>.top</code>",
        en: "Preferred side; defaults to <code>.top</code> when omitted",
      },
    },
    {
      name: { zh: "触发与收起", en: "Show & dismiss" },
      kind: "prop",
      type: { zh: "交互约束", en: "Interaction" },
      desc: {
        zh: "<code>mouseenter</code> / <code>focusin</code> 延迟 150ms 展开；<code>mouseleave</code> / <code>focusout</code> / <code>click</code> / <code>Escape</code> 立即收起",
        en: "Opens after 150ms on <code>mouseenter</code> / <code>focusin</code>; collapses immediately on <code>mouseleave</code> / <code>focusout</code> / <code>click</code> / <code>Escape</code>",
      },
    },
    {
      name: { zh: "无障碍关联", en: "Accessibility wiring" },
      kind: "prop",
      type: { zh: "DOM 属性", en: "DOM attribute" },
      desc: {
        zh: "展开期间自动为宿主元素挂载 <code>aria-describedby</code> 指向 <code>role=\"tooltip\"</code> 面板",
        en: "While open, the host element automatically gets <code>aria-describedby</code> pointing at the <code>role=\"tooltip\"</code> panel",
      },
    },
  ],
};
