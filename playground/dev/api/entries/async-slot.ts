import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "async-slot",
  component: "AsyncSlot",
  title: { zh: "异步四态", en: "Async four-state" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "status",
      kind: "prop",
      type: "loading · empty · error · ready",
      desc: {
        zh: "当前异步状态（必填）",
        en: "Current async state (required)",
      },
    },
    {
      name: "skeleton",
      kind: "prop",
      type: "list · card · text · none",
      desc: {
        zh: "加载态内置骨架形状",
        en: "Built-in loading skeleton shape",
      },
    },
    {
      name: "emptyTitle / emptyHint",
      kind: "prop",
      type: "string",
      desc: {
        zh: "空态标题与提示的 i18n key",
        en: "i18n keys for the empty-state title and hint",
      },
    },
    {
      name: "@retry",
      kind: "event",
      type: "() => void",
      desc: {
        zh: "错误态点击重试按钮触发",
        en: "Fired when the retry button is clicked in the error state",
      },
    },
  ],
};
