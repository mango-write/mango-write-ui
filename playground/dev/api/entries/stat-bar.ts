import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "stat-bar",
  component: "StatBar / StatCard",
  title: { zh: "指标条与指标卡", en: "StatBar / StatCard" },
  importPath: "@mango-write/ui-vue",
  exports: ["StatBar", "StatCard", "AdminStatBar", "AdminDetailCard"],
  rows: [
    {
      name: "StatBar items",
      kind: "prop",
      type: "StatItem[]",
      desc: {
        zh: "水平紧凑指标条的数据数组：每项含 <code>label</code>、<code>value</code>、可选 <code>sub</code> 与 <code>tone</code>",
        en: "Items for the horizontal compact metric strip: each with <code>label</code>, <code>value</code>, optional <code>sub</code>, and <code>tone</code>",
      },
    },
    {
      name: "StatCard label / value / sub",
      kind: "prop",
      type: "string · string | number · string",
      desc: {
        zh: "指标卡的标题标签、等宽主数值（tabular-nums）与底部辅助说明",
        en: "Card label, tabular primary value, and bottom subtitle",
      },
    },
    {
      name: "StatCard / StatItem tone",
      kind: "prop",
      type: "'default' | 'accent' | 'success' | 'warning' | 'danger'",
      desc: {
        zh: "数值的语义色调，默认 <code>default</code>（主正文色）",
        en: "Semantic tone applied to the primary figure; defaults to <code>default</code>",
      },
    },
    {
      name: "StatCard actionLabel / actionDisabled / @action",
      kind: "prop",
      type: "string · boolean · () => void",
      desc: {
        zh: "卡片右上角轻量文字按钮文案、禁用态与点击事件（如「充值明细」「查看日志」）",
        en: "Optional top-right text action label, disabled state, and click event",
      },
    },
    {
      name: "StatCard #head / #value / #sub / #default",
      kind: "slot",
      type: { zh: "插槽", en: "Slot" },
      desc: {
        zh: "自定义卡片头部、数值区、副标题区或底部扩展内容",
        en: "Custom slots for header, value, subtitle, or extra body content",
      },
    },
  ],
};
