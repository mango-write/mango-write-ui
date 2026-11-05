import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "input-group",
  component: "InputGroup",
  title: { zh: "输入组", en: "Input group" },
  importPath: "@mango-write/ui",
  exports: ["InputGroup","InputGroupAddon"],
  rows: [
    { name: "InputGroup", kind: "prop", type: { zh: "默认插槽", en: "default slot" }, desc: { zh: "按顺序放附加段、输入框、按钮；首尾段保留圆角，中间段直角拼接", en: "Place addons, inputs, and buttons in order; end segments keep their radius, middle segments butt at right angles" } },
    { name: "InputGroupAddon", kind: "prop", type: { zh: "默认插槽", en: "default slot" }, desc: { zh: "文字或图标；图标取 <code>--control-icon</code>", en: "Text or an icon; icons size to <code>--control-icon</code>" } },
  ],
};
