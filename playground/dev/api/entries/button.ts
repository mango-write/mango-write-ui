import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "button",
  component: "Button",
  title: { zh: "按钮", en: "Button" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "variant",
      kind: "prop",
      type: "filled · tinted · outlined · text · link",
      desc: { zh: "视觉重量；默认 filled", en: "Visual weight; defaults to filled" },
    },
    {
      name: "severity",
      kind: "prop",
      type: "primary · secondary · danger · contrast · success · info · warning",
      desc: { zh: "语义；默认 primary", en: "Semantic tone; defaults to primary" },
    },
    {
      name: "size",
      kind: "prop",
      type: "xs · sm · md · lg",
      desc: { zh: "不传则跟随密度上下文", en: "Follows the density context when omitted" },
    },
    {
      name: "rounded",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "胶囊形（<code>--radius-full</code>），文字内距自动放宽，icon-only 为正圆",
        en: "Capsule shape (<code>--radius-full</code>); text padding widens automatically, icon-only becomes a circle",
      },
    },
    {
      name: "icon",
      kind: "prop",
      type: "Component",
      desc: {
        zh: "Lucide 图标组件，尺寸取 <code>--control-icon</code>",
        en: "A Lucide icon component, sized by <code>--control-icon</code>",
      },
    },
    {
      name: "loading / disabled",
      kind: "prop",
      type: "boolean",
      desc: { zh: "加载时阻断点击并显示指示", en: "Blocks clicks and shows an indicator while loading" },
    },
  ],
};
