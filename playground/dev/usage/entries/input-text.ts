import { InputText } from "@mango-write/ui-vue";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "input-text",
  component: InputText,
  tag: "InputText",
  controls: [
    { prop: "modelValue", vname: "title", label: "内容", kind: "text", default: "", vmodel: true },
    { prop: "placeholder", label: "占位提示", kind: "text", default: "输入论文标题" },
    {
      prop: "type",
      label: "类型",
      kind: "enum",
      default: "text",
      options: [
        { label: "text", value: "text" },
        { label: "email", value: "email" },
        { label: "password", value: "password" },
        { label: "search", value: "search" },
      ],
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
    { prop: "fluid", label: "撑满容器", kind: "boolean", default: false },
    { prop: "invalid", label: "错误态", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
};
