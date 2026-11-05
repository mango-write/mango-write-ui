import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "select-button",
  component: "SelectButton",
  title: "分段选择",
  importPath: "@mango-write/ui",
  rows: [
    { name: "options / optionLabel / optionValue / optionDisabled", kind: "prop", type: "—", desc: "选项与取值方式" },
    { name: "multiple", kind: "prop", type: "boolean", desc: "多选时 v-model 为数组" },
    { name: "allowEmpty", kind: "prop", type: "boolean", desc: "再次点击选中段是否取消选择；视图切换应设为 false" },
    { name: "size", kind: "prop", type: "xs · sm · md · lg", desc: "不传则跟随密度上下文" },
    { name: "#option", kind: "slot", type: "{ option, index }", desc: "自定义段内容；图标取 <code>--control-icon</code>" },
  ],
};
