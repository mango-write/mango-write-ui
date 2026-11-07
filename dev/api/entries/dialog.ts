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
      name: "size / width",
      kind: "prop",
      type: "'sm' | 'md' | 'lg' | 'xl' · string",
      desc: {
        zh: "标准宽度分档（<code>sm</code> 27.5rem / <code>md</code> 40rem / <code>lg</code> 53.75rem / <code>xl</code> 68.75rem），或经 <code>width</code> 传入任意 CSS 宽度（默认 <code>min(32rem, calc(100vw - var(--space-8)))</code>）",
        en: "Standard width tiers (<code>sm</code> 27.5rem / <code>md</code> 40rem / <code>lg</code> 53.75rem / <code>xl</code> 68.75rem), or custom CSS <code>width</code> (default <code>min(32rem, calc(100vw - var(--space-8)))</code>)",
      },
    },
    {
      name: "canBack / backLabel / @back",
      kind: "prop",
      type: "boolean · string · () => void",
      desc: {
        zh: "同窗多级下钻：<code>canBack=true</code> 时在标题左侧渲染返回按钮并触发 <code>@back</code>，严禁弹窗叠弹窗",
        en: "In-place drill-down: <code>canBack=true</code> renders a back button beside the title and emits <code>@back</code>, avoiding stacked modals",
      },
    },
    {
      name: "scopeText / bodyScroll",
      kind: "prop",
      type: "string · boolean",
      desc: {
        zh: "<code>scopeText</code> 在头部下方展示常驻范围与筛选上下文条；<code>bodyScroll=false</code> 锁定外层主体滚动，仅让内部 <code>DataTable</code> 或 <code>.mw-dialog-scroll</code> 独立内滚",
        en: "<code>scopeText</code> renders a pinned scope bar below the header; <code>bodyScroll=false</code> locks the outer body so inner <code>DataTable</code> or <code>.mw-dialog-scroll</code> scrolls independently",
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
      name: "#header / #header-extra / #scope / #toolbar / #lead / #default / #footer-left / #footer",
      kind: "slot",
      type: { zh: "插槽", en: "Slot" },
      desc: {
        zh: "标题区、标题右侧状态徽标、范围上下文条扩展区、固定子表单/筛选栏、引导区、可滚动主体、底栏左侧常驻开关与底栏右侧主次按钮",
        en: "Title area, inline header badge, scope strip extension, pinned subform/filter toolbar, lead area, scrollable body, split footer left, and footer right actions",
      },
    },
    {
      name: ".mw-dialog-grid / .mw-dialog-scroll / .mw-dialog-subform",
      kind: "css",
      type: "class",
      desc: {
        zh: "弹窗内部标准布局类：双栏表单网格（含 <code>.mw-dialog-span</code> 跨列与 <code>.mw-dialog-divider</code> 分节线）、限高滚动容器（48vh）与常驻子表单栏",
        en: "Built-in dialog layout classes: 2-column form grid (with <code>.mw-dialog-span</code> and <code>.mw-dialog-divider</code>), bounded scroll box (48vh), and pinned subform bar",
      },
    },
  ],
};
