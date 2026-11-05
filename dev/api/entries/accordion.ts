import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "accordion",
  component: "Accordion",
  title: "折叠面板",
  importPath: "@mango-write/ui",
  exports: ["Accordion","AccordionHeader","AccordionContent","AccordionPanel"],
  rows: [
    { name: "Accordion v-model:value", kind: "prop", type: "string | number | array | null", desc: "当前展开项（单选为单值，<code>multiple</code> 为数组）" },
    { name: "Accordion multiple", kind: "prop", type: "boolean", desc: "是否允许同时展开多项" },
    { name: "AccordionPanel value", kind: "prop", type: "string | number", desc: "面板唯一标识" },
    { name: "AccordionPanel disabled", kind: "prop", type: "boolean", desc: "禁用展开切换" },
  ],
};
