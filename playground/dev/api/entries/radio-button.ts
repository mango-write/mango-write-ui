import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "radio-button",
  component: "RadioButton",
  title: { zh: "单选框", en: "Radio button" },
  importPath: "@mango-write/ui-vue",
  rows: [
    { name: "modelValue", kind: "prop", type: "T", desc: { zh: "当前选中值（<code>v-model</code>）", en: "The selected value (<code>v-model</code>)" } },
    { name: "value", kind: "prop", type: "T", desc: { zh: "当前单选框代表的选项值，支持基本类型与对象比较", en: "The option value this radio represents; primitives and object comparison both work" } },
    { name: "binary", kind: "prop", type: "boolean", desc: { zh: "独立布尔模式，点击切换布尔值", en: "Standalone boolean mode; clicking toggles the boolean" } },
    { name: "name / inputId", kind: "prop", type: "string", desc: { zh: "原生表单分组名与关联标签 ID", en: "Native form group name and the associated label ID" } },
    { name: "size", kind: "prop", type: "sm · md · lg", desc: { zh: "尺寸档位，默认 <code>md</code>", en: "Size tier, defaults to <code>md</code>" } },
    { name: "disabled / readonly / invalid", kind: "prop", type: "boolean", desc: { zh: "禁用、只读与错误态", en: "Disabled, readonly, and invalid states" } },
  ],
};
