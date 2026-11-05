import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "paginator",
  component: "Paginator",
  title: { zh: "分页", en: "Paginator" },
  importPath: "@mango-write/ui",
  rows: [
    {
      name: "v-model:first",
      kind: "prop",
      type: "number",
      desc: {
        zh: "当前页首条记录的 0-based 偏移量",
        en: "0-based offset of the first record on the current page",
      },
    },
    {
      name: "v-model:rows",
      kind: "prop",
      type: "number",
      desc: {
        zh: "每页显示记录数",
        en: "Records per page",
      },
    },
    {
      name: "totalRecords",
      kind: "prop",
      type: "number",
      desc: {
        zh: "总记录数",
        en: "Total number of records",
      },
    },
    {
      name: "rowsPerPageOptions",
      kind: "prop",
      type: "number[]",
      desc: {
        zh: "每页条数下拉选项",
        en: "Options of the rows-per-page dropdown",
      },
    },
    {
      name: "pageLinkSize",
      kind: "prop",
      type: "number",
      desc: {
        zh: "最多显示的连续页码按钮数，默认 5",
        en: "Max number of consecutive page links shown, default 5",
      },
    },
  ],
};
