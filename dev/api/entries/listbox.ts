import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "listbox",
  component: "Listbox",
  title: "列表框",
  importPath: "@mango-write/ui",
  rows: [
    { name: "options / optionLabel / optionValue / optionDisabled", kind: "prop", type: "—", desc: "选项数组与字段映射" },
    { name: "multiple", kind: "prop", type: "boolean", desc: "启用多选模式" },
    { name: "filter / filterPlaceholder", kind: "prop", type: "boolean · string", desc: "显示顶部过滤输入框" },
    { name: "disabled / invalid", kind: "prop", type: "boolean", desc: "禁用态与错误态" },
  ],
};
