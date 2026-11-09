import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "searchable-select",
  component: "SearchableSelect",
  title: { zh: "可搜索选择", en: "Searchable select" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "modelValue",
      kind: "prop",
      type: "unknown",
      desc: { zh: "当前选中值（<code>v-model</code>）", en: "The current selection (<code>v-model</code>)" },
    },
    {
      name: "options",
      kind: "prop",
      type: "readonly Record<string, unknown>[]",
      desc: { zh: "选项对象数组", en: "Array of option objects" },
    },
    {
      name: "optionLabel / optionValue",
      kind: "prop",
      type: "string",
      desc: {
        zh: "展示文字字段名（必填）与值字段名（不传则取整个对象）",
        en: "Label field name (required) and value field name (defaults to the whole object)",
      },
    },
    {
      name: "showClear",
      kind: "prop",
      type: "boolean",
      desc: { zh: "已选时是否显示右侧清空按钮", en: "Show a clear button on the right once a value is selected" },
    },
    {
      name: "size",
      kind: "prop",
      type: "\"small\" | \"large\"",
      desc: { zh: "尺寸档位，不传为默认 <code>md</code>", en: "Size tier; defaults to <code>md</code>" },
    },
    {
      name: "disabled / invalid / emptyMessage",
      kind: "prop",
      type: "boolean / string",
      desc: {
        zh: "禁用、错误态与无匹配提示文案",
        en: "Disabled, invalid, and the no-matches message text",
      },
    },
  ],
};
