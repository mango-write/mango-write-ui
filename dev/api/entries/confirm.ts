import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "confirm",
  component: "Confirm",
  title: { zh: "确认框", en: "Confirm" },
  importPath: "@mango-write/ui/lib/confirm",
  exports: ["ConfirmHost", "useConfirm"],
  rows: [
    {
      name: "confirm.ask(options)",
      kind: "method",
      type: "Promise<boolean>",
      desc: {
        zh: "入队一条确认请求，用户点击确认结算为 <code>true</code>，取消/关闭结算为 <code>false</code>",
        en: "Enqueues a confirm request; settling to <code>true</code> on accept, <code>false</code> on cancel/close",
      },
    },
    {
      name: "title / message / description",
      kind: "prop",
      type: "string",
      desc: {
        zh: "标题、主消息与次级补充说明（兼容 <code>header</code>）",
        en: "Title, main message, and secondary note (<code>header</code> kept for compatibility)",
      },
    },
    {
      name: "danger",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "破坏性操作：图标切为警告红、确认钮切为 <code>danger</code>、初始焦点移至「取消」且拦截容器回车",
        en: "Destructive actions: the icon turns warning red, the accept button becomes <code>danger</code>, initial focus moves to “cancel”, and container Enter is intercepted",
      },
    },
    {
      name: "acceptSeverity",
      kind: "prop",
      type: "primary · danger · warn · secondary",
      desc: {
        zh: "确认按钮语义；默认随 <code>danger</code> 派生",
        en: "Accept button tone; derived from <code>danger</code> by default",
      },
    },
    {
      name: "defaultFocus",
      kind: "prop",
      type: "accept · reject · none",
      desc: {
        zh: "打开时的初始焦点；常规默认 <code>accept</code>，危险默认 <code>reject</code>",
        en: "Initial focus on open; defaults to <code>accept</code>, or <code>reject</code> when dangerous",
      },
    },
    {
      name: "closeOnEscape / dismissableMask / signal",
      kind: "prop",
      type: "boolean / AbortSignal",
      desc: {
        zh: "按 Esc 取消（默认 true）、点遮罩取消（默认 false）、外部信号中止",
        en: "Cancel on Esc (default true), cancel on scrim click (default false), abort via external signal",
      },
    },
    {
      name: "ConfirmHost: group / #default / #message",
      kind: "prop",
      type: { zh: "string / 插槽", en: "string / slot" },
      desc: {
        zh: "按 <code>group</code> 隔离消费队列；可通过作用域插槽完全自定义内容结构",
        en: "Consumes queues isolated by <code>group</code>; scoped slots can fully customize the content structure",
      },
    },
  ],
};
