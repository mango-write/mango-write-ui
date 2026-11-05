import { h } from "vue";
import { Copy, Link2, Pencil, Share2, Trash2 } from "lucide-vue-next";
import { Menu } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry } from "../types";

const items = [
  { key: "rename", label: "重命名", icon: Pencil, shortcut: "F2" },
  { key: "copy-link", label: "复制链接", icon: Link2, shortcut: "⌘C" },
  { key: "duplicate", label: "创建副本", icon: Copy },
  { separator: true },
  { key: "share", label: "共享给协作成员", icon: Share2 },
  { key: "remove", label: "移入回收站", icon: Trash2, danger: true },
];

// 菜单本体是 items 数组驱动,没有可枚举调的视觉 prop——预览给真实交互,代码给完整 items 写法
export const usage: UsageEntry = {
  slug: "menu",
  component: Menu,
  tag: "Menu",
  controls: [],
  render: () => h(Menu, { model: items, ariaLabel: "文档操作菜单" }),
  code: () =>
    sfc({
      ui: ["Menu"],
      vue: [],
      lucide: ["Copy", "Link2", "Pencil", "Share2", "Trash2"],
      setup: [
        "const items = [",
        '  { key: "rename", label: "重命名", icon: Pencil, shortcut: "F2" },',
        '  { key: "copy-link", label: "复制链接", icon: Link2, shortcut: "⌘C" },',
        '  { key: "duplicate", label: "创建副本", icon: Copy },',
        "  { separator: true },",
        '  { key: "share", label: "共享给协作成员", icon: Share2 },',
        '  { key: "remove", label: "移入回收站", icon: Trash2, danger: true },',
        "];",
      ],
      template: '<Menu :model="items" aria-label="文档操作菜单" />',
    }),
};
