import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "toast",
  component: "Toast",
  title: "轻提示",
  importPath: "@mango-write/ui/lib/notify",
  exports: ["ToastHost","useNotify"],
  rows: [
    { name: "useNotify()", kind: "method", type: "NotifyStore", desc: "返回通知存储实例：<code>success / info / warn / error / add / remove / removeGroup / removeAllGroups</code>" },
    { name: "severity", kind: "prop", type: "success · info · warn · error", desc: "语义级别；<code>error</code> 使用 <code>role=\"alert\"</code>，其余使用 <code>role=\"status\"</code>" },
    { name: "summary / detail", kind: "prop", type: "string", desc: "主标题与辅助详情说明" },
    { name: "life", kind: "prop", type: "number", desc: "自动关闭毫秒数；传 <code>0</code> 常驻不自动消失，悬停或聚焦期间计时器自动暂停" },
    { name: "id", kind: "prop", type: "string", desc: "指定稳定 ID 时原位更新现有提示并保持 <code>announceKey</code>，不重复挂载 DOM" },
    { name: "action", kind: "prop", type: "{ label: string, onClick: () => void }", desc: "底部行内操作按钮（如「撤销」「查看」）" },
    { name: "ToastHost: position / group", kind: "prop", type: "top-right · top-left · bottom-right · bottom-left · top-center · bottom-center", desc: "挂载方位（默认 <code>top-right</code>）与消费分组名" },
  ],
  examples: [
    { title: "基本用法", code: "<script setup lang=\"ts\">\nimport { Button, ToastHost, useNotify } from \"@mango-write/ui\";\n\nconst notify = useNotify();\n</script>\n\n<template>\n  <ToastHost />\n  <Button\n    label=\"移入回收站\"\n    @click=\"notify.success('已移入回收站', '可在 30 天内恢复。')\"\n  />\n</template>" },
  ],
};
