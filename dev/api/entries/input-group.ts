import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "input-group",
  component: "InputGroup",
  title: "输入组",
  importPath: "@mango-write/ui",
  exports: ["InputGroup","InputGroupAddon"],
  rows: [
    { name: "InputGroup", kind: "prop", type: "默认插槽", desc: "按顺序放附加段、输入框、按钮；首尾段保留圆角，中间段直角拼接" },
    { name: "InputGroupAddon", kind: "prop", type: "默认插槽", desc: "文字或图标；图标取 <code>--control-icon</code>" },
  ],
};
