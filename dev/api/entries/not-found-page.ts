import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "not-found-page",
  component: "NotFoundPage",
  title: "404 页",
  importPath: "@mango-write/ui",
  rows: [
    { name: "title / lead", kind: "prop", type: "string", desc: "主标题与说明文案" },
    { name: "path / pathLabel", kind: "prop", type: "string", desc: "可选的出错路径展示块" },
    { name: "primaryLabel / secondaryLabel", kind: "prop", type: "string", desc: "主按钮与次按钮文案" },
    { name: "@primary / @secondary", kind: "event", type: "() => void", desc: "点击主/次按钮触发的跳转回调" },
  ],
};
