import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "tag",
  component: "Tag",
  title: "标签",
  importPath: "@mango-write/ui",
  rows: [
    { name: "value", kind: "prop", type: "string | number | null", desc: "标签文本内容" },
    { name: "severity", kind: "prop", type: "primary · secondary · success · info · warn · warning · danger · contrast", desc: "语义色彩；默认 <code>primary</code>" },
    { name: "rounded", kind: "prop", type: "boolean", desc: "是否使用胶囊圆角（<code>--radius-full</code>）；默认 <code>false</code>" },
    { name: "icon", kind: "prop", type: "Component", desc: "前置 Lucide 图标组件" },
    { name: "@click", kind: "event", type: "(event: MouseEvent) => void", desc: "点击标签时触发" },
    { name: "#icon / #default", kind: "slot", type: "—", desc: "自定义图标或标签主体内容" },
  ],
};
