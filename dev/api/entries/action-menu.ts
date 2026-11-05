import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "action-menu",
  component: "ActionMenu",
  title: { zh: "对象菜单", en: "Action menu" },
  importPath: "@mango-write/ui",
  rows: [
    { name: "items", kind: "prop", type: "ActionMenuItem[]", desc: { zh: "菜单项数组；支持动态 <code>visible</code> 与 <code>disabled</code> 布尔值或函数", en: "Menu item array; <code>visible</code> and <code>disabled</code> accept booleans or functions" } },
    { name: "v-model:open", kind: "prop", type: "boolean", desc: { zh: "可选受控打开状态", en: "Optional controlled open state" } },
    { name: "children / items", kind: "prop", type: "ActionMenuItem[]", desc: { zh: "二级子菜单项列表；悬停或按 <code>ArrowRight</code> 展开", en: "Second-level submenu items; expand on hover or <code>ArrowRight</code>" } },
    { name: "shortcut / tooltip / danger", kind: "prop", type: "string / boolean", desc: { zh: "右侧等宽快捷键提示、悬停气泡说明（禁用项同样生效）、危险红语义", en: "Monospaced shortcut hint on the right, hover tooltip (works on disabled items too), danger-red semantics" } },
    { name: "#icon", kind: "slot", type: "{ item }", desc: { zh: "自定义菜单项前置图标插槽", en: "Slot to replace the leading icon of a menu item" } },
    { name: "toggle(event, target) / show(event, target) / hide()", kind: "method", type: { zh: "暴露方法", en: "exposed method" }, desc: { zh: "<code>contextmenu</code> 事件自动取鼠标坐标，常规点击优先取锚点元素", en: "<code>contextmenu</code> uses the pointer coordinates automatically; regular clicks prefer the anchor element" } },
  ],
};
