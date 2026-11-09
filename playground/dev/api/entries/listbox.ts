import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "listbox",
  component: "Listbox",
  title: { zh: "列表框", en: "Listbox" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "options / optionLabel / optionValue / optionDisabled",
      kind: "prop",
      type: "—",
      desc: { zh: "选项数组与字段映射", en: "Option array plus field mapping" },
    },
    {
      name: "multiple",
      kind: "prop",
      type: "boolean",
      desc: { zh: "启用多选模式", en: "Enables multi-select" },
    },
    {
      name: "filter / filterPlaceholder",
      kind: "prop",
      type: "boolean · string",
      desc: { zh: "显示顶部过滤输入框", en: "Shows the filter input at the top" },
    },
    {
      name: "disabled / invalid",
      kind: "prop",
      type: "boolean",
      desc: { zh: "禁用态与错误态", en: "Disabled and invalid states" },
    },
  ],
};
