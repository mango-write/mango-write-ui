import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "toast",
  component: "Toast",
  title: { zh: "轻提示", en: "Toast" },
  importPath: "@mango-write/ui-vue/lib/notify",
  exports: ["ToastHost", "useNotify"],
  rows: [
    {
      name: "useNotify()",
      kind: "method",
      type: "NotifyStore",
      desc: {
        zh: "返回通知存储实例：<code>success / info / warn / error / add / remove / removeGroup / removeAllGroups</code>",
        en: "Returns the notify store instance: <code>success / info / warn / error / add / remove / removeGroup / removeAllGroups</code>",
      },
    },
    {
      name: "severity",
      kind: "prop",
      type: "success · info · warn · error",
      desc: {
        zh: "语义级别；<code>error</code> 使用 <code>role=\"alert\"</code>，其余使用 <code>role=\"status\"</code>",
        en: "Severity level; <code>error</code> uses <code>role=\"alert\"</code>, the rest use <code>role=\"status\"</code>",
      },
    },
    {
      name: "summary / detail",
      kind: "prop",
      type: "string",
      desc: {
        zh: "主标题与辅助详情说明",
        en: "Primary headline and supporting detail",
      },
    },
    {
      name: "life",
      kind: "prop",
      type: "number",
      desc: {
        zh: "自动关闭毫秒数；传 <code>0</code> 常驻不自动消失，悬停或聚焦期间计时器自动暂停",
        en: "Auto-dismiss in milliseconds; <code>0</code> keeps it until manually closed, and the timer pauses while hovered or focused",
      },
    },
    {
      name: "id",
      kind: "prop",
      type: "string",
      desc: {
        zh: "指定稳定 ID 时原位更新现有提示并保持 <code>announceKey</code>，不重复挂载 DOM",
        en: "With a stable id, the existing toast updates in place keeping its <code>announceKey</code>, without re-mounting DOM",
      },
    },
    {
      name: "action",
      kind: "prop",
      type: "{ label: string, onClick: () => void }",
      desc: {
        zh: "底部行内操作按钮（如「撤销」「查看」）",
        en: "Inline action button at the bottom (e.g. “Undo”, “View”)",
      },
    },
    {
      name: "ToastHost: position / group",
      kind: "prop",
      type: "top-right · top-left · bottom-right · bottom-left · top-center · bottom-center",
      desc: {
        zh: "挂载方位（默认 <code>top-right</code>）与消费分组名",
        en: "Viewport anchor (default <code>top-right</code>) and consuming group name",
      },
    },
  ],
};
