import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "admin-shell",
  component: "AdminListPage / AdminConfigPage / AdminDetailPage / AdminBoardPage",
  title: { zh: "后台页面四壳", en: "Admin Page Shells" },
  importPath: "@mango-write/ui-vue",
  exports: [
    "AdminListPage",
    "AdminConfigPage",
    "AdminDetailPage",
    "AdminBoardPage",
    "AdminBoardSection",
    "ADMIN_HEADER_LEAD_TAKEN",
  ],
  rows: [
    {
      name: "AdminListPage title / teleport",
      kind: "prop",
      type: "string · boolean",
      desc: {
        zh: "列表页壳：默认将 #actions 传送至宿主顶栏（#admin-header-actions）；teleport=false 时渲染内联页头",
        en: "List shell: teleports #actions into the host topbar by default; renders an inline header when teleport=false",
      },
    },
    {
      name: "AdminListPage #actions / #summary / #filters / #default / #pagination",
      kind: "slot",
      type: "slot",
      desc: {
        zh: "列表页五段式插槽：顶栏主动作、可选汇总条（#summary）、单行筛选栏（#filters）、实心吸顶表头（thead）与底部分页器（#pagination）固定常驻，仅 DataTable 表体（tbody）滚动",
        en: "Five-part list slots: topbar actions, optional summary (#summary), single-row filters (#filters), opaque sticky thead, and bottom paginator (#pagination) stay fixed while only DataTable tbody scrolls",
      },
    },
    {
      name: "AdminConfigPage dirtyCount / saving / confirmMessage + #toolbar",
      kind: "prop",
      type: "number · boolean · string · slot",
      desc: {
        zh: "配置页壳：页头（「N 项未保存」计数 + 保存按钮）与可选 #toolbar 固定置顶，仅下方 .admin-config-page__body 内的 ConfigSection 分组卡流滚动",
        en: "Config shell: pins the header (unsaved count + Save button) and optional #toolbar at the top while only the .admin-config-page__body section stream scrolls",
      },
    },
    {
      name: "AdminConfigPage save",
      kind: "event",
      type: "() => void",
      desc: {
        zh: "点击保存按钮（或通过二次确认后）触发",
        en: "Emitted when Save is clicked (or after confirmation passes)",
      },
    },
    {
      name: "AdminDetailPage backTo / showBack / backLabel + #cards / #tabs",
      kind: "prop",
      type: "unknown · boolean · string · slot",
      desc: {
        zh: "详情页壳：接管顶栏左侧注入返回按钮与 #title；顶部的 #cards 状态卡网格与 #tabs 页内标签栏（或默认槽直传 <Tabs> 的 TabList）均作为固定页面要素常驻，仅下方明细区滚动",
        en: "Detail shell: claims the topbar lead for back button and #title; #cards summary grid and #tabs tab bar (or direct <Tabs> TabList) stay fixed while only the detail data plane scrolls",
      },
    },
    {
      name: "AdminBoardPage + AdminBoardSection",
      kind: "prop",
      type: "title · #actions · #toolbar · #stats · #drill",
      desc: {
        zh: "看板与监控页壳：仅页头（标题 + #actions 时间窗筛选器）与可选 #toolbar 固定，下方 .admin-board-page__body 承载 #stats 指标条与 AdminBoardSection 图表卡片一同滚动",
        en: "Operational board shell: pins only the header (title + #actions time filters) and optional #toolbar, while .admin-board-page__body scrolls #stats and AdminBoardSection blocks together",
      },
    },
  ],
};
