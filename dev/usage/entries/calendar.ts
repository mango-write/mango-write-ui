import { h } from "vue";
import { Calendar } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

export const usage: UsageEntry = {
  slug: "calendar",
  component: Calendar,
  tag: "Calendar",
  controls: [
    {
      prop: "selectionMode",
      label: "选择模式",
      kind: "enum",
      default: "single",
      options: [
        { label: "单选 single", value: "single" },
        { label: "区间 range", value: "range" },
        { label: "多选 multiple", value: "multiple" },
      ],
    },
    {
      prop: "firstDayOfWeek",
      label: "周首日",
      kind: "enum",
      default: "1",
      options: [
        { label: "周一 (1)", value: "1" },
        { label: "周日 (0)", value: "0" },
      ],
    },
    { prop: "showTodayShortcut", label: "跨月回到今天", kind: "boolean", default: true },
    { prop: "fluid", label: "撑满容器", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) => {
    if (!((v.date as unknown) instanceof Date)) v.date = new Date(2026, 10, 12) as never;
    const firstDow = Number(v.firstDayOfWeek ?? 1) === 0 ? 0 : 1;
    return h(Calendar, {
      modelValue: v.date as unknown as Date,
      "onUpdate:modelValue": (x: unknown) => {
        v.date = x as never;
      },
      selectionMode: (v.selectionMode as "single" | "range" | "multiple") ?? "single",
      firstDayOfWeek: firstDow,
      showTodayShortcut: Boolean(v.showTodayShortcut ?? true),
      fluid: Boolean(v.fluid),
      disabled: Boolean(v.disabled),
      ariaLabel: "日期面板",
    });
  },
  code: (v: UsageValues) => {
    const attrs = [
      'v-model="date"',
      v.selectionMode && v.selectionMode !== "single" ? `selection-mode="${v.selectionMode}"` : "",
      v.firstDayOfWeek === "0" ? ':first-day-of-week="0"' : "",
      v.showTodayShortcut === false ? ':show-today-shortcut="false"' : "",
      v.fluid ? "fluid" : "",
      v.disabled ? "disabled" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["Calendar"],
      vue: ["ref"],
      setup: ["const date = ref(new Date());"],
      template: `<Calendar\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
