import { NotFoundPage } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "not-found-page",
  component: NotFoundPage,
  tag: "NotFoundPage",
  flatPreview: true,
  controls: [
    { prop: "title", label: "主标题", kind: "text", default: "页面走丢了" },
    { prop: "lead", label: "说明文案", kind: "text", default: "草稿可能已移入回收站或没有访问权限。" },
    { prop: "path", label: "出错路径", kind: "text", default: "/drafts/9f3c-missing" },
    { prop: "primaryLabel", label: "主按钮", kind: "text", default: "返回工作台" },
    { prop: "secondaryLabel", label: "次按钮", kind: "text", default: "回退上一页" },
  ],
  code: (v) => {
    const attrs = [
      v.title ? `title="${String(v.title).replace(/"/g, "&quot;")}"` : "",
      v.lead ? `lead="${String(v.lead).replace(/"/g, "&quot;")}"` : "",
      v.path ? `path="${String(v.path).replace(/"/g, "&quot;")}"` : "",
      v.primaryLabel ? `primary-label="${String(v.primaryLabel).replace(/"/g, "&quot;")}"` : "",
      v.secondaryLabel ? `secondary-label="${String(v.secondaryLabel).replace(/"/g, "&quot;")}"` : "",
    ].filter(Boolean);
    return sfc({
      ui: ["NotFoundPage"],
      template: `<NotFoundPage\n  ${attrs.join("\n  ")}\n/>`,
    });
  },
};
