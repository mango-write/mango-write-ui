import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "checkbox",
  component: "Checkbox",
  title: { zh: "复选框", en: "Checkbox" },
  importPath: "@mango-write/ui-vue",
  rows: [
    { name: "modelValue", kind: "prop", type: "any | any[]", desc: { zh: "绑定值；传数组且未开启 <code>binary</code> 时按集合模式增删 <code>value</code>", en: "Bound value; an array without <code>binary</code> adds/removes <code>value</code> in set mode" } },
    { name: "value", kind: "prop", type: "any", desc: { zh: "数组模式下的当前项值", en: "The item value in array mode" } },
    { name: "binary", kind: "prop", type: "boolean", desc: { zh: "单一布尔模式，在 <code>trueValue</code> 与 <code>falseValue</code> 间切换", en: "Boolean mode, toggling between <code>trueValue</code> and <code>falseValue</code>" } },
    { name: "indeterminate", kind: "prop", type: "boolean", desc: { zh: "半选态（<code>aria-checked=\"mixed\"</code>），点击后进入选中态", en: "Half-selected (<code>aria-checked=\"mixed\"</code>); clicking moves it to checked" } },
    { name: "size", kind: "prop", type: "sm · md · lg", desc: { zh: "尺寸档位，默认 <code>md</code>", en: "Size tier, defaults to <code>md</code>" } },
    { name: "disabled / readonly / invalid", kind: "prop", type: "boolean", desc: { zh: "禁用、只读与校验失败态", en: "Disabled, readonly, and invalid states" } },
  ],
};
