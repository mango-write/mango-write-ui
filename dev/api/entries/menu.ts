import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "menu",
  component: "Menu",
  title: "菜单",
  importPath: "@mango-write/ui",
  exports: ["Menu"],
  rows: [
    { name: "model", kind: "prop", type: "MenuItem[]", desc: "菜单项数组：支持 <code>label</code>、<code>icon</code>、<code>shortcut</code>、<code>danger</code>、<code>disabled</code>、<code>separator</code>、<code>items</code>、<code>command</code>、<code>url</code>" },
    { name: "popup / appendTo", kind: "prop", type: "boolean / string", desc: "是否为弹出式霜面浮层（默认 <code>false</code>）；挂载目标默认 <code>\"body\"</code>" },
    { name: "#start / #end", kind: "slot", type: "插槽", desc: "菜单列表上方与下方的固定扩展区域" },
    { name: "#item / #submenulabel", kind: "slot", type: "{ item, label, props }", desc: "自定义单项渲染或分组标题渲染" },
    { name: "toggle(event, target) / show / hide", kind: "method", type: "暴露方法", desc: "在 <code>popup</code> 模式下控制菜单锚定弹出与收起" },
  ],
};
