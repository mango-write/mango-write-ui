import { ProgressSpinner } from "../../../src";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "progress-spinner",
  component: ProgressSpinner,
  tag: "ProgressSpinner",
  controls: [
    { prop: "strokeWidth", label: "描边宽度", kind: "number", default: 4 },
    { prop: "ariaLabel", label: "无障碍名称", kind: "text", default: "加载中" },
  ],
};
