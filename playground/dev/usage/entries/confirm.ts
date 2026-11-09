import { h } from "vue";
import { Button } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageHost, UsageValues } from "../types";

export const usage: UsageEntry = {
  slug: "confirm",
  component: Button,
  tag: "Button",
  controls: [
    { prop: "title", label: "标题", kind: "text", default: "删除草稿?" },
    { prop: "message", label: "正文", kind: "text", default: "删除后可在 30 天内从回收站恢复。" },
    { prop: "danger", label: "危险动作", kind: "boolean", default: true },
    { prop: "acceptLabel", label: "确认文案", kind: "text", default: "删除" },
    { prop: "rejectLabel", label: "取消文案", kind: "text", default: "再想想" },
  ],
  render: (v: UsageValues, host: UsageHost) =>
    h(
      Button,
      {
        severity: v.danger ? "danger" : "primary",
        label: "触发确认框",
        size: "sm",
        onClick: async () => {
          const ok = await host.confirm.ask({
            title: v.title as string | undefined,
            message: (v.message as string | undefined) ?? "确认执行该操作？",
            danger: Boolean(v.danger),
            acceptLabel: v.acceptLabel as string | undefined,
            rejectLabel: v.rejectLabel as string | undefined,
          });
          host.notify.success(ok ? "已确认" : "已取消");
        },
      },
    ),
  code: (v: UsageValues) => {
    const askAttrs = [
      v.title ? `title: ${JSON.stringify(v.title)},` : "",
      `message: ${JSON.stringify(v.message ?? "")},`,
      v.danger ? "danger: true," : "",
      v.acceptLabel ? `acceptLabel: ${JSON.stringify(v.acceptLabel)},` : "",
      v.rejectLabel ? `rejectLabel: ${JSON.stringify(v.rejectLabel)},` : "",
    ].filter(Boolean);
    return sfc({
      ui: ["Button", "ConfirmHost", "useConfirm", "useNotify"],
      vue: [],
      setup: [
        "const confirm = useConfirm();",
        "const notify = useNotify();",
        "",
        "async function remove() {",
        "  const ok = await confirm.ask({",
        ...askAttrs.map((l) => `    ${l}`),
        "  });",
        "  if (ok) notify.success(\"已删除\");",
        "}",
      ],
      template: `<ConfirmHost />\n<Button severity="${v.danger ? "danger" : "primary"}" label="删除草稿" @click="remove" />`,
    });
  },
};
