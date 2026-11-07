import { h } from "vue";
import { StatBar, StatCard, type StatTone } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

export const usage: UsageEntry = {
  slug: "stat-bar",
  component: StatCard,
  tag: "StatCard",
  extraTags: ["StatBar"],
  controls: [
    { prop: "label", label: "指标名称", kind: "text", default: "剩余可用额度" },
    { prop: "value", label: "指标数值", kind: "text", default: "128,400" },
    { prop: "sub", label: "副标题说明", kind: "text", default: "本月已用 71,600 (35.8%)" },
    {
      prop: "tone",
      label: "语义色调",
      kind: "enum",
      default: "default",
      options: [
        { label: "默认", value: "default" },
        { label: "主色", value: "accent" },
        { label: "成功", value: "success" },
        { label: "警告", value: "warning" },
        { label: "危险", value: "danger" },
      ],
    },
    { prop: "actionLabel", label: "右上角操作", kind: "text", default: "充值明细" },
  ],
  render: (v: UsageValues) =>
    h(
      "div",
      { style: "display: flex; flex-direction: column; gap: var(--space-4); width: 100%; max-width: 320px;" },
      [
        h(StatCard, {
          label: (v.label as string) ?? "剩余可用额度",
          value: (v.value as string) ?? "128,400",
          sub: (v.sub as string) || undefined,
          tone: (v.tone as StatTone) ?? "default",
          actionLabel: (v.actionLabel as string) || undefined,
        }),
      ],
    ),
  code: (v: UsageValues) => {
    const attrs = [
      `label="${v.label ?? "剩余可用额度"}"`,
      `value="${v.value ?? "128,400"}"`,
      v.sub ? `sub="${v.sub}"` : "",
      v.tone && v.tone !== "default" ? `tone="${v.tone}"` : "",
      v.actionLabel ? `action-label="${v.actionLabel}"` : "",
    ].filter(Boolean);
    return sfc({
      ui: ["StatCard"],
      template: `<StatCard\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
