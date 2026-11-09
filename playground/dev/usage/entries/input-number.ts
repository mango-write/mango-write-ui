import { InputNumber } from "@mango-write/ui-vue";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "input-number",
  component: InputNumber,
  tag: "InputNumber",
  controls: [
    { prop: "modelValue", vname: "count", label: "数值", kind: "number", default: 3, vmodel: true },
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
    { prop: "suffix", label: "后缀", kind: "text", default: "" },
    { prop: "showButtons", label: "步进按钮", kind: "boolean", default: false },
    { prop: "fluid", label: "撑满容器", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
};
