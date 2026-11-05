import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "menu",
  component: "Menu",
  title: { zh: "菜单", en: "Menu" },
  importPath: "@mango-write/ui",
  exports: ["Menu"],
  rows: [
    { name: "model", kind: "prop", type: "MenuItem[]", desc: { zh: "菜单项数组：支持 <code>label</code>、<code>icon</code>、<code>shortcut</code>、<code>danger</code>、<code>disabled</code>、<code>separator</code>、<code>items</code>、<code>command</code>、<code>url</code>", en: "Menu item array: supports <code>label</code>, <code>icon</code>, <code>shortcut</code>, <code>danger</code>, <code>disabled</code>, <code>separator</code>, <code>items</code>, <code>command</code>, <code>url</code>" } },
    { name: "popup / appendTo", kind: "prop", type: "boolean / string", desc: { zh: "是否为弹出式霜面浮层（默认 <code>false</code>）；挂载目标默认 <code>\"body\"</code>", en: "Renders as a popup frost layer (<code>false</code> by default); mount target defaults to <code>\"body\"</code>" } },
    { name: "#start / #end", kind: "slot", type: { zh: "插槽", en: "slot" }, desc: { zh: "菜单列表上方与下方的固定扩展区域", en: "Fixed extension areas above and below the menu list" } },
    { name: "#item / #submenulabel", kind: "slot", type: "{ item, label, props }", desc: { zh: "自定义单项渲染或分组标题渲染", en: "Custom rendering for individual items or group headings" } },
    { name: "toggle(event, target) / show / hide", kind: "method", type: { zh: "暴露方法", en: "exposed method" }, desc: { zh: "在 <code>popup</code> 模式下控制菜单锚定弹出与收起", en: "Anchors, shows, and hides the menu in <code>popup</code> mode" } },
  ],
};
