import { h } from "vue";
import { Slider } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

export const usage: UsageEntry = {
  slug: "slider",
  component: Slider,
  tag: "Slider",
  controls: [
    { prop: "modelValue", vname: "value", label: "数值", kind: "number", default: 40, vmodel: true },
    { prop: "min", label: "最小值", kind: "number", default: 0 },
    { prop: "max", label: "最大值", kind: "number", default: 100 },
    { prop: "step", label: "步长", kind: "number", default: undefined },
    { prop: "showTicks", label: "刻度点", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) =>
    h(Slider, {
      modelValue: v.value as number | undefined,
      "onUpdate:modelValue": (x: unknown) => {
        v.value = x as number;
      },
      min: v.min as number | undefined,
      max: v.max as number | undefined,
      step: (v.step as number | undefined) || undefined,
      showTicks: Boolean(v.showTicks) && typeof v.step === "number" && v.step > 0,
      disabled: Boolean(v.disabled),
      ariaLabel: "示例滑块",
      style: "width: min(300px, 100%)",
    }),
  code: (v: UsageValues) => {
    const attrs = [
      'v-model="value"',
      ":aria-label=\"'示例滑块'\"",
      Number(v.min) !== 0 ? `:min="${v.min}"` : "",
      Number(v.max) !== 100 ? `:max="${v.max}"` : "",
      typeof v.step === "number" && v.step > 0 ? `:step="${v.step}"` : "",
      v.showTicks && typeof v.step === "number" && v.step > 0 ? "show-ticks" : "",
      v.disabled ? "disabled" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["Slider"],
      vue: ["ref"],
      setup: [`const value = ref(${v.value ?? 0});`],
      template: `<Slider style="width: min(300px, 100%)"\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
