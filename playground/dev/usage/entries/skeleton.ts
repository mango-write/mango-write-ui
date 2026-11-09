import { Skeleton } from "@mango-write/ui-vue";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "skeleton",
  component: Skeleton,
  tag: "Skeleton",
  controls: [
    {
      prop: "shape",
      label: "形状",
      kind: "enum",
      default: "rectangle",
      options: [
        { label: "矩形", value: "rectangle" },
        { label: "圆形", value: "circle" },
      ],
    },
    { prop: "width", label: "宽", kind: "text", default: "100%" },
    { prop: "height", label: "高", kind: "text", default: "1.5rem" },
    { prop: "borderRadius", label: "圆角", kind: "text", default: undefined },
    {
      prop: "animation",
      label: "动效",
      kind: "enum",
      default: "wave",
      options: [
        { label: "波动 wave", value: "wave" },
        { label: "静止 none", value: "none" },
      ],
    },
  ],
};
