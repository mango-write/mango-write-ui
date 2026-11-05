import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "progress-bar",
  component: "ProgressBar",
  title: { zh: "进度条", en: "Progress bar" },
  importPath: "@mango-write/ui",
  rows: [
    {
      name: "value",
      kind: "prop",
      type: "number",
      desc: {
        zh: "当前进度百分比（0–100，超出范围自动钳制）；默认 <code>0</code>",
        en: "Current percentage (0–100, clamped automatically); defaults to <code>0</code>",
      },
    },
    {
      name: "mode",
      kind: "prop",
      type: "determinate · indeterminate",
      desc: {
        zh: "定量或不确定时长模式；默认 <code>determinate</code>",
        en: "Determinate or indeterminate mode; defaults to <code>determinate</code>",
      },
    },
    {
      name: "showValue",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "是否在指示条内显示百分比文本；默认 <code>true</code>",
        en: "Show the percentage inside the indicator; defaults to <code>true</code>",
      },
    },
    {
      name: "#default",
      kind: "slot",
      type: "{ value: number }",
      desc: {
        zh: "自定义指示器内的进度文案（仅在 <code>determinate</code> 下渲染）",
        en: "Custom progress label inside the indicator (renders only in <code>determinate</code> mode)",
      },
    },
  ],
};
