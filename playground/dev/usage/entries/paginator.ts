import { Paginator } from "@mango-write/ui-vue";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "paginator",
  component: Paginator,
  tag: "Paginator",
  controls: [
    { prop: "first", label: "当前起始行", kind: "number", default: 0, vmodel: true },
    { prop: "rows", label: "每页行数", kind: "number", default: 10 },
    { prop: "totalRecords", label: "总行数", kind: "number", default: 120 },
    { prop: "pageLinkSize", label: "页码按钮数", kind: "number", default: 5 },
    { prop: "alwaysShow", label: "单页仍显示", kind: "boolean", default: true },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
};
