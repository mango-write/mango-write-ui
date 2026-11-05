import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "select-button",
  component: "SelectButton",
  title: { zh: "分段选择", en: "Segmented control" },
  importPath: "@mango-write/ui",
  rows: [
    { name: "options / optionLabel / optionValue / optionDisabled", kind: "prop", type: "—", desc: { zh: "选项与取值方式", en: "Options and how values are read" } },
    { name: "multiple", kind: "prop", type: "boolean", desc: { zh: "多选时 v-model 为数组", en: "With multiple, v-model is an array" } },
    { name: "allowEmpty", kind: "prop", type: "boolean", desc: { zh: "再次点击选中段是否取消选择；视图切换应设为 false", en: "Whether clicking the selected segment again deselects; set false for view switching" } },
    { name: "size", kind: "prop", type: "xs · sm · md · lg", desc: { zh: "不传则跟随密度上下文", en: "Follows the density context when omitted" } },
    { name: "#option", kind: "slot", type: "{ option, index }", desc: { zh: "自定义段内容；图标取 <code>--control-icon</code>", en: "Custom segment content; icons size to <code>--control-icon</code>" } },
  ],
};
