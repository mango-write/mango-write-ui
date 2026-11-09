import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "searchable-multi-select",
  component: "SearchableMultiSelect",
  title: { zh: "可搜索多选", en: "Searchable multi-select" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "modelValue",
      kind: "prop",
      type: "unknown[]",
      desc: { zh: "选中值数组（<code>v-model</code>）", en: "Array of selected values (<code>v-model</code>)" },
    },
    {
      name: "options / optionLabel / optionValue",
      kind: "prop",
      type: "Record[] / string",
      desc: {
        zh: "候选对象列表、展示字段名与取值字段名",
        en: "Candidate objects plus the label and value field names",
      },
    },
    {
      name: "optionFilter",
      kind: "prop",
      type: "(option, query) => boolean",
      desc: {
        zh: "自定义过滤谓词（<code>query</code> 已转小写）",
        en: "Custom filter predicate (<code>query</code> arrives lowercased)",
      },
    },
    {
      name: "size",
      kind: "prop",
      type: "\"small\" | \"large\"",
      desc: { zh: "尺寸档位，不传为 <code>md</code>", en: "Size tier; defaults to <code>md</code>" },
    },
    {
      name: "#chip",
      kind: "slot",
      type: "{ option, label, index, remove }",
      desc: {
        zh: "自定义已选 chip 渲染（如 <code>UserSelect</code> 的头像胶囊）",
        en: "Custom chip rendering (e.g. the avatar pills in <code>UserSelect</code>)",
      },
    },
    {
      name: "#option",
      kind: "slot",
      type: "{ option, label, selected }",
      desc: { zh: "自定义浮层选项行内容", en: "Customize the overlay's option rows" },
    },
  ],
};
