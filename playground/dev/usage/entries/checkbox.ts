import { Checkbox } from "@mango-write/ui-vue";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "checkbox",
  component: Checkbox,
  tag: "Checkbox",
  baseProps: { binary: true, "aria-label": "导出附件" },
  controls: [
    { prop: "modelValue", vname: "checked", label: "选中", kind: "boolean", default: false, vmodel: true },
    {
      prop: "size",
      label: "尺寸",
      kind: "enum",
      default: "md",
      options: [
        { label: "sm", value: "sm" },
        { label: "md", value: "md" },
        { label: "lg", value: "lg" },
      ],
    },
    { prop: "indeterminate", label: "半选", kind: "boolean", default: false },
    { prop: "invalid", label: "错误态", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
};
