import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "popover",
  component: "Popover",
  title: { zh: "弹出层", en: "Popover" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "v-model:open / defaultOpen",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "受控打开状态与非受控初始状态",
        en: "Controlled open state and uncontrolled initial state",
      },
    },
    {
      name: "side / sideOffset",
      kind: "prop",
      type: "top · right · bottom · left / number",
      desc: {
        zh: "首选弹出方向（默认 <code>bottom</code>）与主轴间距（默认 <code>6</code>）",
        en: "Preferred side (default <code>bottom</code>) and main-axis gap (default <code>6</code>)",
      },
    },
    {
      name: "align / alignOffset",
      kind: "prop",
      type: "start · center · end / number",
      desc: {
        zh: "交叉轴对齐方式（默认 <code>start</code>）与偏移量",
        en: "Cross-axis alignment (default <code>start</code>) and offset",
      },
    },
    {
      name: "dismissable / closeOnEscape / modal",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "点击外部关闭（默认 true）、Esc 关闭（默认 true）、模态锁定（默认 false）",
        en: "Close on outside click (default true), close on Esc (default true), modal lock (default false)",
      },
    },
    {
      name: "#trigger / #default",
      kind: "slot",
      type: "{ open, toggle, show, hide } / { open, close, hide }",
      desc: {
        zh: "触发器插槽（<code>as-child</code>）与浮层内容插槽",
        en: "Trigger slot (<code>as-child</code>) and floating content slot",
      },
    },
    {
      name: "toggle(event, target) / show / hide",
      kind: "method",
      type: { zh: "暴露方法", en: "Exposed methods" },
      desc: {
        zh: "命令式控制开合与动态切换锚点元素",
        en: "Imperatively toggles open state and switches the anchored element dynamically",
      },
    },
  ],
};
