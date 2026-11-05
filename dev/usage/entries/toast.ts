import { h } from "vue";
import { Button } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageHost, UsageValues } from "../types";

const severities = ["success", "info", "warn", "error"] as const;

export const usage: UsageEntry = {
  slug: "toast",
  component: Button,
  tag: "Button",
  controls: [
    {
      prop: "severity",
      label: "级别",
      kind: "enum",
      default: "success",
      options: severities.map((s) => ({ label: s, value: s })),
    },
    { prop: "summary", label: "标题", kind: "text", default: "已移入回收站" },
    { prop: "detail", label: "详情", kind: "text", default: "可在 30 天内恢复。" },
  ],
  render: (v: UsageValues, host: UsageHost) => {
    const severity = (severities as readonly string[]).includes(String(v.severity))
      ? (v.severity as (typeof severities)[number])
      : "success";
    return h(Button, {
      label: "触发轻提示",
      size: "sm",
      onClick: () => {
        host.notify[severity](String(v.summary ?? ""), v.detail ? String(v.detail) : undefined);
      },
    });
  },
  code: (v: UsageValues) => {
    const method = (severities as readonly string[]).includes(String(v.severity)) ? String(v.severity) : "success";
    return sfc({
      ui: ["Button", "ToastHost", "useNotify"],
      vue: [],
      setup: ["const notify = useNotify();"],
      template: `<ToastHost />\n<Button\n    label="移入回收站"\n    @click="notify.${method}(${JSON.stringify(v.summary ?? "")}, ${JSON.stringify(v.detail ?? "")})"\n  />`,
    });
  },
};
