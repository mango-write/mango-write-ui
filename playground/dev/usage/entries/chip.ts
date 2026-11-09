import { FileText, Sparkles } from "lucide-vue-next";
import { Chip } from "@mango-write/ui-vue";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "chip",
  component: Chip,
  tag: "Chip",
  controls: [
    { prop: "label", label: "文本", kind: "text", default: "chapter-3.pdf", slot: true },
    {
      prop: "icon",
      label: "图标",
      kind: "enum",
      default: "",
      componentOptions: [
        { name: "FileText", component: FileText },
        { name: "Sparkles", component: Sparkles },
      ],
    },
    { prop: "removable", label: "可移除", kind: "boolean", default: false },
  ],
};
