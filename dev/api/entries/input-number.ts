import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "input-number",
  component: "InputNumber",
  title: { zh: "数字输入", en: "Number input" },
  importPath: "@mango-write/ui",
  rows: [
    { name: "v-model", kind: "prop", type: "number | null", desc: { zh: "清空为 null", en: "Clearing yields null" } },
    { name: "min / max / step", kind: "prop", type: "number", desc: { zh: "失焦与步进时钳制", en: "Clamped on blur and stepping" } },
    { name: "showButtons / buttonLayout", kind: "prop", type: "stacked · horizontal · vertical", desc: { zh: "步进按钮与布局", en: "Stepper buttons and their layout" } },
    { name: "mode / currency / prefix / suffix", kind: "prop", type: "—", desc: { zh: "显示格式", en: "Display formatting" } },
    { name: "size", kind: "prop", type: "xs · sm · md · lg", desc: { zh: "不传则跟随密度上下文", en: "Follows the density context when omitted" } },
  ],
};
