import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "message",
  component: "Message",
  title: "提示条",
  importPath: "@mango-write/ui",
  rows: [
    { name: "severity", kind: "prop", type: "info · success · warn · warning · error · secondary · contrast", desc: "语义等级；默认 <code>info</code>" },
    { name: "icon", kind: "prop", type: "Component", desc: "前置 Lucide 图标组件" },
    { name: "closable", kind: "prop", type: "boolean", desc: "是否显示右上角关闭按钮；默认 <code>false</code>" },
    { name: "@close", kind: "event", type: "(event: MouseEvent) => void", desc: "点击关闭按钮隐藏提示条时触发" },
    { name: "#default / #icon", kind: "slot", type: "—", desc: "提示正文内容与自定义前置图标插槽" },
  ],
};
