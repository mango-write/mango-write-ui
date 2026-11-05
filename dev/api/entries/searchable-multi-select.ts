import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "searchable-multi-select",
  component: "SearchableMultiSelect",
  title: "可搜索多选",
  importPath: "@mango-write/ui",
  rows: [
    { name: "modelValue", kind: "prop", type: "unknown[]", desc: "选中值数组（<code>v-model</code>）" },
    { name: "options / optionLabel / optionValue", kind: "prop", type: "Record[] / string", desc: "候选对象列表、展示字段名与取值字段名" },
    { name: "optionFilter", kind: "prop", type: "(option, query) => boolean", desc: "自定义过滤谓词（<code>query</code> 已转小写）" },
    { name: "size", kind: "prop", type: "\"small\" | \"large\"", desc: "尺寸档位，不传为 <code>md</code>" },
    { name: "#chip", kind: "slot", type: "{ option, label, index, remove }", desc: "自定义已选 chip 渲染（如 <code>UserSelect</code> 的头像胶囊）" },
    { name: "#option", kind: "slot", type: "{ option, label, selected }", desc: "自定义浮层选项行内容" },
  ],
};
