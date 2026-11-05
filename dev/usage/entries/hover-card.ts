import { h } from "vue";
import { HoverCard } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

export const usage: UsageEntry = {
  slug: "hover-card",
  component: HoverCard,
  tag: "HoverCard",
  controls: [
    {
      prop: "placement",
      label: "展开方向",
      kind: "enum",
      default: "top",
      options: [
        { label: "top", value: "top" },
        { label: "right", value: "right" },
        { label: "bottom", value: "bottom" },
        { label: "left", value: "left" },
      ],
    },
    { prop: "interactive", label: "可移入面板", kind: "boolean", default: true },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) =>
    h(
      HoverCard,
      {
        placement: (v.placement as "top" | "right" | "bottom" | "left") ?? "top",
        interactive: v.interactive !== false,
        disabled: Boolean(v.disabled),
        label: "引用文献详情",
      },
      {
        default: () =>
          h(
            "span",
            { style: "text-decoration:underline dotted var(--text-tertiary);cursor:help" },
            "Zhang et al., 2024",
          ),
        content: () =>
          h("div", { style: "display:grid;gap:var(--space-1-5);padding:var(--space-3);width:260px" }, [
            h("strong", { style: "font-size:var(--type-caption-size)" }, "Zhang, L. et al. (2024)"),
            h("p", { style: "margin:0;color:var(--text-secondary);font-size:var(--type-body-sm-size)" }, "锚定空间坐标系下的跨草稿引用一致性研究."),
            h("span", { style: "color:var(--text-tertiary);font-size:var(--type-micro-size)" }, "Nature · DOI 10.1038/s41586-024-07123-x"),
          ]),
      },
    ),
  code: (v: UsageValues) => {
    const attrs = [
      v.placement && v.placement !== "top" ? `placement="${v.placement}"` : "",
      v.interactive === false ? ":interactive=\"false\"" : "",
      v.disabled ? "disabled" : "",
      'label="引用文献详情"',
    ].filter(Boolean);
    return sfc({
      ui: ["HoverCard"],
      vue: [],
      template: `<HoverCard${attrs.length ? ` ${attrs.join(" ")}` : ""}>\n  <span style="text-decoration: underline dotted var(--text-tertiary); cursor: help">Zhang et al., 2024</span>\n  <template #content>\n    <div style="display: grid; gap: var(--space-1-5); padding: var(--space-3); width: 260px">\n      <strong style="font-size: var(--type-caption-size)">Zhang, L. et al. (2024)</strong>\n      <p style="margin: 0; color: var(--text-secondary); font-size: var(--type-body-sm-size)">\n        锚定空间坐标系下的跨草稿引用一致性研究.\n      </p>\n      <span style="color: var(--text-tertiary); font-size: var(--type-micro-size)">\n        Nature · DOI 10.1038/s41586-024-07123-x\n      </span>\n    </div>\n  </template>\n</HoverCard>`,
    });
  },
};
