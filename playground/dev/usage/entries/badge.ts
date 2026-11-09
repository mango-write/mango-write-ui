import { Badge } from "@mango-write/ui-vue";
import type { UsageEntry } from "../types";

const severities = ["primary", "secondary", "success", "info", "warn", "danger", "contrast"] as const;

export const usage: UsageEntry = {
  slug: "badge",
  component: Badge,
  tag: "Badge",
  controls: [
    { prop: "value", label: "内容", kind: "text", default: "3", slot: true },
    {
      prop: "severity",
      label: "语义",
      kind: "enum",
      default: "primary",
      options: severities.map((s) => ({ label: s, value: s })),
    },
    {
      prop: "size",
      label: "尺寸",
      kind: "enum",
      default: undefined,
      options: [
        { label: "xs", value: "xs" },
        { label: "sm", value: "sm" },
        { label: "md", value: "md" },
        { label: "lg", value: "lg" },
      ],
    },
  ],
};
