import { h } from "vue";
import { Button, PageHeader } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";
import { FileText, Plus } from "lucide-vue-next";

export const usage: UsageEntry = {
  slug: "page-header",
  component: PageHeader,
  tag: "PageHeader",
  controls: [{ prop: "title", label: "标题", kind: "text", default: "写作工作区", slot: true }],
  render: (v: UsageValues) =>
    h(PageHeader, { title: v.title as string }, {
      icon: () => h(FileText, { "aria-hidden": "true" }),
      actions: () => h(Button, { size: "sm", label: "新建草稿", icon: Plus }),
    }),
  code: (v: UsageValues) =>
    sfc({
      ui: ["Button", "PageHeader"],
      vue: [],
      lucide: ["FileText", "Plus"],
      template: `<PageHeader title="${v.title ?? ""}">\n  <template #icon>\n    <FileText aria-hidden="true" />\n  </template>\n  <template #actions>\n    <Button size="sm" label="新建草稿" :icon="Plus" />\n  </template>\n</PageHeader>`,
    }),
};
