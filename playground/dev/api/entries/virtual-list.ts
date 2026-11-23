import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "virtual-list",
  component: "VirtualList",
  title: { zh: "虚拟列表", en: "VirtualList" },
  importPath: "@mango-write/ui-vue",
  rows: [
    { name: "items", kind: "prop", type: "readonly T[]", desc: { zh: "已加载的条目", en: "Loaded items" } },
    { name: "itemKey", kind: "prop", type: "(item: T) => string | number", desc: { zh: "条目的稳定唯一键", en: "Stable, unique item key" } },
    {
      name: "estimateSize", kind: "prop", type: "number | ((item: T, index: number) => number)",
      desc: { zh: "实际测量前的预估行高（像素）", en: "Estimated row height in pixels before measurement" },
    },
    { name: "overscan", kind: "prop", type: "number", desc: { zh: "视口两侧额外渲染的条数，默认 5", en: "Extra rendered rows on each side of the viewport, defaults to 5" } },
    { name: "pinnedKeys", kind: "prop", type: "readonly VirtualListKey[]", desc: { zh: "滚出视口后仍保留的条目", en: "Rows to retain outside the viewport" } },
    { name: "default", kind: "slot", type: "{ item: T; index: number }", desc: { zh: "条目内容", en: "Item content" } },
    { name: "empty", kind: "slot", desc: { zh: "列表没有条目时的内容", en: "Content for an empty list" } },
    { name: "footer", kind: "slot", desc: { zh: "列表末尾的永久挂载区域", en: "Always-mounted area after the list" } },
  ],
};
