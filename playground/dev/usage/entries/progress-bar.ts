import { ProgressBar } from "@mango-write/ui-vue";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "progress-bar",
  component: ProgressBar,
  tag: "ProgressBar",
  controls: [
    { prop: "value", label: "进度", kind: "number", default: 0, vmodel: true },
    {
      prop: "mode",
      label: "模式",
      kind: "enum",
      default: "determinate",
      options: [
        { label: "确定进度", value: "determinate" },
        { label: "循环等待", value: "indeterminate" },
      ],
    },
    { prop: "showValue", label: "显示数值", kind: "boolean", default: true },
  ],
};
