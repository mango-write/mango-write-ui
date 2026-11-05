import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "user-card",
  component: "UserCard",
  title: "成员卡片",
  importPath: "@mango-write/ui",
  rows: [
    { name: "user", kind: "prop", type: "UserProfile", desc: "用户资料对象：<code>{ name, id?, handle?, avatar?, email?, badge?, role?, description? }</code>" },
    { name: "size", kind: "prop", type: "medium · large", desc: "尺寸档位；默认 <code>medium</code>" },
    { name: "#name-actions", kind: "slot", type: "—", desc: "姓名与角色徽标右侧的紧邻内联插槽" },
    { name: "#id-actions", kind: "slot", type: "—", desc: "账号句柄/ID 右侧的内联操作插槽（如复制按钮）" },
    { name: "#card", kind: "slot", type: "{ user }", desc: "名片底部的自定义扩展区域" },
  ],
};
