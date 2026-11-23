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
      type: "1 · 0 / boolean | 'always'",
      desc: {
        zh: "周首日（默认 <code>1</code> 周一，<code>0</code> 周日）。「回到今天」与月份箭头同组，默认跨月时显示，<code>always</code> 时始终显示，<code>false</code> 时隐藏。",
        en: "First day of the week (<code>1</code> Monday by default, <code>0</code> Sunday). The month navigation shows “Back to today” when viewing other months by default, in every month with <code>always</code>, and hides it with <code>false</code>.",
      },
    },
    {
      name: "viewDate / hideOutsideDays / dayLabel",
      kind: "prop",
      type: "Date | string | null / boolean / (cell: CalendarCell) => string",
      desc: {
        zh: "独立设置可见月份，保留已选日期。<code>hideOutsideDays</code> 隐藏相邻月份的日期内容，<code>dayLabel</code> 可为日期补充无障碍说明。",
        en: "Set the visible month independently of the selected date. <code>hideOutsideDays</code> hides dates from neighboring months, and <code>dayLabel</code> provides accessible labels for dates.",
      },
    },
    {
      name: "pickerAppendTo",
      kind: "prop",
      type: "'self' | 'body'",
      desc: {
        zh: "年月浮层默认在日历内渲染。滚动侧栏等可能裁剪浮层的容器可设为 <code>body</code>。",
        en: "The year and month picker renders inside the calendar by default. Use <code>body</code> in containers such as scrolling sidebars that can clip popovers.",
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
      name: "@select / @date-select / @view / @today",
      kind: "event",
      type: "(isoDate: string) / (date: Date) / (range: CalendarViewRange) / (date: Date)",
      desc: {
        zh: "点选日期时发出 ISO 日期键与 <code>Date</code>。月份导航发出 <code>{ from, until, year, month }</code>。回到今天时也发出当天日期，由调用方决定是否选中今天。",
        en: "Day selection emits the ISO date key and <code>Date</code>. Month navigation emits <code>{ from, until, year, month }</code>. The Today action also emits today’s date for consumers that want to select it.",
      },
    },
    {
      name: "title / navigation / footer",
      kind: "slot",
      type: "CalendarTitleContext / CalendarNavigationContext / CalendarTitleContext",
      desc: {
        zh: "自定义年月标题内容、导航按钮和底部内容。导航提供 <code>previous</code>、<code>next</code> 和 <code>today</code> 动作。React 对应 <code>renderTitle</code>、<code>renderNavigation</code> 和 <code>renderFooter</code>。",
        en: "Customize the title content, navigation controls, and footer. Navigation provides <code>previous</code>, <code>next</code>, and <code>today</code> actions. In React, use <code>renderTitle</code>, <code>renderNavigation</code>, and <code>renderFooter</code>.",
      },
    },
    {
      name: "weekday / day / month",
      kind: "slot",
      type: "{ label, index } / { cell: CalendarCell } / CalendarMonthContext",
      desc: {
        zh: "自定义星期、日期及快选月份的内容，沿用组件的网格、选中态和点击行为。React 对应 <code>renderWeekday</code>、<code>renderDay</code> 和 <code>renderMonth</code>。",
        en: "Customize the weekday, date, and quick-picker month content while retaining the grid, selection state, and click behavior. In React, use <code>renderWeekday</code>, <code>renderDay</code>, and <code>renderMonth</code>.",
      },
    },
  ],
};
