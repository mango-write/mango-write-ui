import { Textarea } from "../../../src";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "textarea",
  component: Textarea,
  tag: "Textarea",
  controls: [
    { prop: "modelValue", vname: "abstract", label: "内容", kind: "text", default: "", vmodel: true },
    { prop: "placeholder", label: "占位提示", kind: "text", default: "输入摘要" },
    { prop: "rows", label: "行数", kind: "number", default: 3 },
    { prop: "autoResize", label: "随内容增高", kind: "boolean", default: false },
    { prop: "fluid", label: "撑满容器", kind: "boolean", default: true },
    { prop: "invalid", label: "错误态", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
};
