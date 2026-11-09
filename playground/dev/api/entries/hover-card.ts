import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "hover-card",
  component: "HoverCard",
  title: { zh: "悬停卡片", en: "Hover card" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "placement",
      kind: "prop",
      type: "top · right · bottom · left",
      desc: {
        zh: "期望弹出方向，默认 <code>top</code>；视口放不下时自动翻转并夹紧边距",
        en: "Preferred side, default <code>top</code>; flips and clamps to the margin when the viewport can't fit it",
      },
    },
    {
      name: "showDelay / hideDelay",
      kind: "prop",
      type: "number",
      desc: {
        zh: "悬停进入与离开延迟毫秒数，默认均为 <code>150</code>（兼作移入面板的指针桥）",
        en: "Hover enter/leave delay in ms, both default <code>150</code> (also the pointer bridge into the panel)",
      },
    },
    {
      name: "interactive",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "默认 <code>true</code>（允许指针移入与 Tab 聚焦）；<code>false</code> 时退化为 <code>role=\"tooltip\"</code>",
        en: "Defaults to <code>true</code> (pointer can move in and Tab can focus); <code>false</code> degrades to <code>role=\"tooltip\"</code>",
      },
    },
    {
      name: "focusable",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "默认 <code>true</code> 为行内文本提供 <code>tabindex=\"0\"</code>；包裹按钮/输入框时应传 <code>false</code>",
        en: "Defaults to <code>true</code>, giving inline text <code>tabindex=\"0\"</code>; pass <code>false</code> when wrapping buttons/inputs",
      },
    },
    {
      name: "block / disabled / label",
      kind: "prop",
      type: "boolean / string",
      desc: {
        zh: "块级包裹盒、禁用状态、交互弹层的无障碍名称（<code>aria-label</code>）",
        en: "Block wrapper, disabled state, and the accessible name (<code>aria-label</code>) of the interactive layer",
      },
    },
    {
      name: "#default / #content",
      kind: "slot",
      type: { zh: "插槽", en: "Slot" },
      desc: {
        zh: "锚点触发元素与悬浮卡片内容",
        en: "Anchor trigger element and floating card content",
      },
    },
  ],
};
