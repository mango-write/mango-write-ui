import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "radio-button",
  component: "RadioButton",
  title: "单选框",
  importPath: "@mango-write/ui",
  rows: [
    { name: "modelValue", kind: "prop", type: "T", desc: "当前选中值（<code>v-model</code>）" },
    { name: "value", kind: "prop", type: "T", desc: "当前单选框代表的选项值，支持基本类型与对象比较" },
    { name: "binary", kind: "prop", type: "boolean", desc: "独立布尔模式，点击切换布尔值" },
    { name: "name / inputId", kind: "prop", type: "string", desc: "原生表单分组名与关联标签 ID" },
    { name: "size", kind: "prop", type: "sm · md · lg", desc: "尺寸档位，默认 <code>md</code>" },
    { name: "disabled / readonly / invalid", kind: "prop", type: "boolean", desc: "禁用、只读与错误态" },
  ],
};
