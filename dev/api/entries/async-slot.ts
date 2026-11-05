import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "async-slot",
  component: "AsyncSlot",
  title: "异步四态",
  importPath: "@mango-write/ui",
  rows: [
    { name: "status", kind: "prop", type: "loading · empty · error · ready", desc: "当前异步状态（必填）" },
    { name: "skeleton", kind: "prop", type: "list · card · text · none", desc: "加载态内置骨架形状" },
    { name: "emptyTitle / emptyHint", kind: "prop", type: "string", desc: "空态标题与提示的 i18n key" },
    { name: "@retry", kind: "event", type: "() => void", desc: "错误态点击重试按钮触发" },
  ],
};
