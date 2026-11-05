import { h } from "vue";
import { Button, Popover } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

export const usage: UsageEntry = {
  slug: "popover",
  component: Popover,
  tag: "Popover",
  controls: [
    {
      prop: "side",
      label: "弹出方向",
      kind: "enum",
      default: "bottom",
      options: [
        { label: "top", value: "top" },
        { label: "right", value: "right" },
        { label: "bottom", value: "bottom" },
        { label: "left", value: "left" },
      ],
    },
    {
      prop: "align",
      label: "对齐",
      kind: "enum",
      default: "start",
      options: [
        { label: "start", value: "start" },
        { label: "center", value: "center" },
        { label: "end", value: "end" },
      ],
    },
    { prop: "dismissable", label: "点外部关闭", kind: "boolean", default: true },
  ],
  render: (v: UsageValues) =>
    h(
      Popover,
      {
        side: (v.side as "top" | "right" | "bottom" | "left") ?? "bottom",
        align: (v.align as "start" | "center" | "end") ?? "start",
        dismissable: v.dismissable !== false,
        ariaLabel: "引用工具面板",
      },
      {
        trigger: ({ toggle }: { toggle: () => void }) =>
          h(Button, { size: "sm", severity: "secondary", label: "引用工具", onClick: toggle }),
        default: () =>
          h("div", { style: "display:grid;gap:var(--space-2);padding:var(--space-2);width:220px" }, [
            h("strong", { style: "font-size:var(--type-caption-size)" }, "插入引用"),
            h("p", { style: "margin:0;color:var(--text-secondary);font-size:var(--type-body-sm-size)" }, "从题录库选择条目，锚点随正文移动。"),
          ]),
      },
    ),
  code: (v: UsageValues) => {
    const attrs = [
      v.side && v.side !== "bottom" ? `side="${v.side}"` : "",
      v.align && v.align !== "start" ? `align="${v.align}"` : "",
      v.dismissable === false ? ":dismissable=\"false\"" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["Button", "Popover"],
      vue: [],
      template: `<Popover${attrs.length ? ` ${attrs.join(" ")}` : ""} aria-label="引用工具面板">\n  <template #trigger="{ toggle }">\n    <Button size="sm" severity="secondary" label="引用工具" @click="toggle" />\n  </template>\n  <div style="display: grid; gap: var(--space-2); padding: var(--space-2); width: 220px">\n    <strong style="font-size: var(--type-caption-size)">插入引用</strong>\n    <p style="margin: 0; color: var(--text-secondary); font-size: var(--type-body-sm-size)">\n      从题录库选择条目，锚点随正文移动。\n    </p>\n  </div>\n</Popover>`,
    });
  },
};
