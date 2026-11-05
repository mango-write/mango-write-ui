import { Bookmark, Check, Zap } from "lucide-vue-next";
import { Tag } from "../../../src";
import type { UsageEntry } from "../types";

const severities = ["primary", "secondary", "success", "info", "warn", "danger", "contrast"] as const;

export const usage: UsageEntry = {
  slug: "tag",
  component: Tag,
  tag: "Tag",
  controls: [
    { prop: "value", label: "文本", kind: "text", default: "已收录", slot: true },
    {
      prop: "severity",
      label: "语义",
      kind: "enum",
      default: "primary",
      options: severities.map((s) => ({ label: s, value: s })),
    },
    {
      prop: "icon",
      label: "图标",
      kind: "enum",
      default: "",
      componentOptions: [
        { name: "Check", component: Check },
        { name: "Bookmark", component: Bookmark },
        { name: "Zap", component: Zap },
      ],
    },
    { prop: "rounded", label: "胶囊形", kind: "boolean", default: false },
  ],
};
