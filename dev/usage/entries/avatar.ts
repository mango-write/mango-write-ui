import { User } from "lucide-vue-next";
import { Avatar } from "../../../src";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "avatar",
  component: Avatar,
  tag: "Avatar",
  controls: [
    { prop: "label", label: "首字母", kind: "text", default: "林" },
    {
      prop: "icon",
      label: "图标",
      kind: "enum",
      default: "",
      componentOptions: [{ name: "User", component: User }],
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
        { label: "xlarge", value: "xlarge" },
      ],
    },
    {
      prop: "shape",
      label: "形状",
      kind: "enum",
      default: "square",
      options: [
        { label: "方形", value: "square" },
        { label: "圆形", value: "circle" },
      ],
    },
  ],
};
