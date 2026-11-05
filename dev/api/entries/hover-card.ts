import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "hover-card",
  component: "HoverCard",
  title: "悬停卡片",
  importPath: "@mango-write/ui",
  rows: [
    { name: "placement", kind: "prop", type: "top · right · bottom · left", desc: "期望弹出方向，默认 <code>top</code>；视口放不下时自动翻转并夹紧边距" },
    { name: "showDelay / hideDelay", kind: "prop", type: "number", desc: "悬停进入与离开延迟毫秒数，默认均为 <code>150</code>（兼作移入面板的指针桥）" },
    { name: "interactive", kind: "prop", type: "boolean", desc: "默认 <code>true</code>（允许指针移入与 Tab 聚焦）；<code>false</code> 时退化为 <code>role=\"tooltip\"</code>" },
    { name: "focusable", kind: "prop", type: "boolean", desc: "默认 <code>true</code> 为行内文本提供 <code>tabindex=\"0\"</code>；包裹按钮/输入框时应传 <code>false</code>" },
    { name: "block / disabled / label", kind: "prop", type: "boolean / string", desc: "块级包裹盒、禁用状态、交互弹层的无障碍名称（<code>aria-label</code>）" },
    { name: "#default / #content", kind: "slot", type: "插槽", desc: "锚点触发元素与悬浮卡片内容" },
  ],
};
