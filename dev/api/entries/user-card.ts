import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "user-card",
  component: "UserCard",
  title: { zh: "成员卡片", en: "User card" },
  importPath: "@mango-write/ui",
  rows: [
    {
      name: "user",
      kind: "prop",
      type: "UserProfile",
      desc: {
        zh: "用户资料对象：<code>{ name, id?, handle?, avatar?, email?, badge?, role?, description? }</code>",
        en: "Profile object: <code>{ name, id?, handle?, avatar?, email?, badge?, role?, description? }</code>",
      },
    },
    {
      name: "size",
      kind: "prop",
      type: "medium · large",
      desc: { zh: "尺寸档位；默认 <code>medium</code>", en: "Size tier; defaults to <code>medium</code>" },
    },
    {
      name: "#name-actions",
      kind: "slot",
      type: "—",
      desc: {
        zh: "姓名与角色徽标右侧的紧邻内联插槽",
        en: "Inline slot right next to the name and role badge",
      },
    },
    {
      name: "#id-actions",
      kind: "slot",
      type: "—",
      desc: {
        zh: "账号句柄/ID 右侧的内联操作插槽（如复制按钮）",
        en: "Inline actions to the right of the handle/ID (e.g. a copy button)",
      },
    },
    {
      name: "#card",
      kind: "slot",
      type: "{ user }",
      desc: { zh: "名片底部的自定义扩展区域", en: "Custom extension area at the bottom of the card" },
    },
  ],
};
