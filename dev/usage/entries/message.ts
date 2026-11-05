import { Message } from "../../../src";
import type { UsageEntry } from "../types";

const severities = ["info", "success", "warn", "error", "secondary", "contrast"] as const;

export const usage: UsageEntry = {
  slug: "message",
  component: Message,
  tag: "Message",
  controls: [
    { prop: "text", label: "正文", kind: "text", default: "引用格式已按 GB/T 7714 统一重排。", slot: true },
    {
      prop: "severity",
      label: "语义",
      kind: "enum",
      default: "info",
      options: severities.map((s) => ({ label: s, value: s })),
    },
    { prop: "closable", label: "可关闭", kind: "boolean", default: false },
  ],
};
