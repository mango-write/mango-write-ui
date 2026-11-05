import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "action-menu",
  component: "ActionMenu",
  title: "对象菜单",
  importPath: "@mango-write/ui",
  rows: [
    { name: "items", kind: "prop", type: "ActionMenuItem[]", desc: "菜单项数组；支持动态 <code>visible</code> 与 <code>disabled</code> 布尔值或函数" },
    { name: "v-model:open", kind: "prop", type: "boolean", desc: "可选受控打开状态" },
    { name: "children / items", kind: "prop", type: "ActionMenuItem[]", desc: "二级子菜单项列表；悬停或按 <code>ArrowRight</code> 展开" },
    { name: "shortcut / tooltip / danger", kind: "prop", type: "string / boolean", desc: "右侧等宽快捷键提示、悬停气泡说明（禁用项同样生效）、危险红语义" },
    { name: "#icon", kind: "slot", type: "{ item }", desc: "自定义菜单项前置图标插槽" },
    { name: "toggle(event, target) / show(event, target) / hide()", kind: "method", type: "暴露方法", desc: "<code>contextmenu</code> 事件自动取鼠标坐标，常规点击优先取锚点元素" },
  ],
};
