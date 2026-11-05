import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "popover",
  component: "Popover",
  title: "弹出层",
  importPath: "@mango-write/ui",
  rows: [
    { name: "v-model:open / defaultOpen", kind: "prop", type: "boolean", desc: "受控打开状态与非受控初始状态" },
    { name: "side / sideOffset", kind: "prop", type: "top · right · bottom · left / number", desc: "首选弹出方向（默认 <code>bottom</code>）与主轴间距（默认 <code>6</code>）" },
    { name: "align / alignOffset", kind: "prop", type: "start · center · end / number", desc: "交叉轴对齐方式（默认 <code>start</code>）与偏移量" },
    { name: "dismissable / closeOnEscape / modal", kind: "prop", type: "boolean", desc: "点击外部关闭（默认 true）、Esc 关闭（默认 true）、模态锁定（默认 false）" },
    { name: "#trigger / #default", kind: "slot", type: "{ open, toggle, show, hide } / { open, close, hide }", desc: "触发器插槽（<code>as-child</code>）与浮层内容插槽" },
    { name: "toggle(event, target) / show / hide", kind: "method", type: "暴露方法", desc: "命令式控制开合与动态切换锚点元素" },
  ],
};
