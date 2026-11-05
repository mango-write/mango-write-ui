import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "confirm",
  component: "Confirm",
  title: "确认框",
  importPath: "@mango-write/ui/lib/confirm",
  exports: ["ConfirmHost","useConfirm"],
  rows: [
    { name: "confirm.ask(options)", kind: "method", type: "Promise<boolean>", desc: "入队一条确认请求，用户点击确认结算为 <code>true</code>，取消/关闭结算为 <code>false</code>" },
    { name: "title / message / description", kind: "prop", type: "string", desc: "标题、主消息与次级补充说明（兼容 <code>header</code>）" },
    { name: "danger", kind: "prop", type: "boolean", desc: "破坏性操作：图标切为警告红、确认钮切为 <code>danger</code>、初始焦点移至「取消」且拦截容器回车" },
    { name: "acceptSeverity", kind: "prop", type: "primary · danger · warn · secondary", desc: "确认按钮语义；默认随 <code>danger</code> 派生" },
    { name: "defaultFocus", kind: "prop", type: "accept · reject · none", desc: "打开时的初始焦点；常规默认 <code>accept</code>，危险默认 <code>reject</code>" },
    { name: "closeOnEscape / dismissableMask / signal", kind: "prop", type: "boolean / AbortSignal", desc: "按 Esc 取消（默认 true）、点遮罩取消（默认 false）、外部信号中止" },
    { name: "ConfirmHost: group / #default / #message", kind: "prop", type: "string / 插槽", desc: "按 <code>group</code> 隔离消费队列；可通过作用域插槽完全自定义内容结构" },
  ],
  examples: [
    { title: "基本用法", code: "<script setup lang=\"ts\">\nimport { Button, ConfirmHost, useConfirm } from \"@mango-write/ui\";\n\nconst confirm = useConfirm();\n\nasync function remove() {\n  const ok = await confirm.ask({ title: \"删除草稿?\", danger: true });\n  if (ok) {\n    // 执行删除\n  }\n}\n</script>\n\n<template>\n  <ConfirmHost />\n  <Button severity=\"danger\" label=\"删除草稿\" @click=\"remove\" />\n</template>" },
  ],
};
