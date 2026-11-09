import { h } from "vue";
import { DatePicker } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

export const usage: UsageEntry = {
  slug: "date-picker",
  component: DatePicker,
  tag: "DatePicker",
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
    { prop: "placeholder", label: "占位提示", kind: "text", default: "选择投稿日期" },
    { prop: "showTime", label: "带时间", kind: "boolean", default: false },
    { prop: "hourFormat", label: "小时制", kind: "enum", default: "24", options: [{ label: "24", value: "24" }, { label: "12", value: "12" }] },
    { prop: "showIcon", label: "日历图标", kind: "boolean", default: false },
    { prop: "showClear", label: "清空按钮", kind: "boolean", default: false },
    { prop: "showButtonBar", label: "今天/清除栏", kind: "boolean", default: false },
    { prop: "fluid", label: "撑满容器", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) => {
    if (!((v.date as unknown) instanceof Date)) v.date = new Date(2026, 10, 12) as never;
    return h(DatePicker, {
      modelValue: v.date as unknown as Date,
      "onUpdate:modelValue": (x: unknown) => {
        v.date = x as never;
      },
      selectionMode: (v.selectionMode as "single" | "range" | "multiple") ?? "single",
      placeholder: v.placeholder as string | undefined,
      showTime: Boolean(v.showTime),
      hourFormat: (v.hourFormat as "12" | "24" | undefined) ?? "24",
      showIcon: Boolean(v.showIcon),
      showClear: Boolean(v.showClear),
      showButtonBar: Boolean(v.showButtonBar),
      fluid: Boolean(v.fluid),
      disabled: Boolean(v.disabled),
      ariaLabel: "投稿日期",
    });
  },
  code: (v: UsageValues) => {
    const attrs = [
      'v-model="date"',
      v.selectionMode && v.selectionMode !== "single" ? `selection-mode="${v.selectionMode}"` : "",
      v.placeholder ? `placeholder="${v.placeholder}"` : "",
      v.showTime ? "show-time" : "",
      v.showTime && v.hourFormat === "12" ? 'hour-format="12"' : "",
      v.showIcon ? "show-icon" : "",
      v.showClear ? "show-clear" : "",
      v.showButtonBar ? "show-button-bar" : "",
      v.fluid ? "fluid" : "",
      v.disabled ? "disabled" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["DatePicker"],
      vue: ["ref"],
      setup: ["const date = ref(new Date());"],
      template: `<DatePicker\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
