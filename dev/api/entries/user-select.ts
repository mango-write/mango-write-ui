import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "user-select",
  component: "UserSelect",
  title: "成员选择",
  importPath: "@mango-write/ui",
  rows: [
    { name: "modelValue", kind: "prop", type: "string[]", desc: "选中的用户 ID 数组（<code>v-model</code>）" },
    { name: "users", kind: "prop", type: "UserSelectOption[]", desc: "候选成员列表（含 <code>id</code>、<code>name</code>、可选 <code>avatar</code> 与 <code>email</code>）" },
    { name: "placeholder", kind: "prop", type: "string", desc: "未选时的占位提示语" },
    { name: "emptyMessage", kind: "prop", type: "string", desc: "检索无匹配成员时的提示文案" },
    { name: "disabled", kind: "prop", type: "boolean", desc: "禁用选择与移除操作" },
  ],
};
