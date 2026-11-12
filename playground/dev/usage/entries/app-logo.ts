import { h } from "vue";
import { AppLogo } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "app-logo",
  component: AppLogo,
  tag: "AppLogo",
  controls: [
    { prop: "markOnly", label: "仅图形标", kind: "boolean", default: false },
  ],
  render: (v) =>
    h(AppLogo, {
      markOnly: Boolean(v.markOnly),
      style: { height: "32px" },
    }),
  code: (v) =>
    sfc({
      ui: ["AppLogo"],
      template: `<AppLogo${v.markOnly ? " mark-only" : ""} style="height: 32px" />`,
    }),
};
