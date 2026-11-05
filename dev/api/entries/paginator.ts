import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "paginator",
  component: "Paginator",
  title: "分页",
  importPath: "@mango-write/ui",
  rows: [
    { name: "v-model:first", kind: "prop", type: "number", desc: "当前页首条记录的 0-based 偏移量" },
    { name: "v-model:rows", kind: "prop", type: "number", desc: "每页显示记录数" },
    { name: "totalRecords", kind: "prop", type: "number", desc: "总记录数" },
    { name: "rowsPerPageOptions", kind: "prop", type: "number[]", desc: "每页条数下拉选项" },
    { name: "pageLinkSize", kind: "prop", type: "number", desc: "最多显示的连续页码按钮数，默认 5" },
  ],
};
