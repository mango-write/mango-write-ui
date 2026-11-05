import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "user-select",
  component: "UserSelect",
  title: { zh: "成员选择", en: "Member select" },
  importPath: "@mango-write/ui",
  rows: [
    {
      name: "modelValue",
      kind: "prop",
      type: "string[]",
      desc: { zh: "选中的用户 ID 数组（<code>v-model</code>）", en: "Array of selected user IDs (<code>v-model</code>)" },
    },
    {
      name: "users",
      kind: "prop",
      type: "UserSelectOption[]",
      desc: {
        zh: "候选成员列表（含 <code>id</code>、<code>name</code>、可选 <code>avatar</code> 与 <code>email</code>）",
        en: "Candidate members (<code>id</code>, <code>name</code>, optional <code>avatar</code> and <code>email</code>)",
      },
    },
    {
      name: "placeholder",
      kind: "prop",
      type: "string",
      desc: { zh: "未选时的占位提示语", en: "Placeholder shown when nothing is selected" },
    },
    {
      name: "emptyMessage",
      kind: "prop",
      type: "string",
      desc: { zh: "检索无匹配成员时的提示文案", en: "Message shown when no member matches" },
    },
    {
      name: "disabled",
      kind: "prop",
      type: "boolean",
      desc: { zh: "禁用选择与移除操作", en: "Disables picking and removing" },
    },
  ],
};
