import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "color-picker",
  component: "ColorPicker",
  title: { zh: "取色器", en: "Color picker" },
  importPath: "@mango-write/ui-vue",
  rows: [
    { name: "v-model", kind: "prop", type: "string", desc: { zh: "按 <code>format</code> 输出；hex 默认不带 #（传入带 # 则保留）", en: "Output follows <code>format</code>; hex drops # by default (kept if the input has one)" } },
    { name: "format", kind: "prop", type: "hex · rgb · hsb", desc: { zh: "输出格式", en: "Output format" } },
    { name: "inline", kind: "prop", type: "boolean", desc: { zh: "更大的色块", en: "A larger swatch" } },
    { name: "disabled / readonly / invalid", kind: "prop", type: "boolean", desc: { zh: "状态", en: "States" } },
  ],
};
