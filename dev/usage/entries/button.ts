import { Download, Filter, Plus, Settings, Sparkles } from "lucide-vue-next";
import { Button } from "../../../src";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "button",
  component: Button,
  tag: "Button",
  controls: [
    { prop: "label", label: "按钮文字", kind: "text", default: "保存修改", slot: true },
    {
      prop: "severity",
      label: "语义",
      kind: "enum",
      default: "primary",
      options: [
        { label: "主操作 primary", value: "primary" },
        { label: "次操作 secondary", value: "secondary" },
        { label: "成功 success", value: "success" },
        { label: "信息 info", value: "info" },
        { label: "警告 warn", value: "warn" },
        { label: "危险 danger", value: "danger" },
        { label: "反色 contrast", value: "contrast" },
        { label: "帮助 help", value: "help" },
      ],
    },
    {
      prop: "variant",
      label: "形态",
      kind: "enum",
      default: "filled",
      options: [
        { label: "实心 filled", value: "filled" },
        { label: "着色 tinted", value: "tinted" },
        { label: "描边 outlined", value: "outlined" },
        { label: "幽灵 text", value: "text" },
        { label: "链接 link", value: "link" },
      ],
    },
    {
      prop: "size",
      label: "尺寸",
      kind: "enum",
      default: "md",
      options: [
        { label: "xs", value: "xs" },
        { label: "sm", value: "sm" },
        { label: "md", value: "md" },
        { label: "lg", value: "lg" },
      ],
    },
    {
      prop: "icon",
      label: "图标",
      kind: "enum",
      default: "",
      componentOptions: [
        { name: "Plus", component: Plus },
        { name: "Sparkles", component: Sparkles },
        { name: "Filter", component: Filter },
        { name: "Download", component: Download },
        { name: "Settings", component: Settings },
      ],
    },
    { prop: "rounded", label: "胶囊形", kind: "boolean", default: false },
    { prop: "loading", label: "加载中", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
};
