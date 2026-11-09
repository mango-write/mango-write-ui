import { h } from "vue";
import { AsyncSlot } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

export const usage: UsageEntry = {
  slug: "async-slot",
  component: AsyncSlot,
  tag: "AsyncSlot",
  controls: [
    {
      prop: "status",
      label: "状态",
      kind: "enum",
      default: "ready",
      options: [
        { label: "loading 加载", value: "loading" },
        { label: "empty 空", value: "empty" },
        { label: "error 出错", value: "error" },
        { label: "ready 就绪", value: "ready" },
      ],
    },
    {
      prop: "skeleton",
      label: "骨架形状",
      kind: "enum",
      default: "list",
      options: [
        { label: "list 列表", value: "list" },
        { label: "card 卡片", value: "card" },
        { label: "text 文本", value: "text" },
        { label: "none", value: "none" },
      ],
    },
  ],
  render: (v: UsageValues) =>
    h(
      AsyncSlot,
      {
        status: (v.status as "loading" | "empty" | "error" | "ready") ?? "ready",
        skeleton: (v.skeleton as "list" | "card" | "text" | "none") ?? "list",
      },
      {
        default: () =>
          h("div", { style: "display:grid;gap:var(--space-2);width:min(320px,100%)" }, [
            h("p", { class: "doc-note", style: "margin:0" }, "三条语料已就位，可以直接开始写作。"),
            h("p", { class: "doc-note", style: "margin:0" }, "语料行来自题录库与解析缓存。"),
          ]),
      },
    ),
  code: (v: UsageValues) => {
    const attrs = [
      v.status && v.status !== "ready" ? `status="${v.status}"` : 'status="ready"',
      v.skeleton && v.skeleton !== "list" ? `skeleton="${v.skeleton}"` : "",
    ].filter(Boolean);
    return sfc({
      ui: ["AsyncSlot"],
      vue: [],
      template: `<AsyncSlot${attrs.length ? ` ${attrs.join(" ")}` : ""}>\n  <div style="display: grid; gap: var(--space-2)">\n    <p>三条语料已就位，可以直接开始写作。</p>\n    <p>语料行来自题录库与解析缓存。</p>\n  </div>\n</AsyncSlot>`,
    });
  },
};
