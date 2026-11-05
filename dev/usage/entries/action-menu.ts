import { h } from "vue";
import { Pencil, Share2, Trash2 } from "lucide-vue-next";
import { ActionMenu } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const items = [
  { key: "rename", label: "重命名", icon: Pencil },
  { key: "share", label: "共享", icon: Share2 },
  { separator: true },
  { key: "remove", label: "删除", icon: Trash2, danger: true },
];

export const usage: UsageEntry = {
  slug: "action-menu",
  component: ActionMenu,
  tag: "ActionMenu",
  controls: [{ prop: "open", label: "展开", kind: "boolean", default: false, vmodel: true }],
  render: (v: UsageValues) =>
    h(ActionMenu, {
      items,
      open: Boolean(v.open),
      "onUpdate:open": (x: unknown) => {
        v.open = Boolean(x);
      },
      ariaLabel: "行内操作菜单",
    }),
  code: (v: UsageValues) =>
    sfc({
      ui: ["ActionMenu"],
      vue: ["ref"],
      lucide: ["Pencil", "Share2", "Trash2"],
      setup: [
        `const open = ref(${Boolean(v.open)});`,
        "",
        "const items = [",
        '  { key: "rename", label: "重命名", icon: Pencil },',
        '  { key: "share", label: "共享", icon: Share2 },',
        "  { separator: true },",
        '  { key: "remove", label: "删除", icon: Trash2, danger: true },',
        "];",
      ],
      template: '<ActionMenu v-model:open="open" :items="items" aria-label="行内操作菜单" />',
    }),
};
