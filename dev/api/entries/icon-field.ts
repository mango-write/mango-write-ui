import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "icon-field",
  component: "IconField",
  title: "图标输入框",
  importPath: "@mango-write/ui",
  exports: ["IconField","InputIcon"],
  rows: [
    { name: "IconField", kind: "prop", type: "默认插槽", desc: "依次放 <code>InputIcon</code>（左）、输入框、<code>InputIcon</code>（右）" },
    { name: "InputIcon", kind: "prop", type: "默认插槽 / class", desc: "放 Lucide 图标组件，尺寸与颜色由 <code>--control-icon</code> 与 <code>--text-tertiary</code> 统一控制" },
  ],
};
