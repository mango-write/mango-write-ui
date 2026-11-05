import { withDirectives, h } from "vue";
import { Button, vTooltip } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

export const usage: UsageEntry = {
  slug: "tooltip",
  component: Button,
  tag: "Button",
  controls: [
    { prop: "content", label: "提示文本", kind: "text", default: "新建一篇写作草稿" },
    {
      prop: "placement",
      label: "方向",
      kind: "enum",
      default: "top",
      options: [
        { label: "top（默认）", value: "top" },
        { label: "right", value: "right" },
        { label: "bottom", value: "bottom" },
        { label: "left", value: "left" },
      ],
    },
  ],
  render: (v: UsageValues) => {
    const placement = String(v.placement ?? "top");
    const modifiers = placement === "top" ? {} : { [placement]: true };
    return withDirectives(
      h(Button, { severity: "secondary", size: "sm", label: "悬停查看提示" }),
      [[vTooltip, v.content ?? "", undefined, modifiers]],
    );
  },
  code: (v: UsageValues) => {
    const placement = String(v.placement ?? "top");
    const directive = placement === "top" ? "v-tooltip" : `v-tooltip.${placement}`;
    return sfc({
      ui: ["Button", "vTooltip"],
      vue: [],
      template: `<Button\n    ${directive}="${v.content ?? ""}"\n    severity="secondary"\n    size="sm"\n    label="悬停查看提示"\n  />`,
    });
  },
};
