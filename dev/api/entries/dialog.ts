import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "dialog",
  component: "Dialog",
  title: { zh: "对话框", en: "Dialog" },
  importPath: "@mango-write/ui",
  rows: [
    {
      name: "v-model:open / v-model:visible",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "受控打开状态（主契约 <code>open</code>，兼容 <code>visible</code>）",
        en: "Controlled open state (primary contract <code>open</code>, <code>visible</code> kept for compatibility)",
      },
    },
    {
      name: "title / description",
      kind: "prop",
      type: "string",
      desc: {
        zh: "弹窗标题（兼容 <code>header</code>）与副标题说明文案",
        en: "Dialog title (<code>header</code> kept for compatibility) and subtitle description",
      },
    },
    {
      name: "width",
      kind: "prop",
      type: "string",
      desc: {
        zh: "自定义宽度，默认 <code>min(32rem, calc(100vw - var(--space-8)))</code>",
        en: "Custom width; defaults to <code>min(32rem, calc(100vw - var(--space-8)))</code>",
      },
    },
    {
      name: "maximizable / closable / showHeader",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "最大化按钮（默认 false）、关闭按钮（默认 true）、头部显隐（默认 true）",
        en: "Maximize button (default false), close button (default true), header visibility (default true)",
      },
    },
    {
      name: "dismissableMask / closeOnEscape",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "点击遮罩关闭（默认 false）、按 Escape 关闭（默认 true）",
        en: "Close on scrim click (default false), close on Escape (default true)",
      },
    },
    {
      name: "#header / #lead / #default / #footer",
      kind: "slot",
      type: { zh: "插槽", en: "Slot" },
      desc: {
        zh: "标题区、正文上方固定引导区、可滚动主体、底栏动作区（默认 md 密度）",
        en: "Title area, fixed lead above the body, scrollable body, and footer action area (default md density)",
      },
    },
  ],
};
