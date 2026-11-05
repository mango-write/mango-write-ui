import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "input-number",
  component: "InputNumber",
  title: "数字输入",
  importPath: "@mango-write/ui",
  rows: [
    { name: "v-model", kind: "prop", type: "number | null", desc: "清空为 null" },
    { name: "min / max / step", kind: "prop", type: "number", desc: "失焦与步进时钳制" },
    { name: "showButtons / buttonLayout", kind: "prop", type: "stacked · horizontal · vertical", desc: "步进按钮与布局" },
    { name: "mode / currency / prefix / suffix", kind: "prop", type: "—", desc: "显示格式" },
    { name: "size", kind: "prop", type: "xs · sm · md · lg", desc: "不传则跟随密度上下文" },
  ],
};
