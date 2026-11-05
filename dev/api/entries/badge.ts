import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "badge",
  component: "Badge",
  title: "徽标",
  importPath: "@mango-write/ui",
  rows: [
    { name: "value", kind: "prop", type: "string | number", desc: "显示内容；为空且无默认插槽时渲染为状态圆点" },
    { name: "severity", kind: "prop", type: "primary · secondary · success · info · warn · warning · danger · contrast", desc: "语义色彩；默认 <code>primary</code>" },
    { name: "size", kind: "prop", type: "xs · sm · md · lg · small · large", desc: "尺寸档位；不传则跟随容器密度上下文" },
    { name: "#default", kind: "slot", type: "—", desc: "自定义徽标内部内容，优先级高于 <code>value</code>" },
  ],
};
