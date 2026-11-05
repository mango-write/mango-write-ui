import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "tag",
  component: "Tag",
  title: { zh: "标签", en: "Tag" },
  importPath: "@mango-write/ui",
  rows: [
    {
      name: "value",
      kind: "prop",
      type: "string | number | null",
      desc: { zh: "标签文本内容", en: "The tag's text content" },
    },
    {
      name: "severity",
      kind: "prop",
      type: "primary · secondary · success · info · warn · warning · danger · contrast",
      desc: { zh: "语义色彩；默认 <code>primary</code>", en: "Semantic tone; defaults to <code>primary</code>" },
    },
    {
      name: "rounded",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "是否使用胶囊圆角（<code>--radius-full</code>）；默认 <code>false</code>",
        en: "Use the capsule radius (<code>--radius-full</code>); defaults to <code>false</code>",
      },
    },
    {
      name: "icon",
      kind: "prop",
      type: "Component",
      desc: { zh: "前置 Lucide 图标组件", en: "Leading Lucide icon component" },
    },
    {
      name: "@click",
      kind: "event",
      type: "(event: MouseEvent) => void",
      desc: { zh: "点击标签时触发", en: "Fires when the tag is clicked" },
    },
    {
      name: "#icon / #default",
      kind: "slot",
      type: "—",
      desc: { zh: "自定义图标或标签主体内容", en: "Customize the icon or the tag body" },
    },
  ],
};
