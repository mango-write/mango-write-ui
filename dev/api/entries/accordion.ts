import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "accordion",
  component: "Accordion",
  title: { zh: "折叠面板", en: "Accordion" },
  importPath: "@mango-write/ui",
  exports: ["Accordion", "AccordionHeader", "AccordionContent", "AccordionPanel"],
  rows: [
    {
      name: "Accordion v-model:value",
      kind: "prop",
      type: "string | number | array | null",
      desc: {
        zh: "当前展开项（单选为单值，<code>multiple</code> 为数组）",
        en: "Currently expanded items (a single value, or an array with <code>multiple</code>)",
      },
    },
    {
      name: "Accordion multiple",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "是否允许同时展开多项",
        en: "Whether several panels can be open at once",
      },
    },
    {
      name: "AccordionPanel value",
      kind: "prop",
      type: "string | number",
      desc: {
        zh: "面板唯一标识",
        en: "Unique panel id",
      },
    },
    {
      name: "AccordionPanel disabled",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "禁用展开切换",
        en: "Disables expanding/collapsing the panel",
      },
    },
  ],
};
