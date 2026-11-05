import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "badge",
  component: "Badge",
  title: { zh: "徽标", en: "Badge" },
  importPath: "@mango-write/ui",
  rows: [
    {
      name: "value",
      kind: "prop",
      type: "string | number",
      desc: {
        zh: "显示内容；为空且无默认插槽时渲染为状态圆点",
        en: "Displayed content; renders as a status dot when empty with no default slot",
      },
    },
    {
      name: "severity",
      kind: "prop",
      type: "primary · secondary · success · info · warn · warning · danger · contrast",
      desc: { zh: "语义色彩；默认 <code>primary</code>", en: "Semantic tone; defaults to <code>primary</code>" },
    },
    {
      name: "size",
      kind: "prop",
      type: "xs · sm · md · lg · small · large",
      desc: {
        zh: "尺寸档位；不传则跟随容器密度上下文",
        en: "Size tier; follows the container's density context when omitted",
      },
    },
    {
      name: "#default",
      kind: "slot",
      type: "—",
      desc: {
        zh: "自定义徽标内部内容，优先级高于 <code>value</code>",
        en: "Custom badge content, taking precedence over <code>value</code>",
      },
    },
  ],
};
