import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "calendar",
  component: "Calendar",
  title: { zh: "日期面板", en: "Calendar" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "v-model / selected",
      kind: "prop",
      type: "Date | string | Array<Date | null> | null",
      desc: {
        zh: "受控选中日期；<code>selected</code> 支持直接按 <code>YYYY-MM-DD</code> 字符串绑定单日（如手记时间流筛选）",
        en: "Controlled selected date; <code>selected</code> binds a single day directly as a <code>YYYY-MM-DD</code> string (e.g. research log filtering)",
      },
    },
    {
      name: "days / onlySelectableWithDays",
      kind: "prop",
      type: "Record<string, number> / boolean",
      desc: {
        zh: "按 <code>YYYY-MM-DD</code> 传入每日条目计数，自动渲染两档橙色热力底色；开启 <code>onlySelectableWithDays</code> 时仅允许点选有记录的日期",
        en: "Per-day counts keyed by <code>YYYY-MM-DD</code> with two-tier brand heat fills; with <code>onlySelectableWithDays</code>, only days with entries are clickable",
      },
    },
    {
      name: "selectionMode",
      kind: "prop",
      type: "single · range · multiple",
      desc: {
        zh: "单日（默认）、起止区间或多日选择，与 <code>DatePicker</code> 共用同一套选择模型",
        en: "Single day (default), range, or multiple dates, sharing the exact selection model with <code>DatePicker</code>",
      },
    },
    {
      name: "firstDayOfWeek / showTodayShortcut",
      kind: "prop",
      type: "1 · 0 / boolean",
      desc: {
        zh: "周首日（默认 <code>1</code> 周一，<code>0</code> 周日）；跨月浏览时头部自动浮现「回到今天」快捷按钮",
        en: "First day of week (default <code>1</code> Monday, <code>0</code> Sunday); shows a “Back to today” shortcut in the header when viewing other months",
      },
    },
    {
      name: "variant / fluid",
      kind: "prop",
      type: "card · plain / boolean",
      desc: {
        zh: "<code>card</code> 为独立抬起卡片面（默认），<code>plain</code> 为无框透明核（供 <code>DatePicker</code> 霜面浮层内嵌）；<code>fluid</code> 撑满侧栏宽度",
        en: "<code>card</code> renders a standalone raised card (default) and <code>plain</code> is borderless for embedding in <code>DatePicker</code>; <code>fluid</code> fills the sidebar width",
      },
    },
    {
      name: "@select / @date-select / @view",
      kind: "event",
      type: "(isoDate: string) / (date: Date) / (range: CalendarViewRange)",
      desc: {
        zh: "点选日期时同步发出 ISO 日期键与 <code>Date</code> 对象；翻月、快选年月或回到今天时发出当前月起止范围 <code>{ from, until, year, month }</code>",
        en: "Emits both the ISO date key and <code>Date</code> on selection; emits the visible month range <code>{ from, until, year, month }</code> on month navigation or quick jump",
      },
    },
  ],
};
