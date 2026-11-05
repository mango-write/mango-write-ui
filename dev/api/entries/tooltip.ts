import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "tooltip",
  component: "Tooltip",
  title: "文字提示",
  importPath: "@mango-write/ui",
  rows: [
    { name: "v-tooltip=\"text\"", kind: "prop", type: "string", desc: "提示纯文本；为空字符串时不渲染面板" },
    { name: ".top / .right / .bottom / .left", kind: "prop", type: "修饰符", desc: "首选弹出方向，不传默认 <code>.top</code>" },
    { name: "触发与收起", kind: "prop", type: "交互约束", desc: "<code>mouseenter</code> / <code>focusin</code> 延迟 150ms 展开；<code>mouseleave</code> / <code>focusout</code> / <code>click</code> / <code>Escape</code> 立即收起" },
    { name: "无障碍关联", kind: "prop", type: "DOM 属性", desc: "展开期间自动为宿主元素挂载 <code>aria-describedby</code> 指向 <code>role=\"tooltip\"</code> 面板" },
  ],
};
