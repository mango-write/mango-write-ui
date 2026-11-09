import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "textarea",
  component: "Textarea",
  title: { zh: "多行文本", en: "Multiline input" },
  importPath: "@mango-write/ui-vue",
  rows: [
    { name: "v-model", kind: "prop", type: "string", desc: { zh: "输入法组合期间不回写", en: "No writes back while composing" } },
    { name: "rows", kind: "prop", type: "number", desc: { zh: "初始行数，默认 3", en: "Initial row count, defaults to 3" } },
    { name: "autoResize", kind: "prop", type: "boolean", desc: { zh: "随内容增高，关闭手动拖拽", en: "Grows with content; manual resizing is disabled" } },
    { name: "invalid / disabled / readonly", kind: "prop", type: "boolean", desc: { zh: "状态", en: "States" } },
  ],
};
