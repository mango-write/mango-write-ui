import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "searchable-select",
  component: "SearchableSelect",
  title: "可搜索选择",
  importPath: "@mango-write/ui",
  rows: [
    { name: "modelValue", kind: "prop", type: "unknown", desc: "当前选中值（<code>v-model</code>）" },
    { name: "options", kind: "prop", type: "readonly Record<string, unknown>[]", desc: "选项对象数组" },
    { name: "optionLabel / optionValue", kind: "prop", type: "string", desc: "展示文字字段名（必填）与值字段名（不传则取整个对象）" },
    { name: "showClear", kind: "prop", type: "boolean", desc: "已选时是否显示右侧清空按钮" },
    { name: "size", kind: "prop", type: "\"small\" | \"large\"", desc: "尺寸档位，不传为默认 <code>md</code>" },
    { name: "disabled / invalid / emptyMessage", kind: "prop", type: "boolean / string", desc: "禁用、错误态与无匹配提示文案" },
  ],
};
