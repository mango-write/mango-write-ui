import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "icon-field",
  component: "IconField",
  title: { zh: "图标输入框", en: "Icon field" },
  importPath: "@mango-write/ui",
  exports: ["IconField","InputIcon"],
  rows: [
    { name: "IconField", kind: "prop", type: { zh: "默认插槽", en: "default slot" }, desc: { zh: "依次放 <code>InputIcon</code>（左）、输入框、<code>InputIcon</code>（右）", en: "Place <code>InputIcon</code> (left), the input, and <code>InputIcon</code> (right) in order" } },
    { name: "InputIcon", kind: "prop", type: { zh: "默认插槽 / class", en: "default slot / class" }, desc: { zh: "放 Lucide 图标组件，尺寸与颜色由 <code>--control-icon</code> 与 <code>--text-tertiary</code> 统一控制", en: "Holds a Lucide icon; size and color come from <code>--control-icon</code> and <code>--text-tertiary</code>" } },
  ],
};
