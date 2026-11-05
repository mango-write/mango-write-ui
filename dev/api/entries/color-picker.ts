import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "color-picker",
  component: "ColorPicker",
  title: "取色器",
  importPath: "@mango-write/ui",
  rows: [
    { name: "v-model", kind: "prop", type: "string", desc: "按 <code>format</code> 输出；hex 默认不带 #（传入带 # 则保留）" },
    { name: "format", kind: "prop", type: "hex · rgb · hsb", desc: "输出格式" },
    { name: "inline", kind: "prop", type: "boolean", desc: "更大的色块" },
    { name: "disabled / readonly / invalid", kind: "prop", type: "boolean", desc: "状态" },
  ],
};
