import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "not-found-page",
  component: "NotFoundPage",
  title: { zh: "404 页", en: "404 page" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "title / lead",
      kind: "prop",
      type: "string",
      desc: {
        zh: "主标题与说明文案",
        en: "Primary title and supporting copy",
      },
    },
    {
      name: "path / pathLabel",
      kind: "prop",
      type: "string",
      desc: {
        zh: "可选的出错路径展示块",
        en: "Optional failed-path display block",
      },
    },
    {
      name: "primaryLabel / secondaryLabel",
      kind: "prop",
      type: "string",
      desc: {
        zh: "主按钮与次按钮文案",
        en: "Primary and secondary button labels",
      },
    },
    {
      name: "@primary / @secondary",
      kind: "event",
      type: "() => void",
      desc: {
        zh: "点击主/次按钮触发的跳转回调",
        en: "Navigation callbacks for the primary/secondary buttons",
      },
    },
  ],
};
