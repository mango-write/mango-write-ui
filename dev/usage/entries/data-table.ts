import { h } from "vue";
import { Column, DataTable } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const papers = [
  { id: 1, title: "引文锚点研究", venue: "Nature", cited: 12 },
  { id: 2, title: "协同编辑一致性", venue: "CHI", cited: 8 },
  { id: 3, title: "锚定空间坐标系", venue: "UIST", cited: 5 },
];

export const usage: UsageEntry = {
  slug: "data-table",
  component: DataTable,
  tag: "DataTable",
  extraTags: ["Column"],
  controls: [
    { prop: "stripedRows", label: "斑马纹", kind: "boolean", default: false },
    { prop: "rowHover", label: "行悬停反馈", kind: "boolean", default: false },
    { prop: "loading", label: "加载态", kind: "boolean", default: false },
    { prop: "paginator", label: "内置分页", kind: "boolean", default: false },
    { prop: "rows", label: "每页行数", kind: "number", default: 10 },
  ],
  render: (v: UsageValues) =>
    h(DataTable, {
      value: papers,
      dataKey: "id",
      stripedRows: Boolean(v.stripedRows),
      rowHover: Boolean(v.rowHover),
      loading: Boolean(v.loading),
      paginator: Boolean(v.paginator),
      rows: (v.rows as number | undefined) ?? 10,
    }, {
      default: () => [
        h(Column, { field: "title", header: "标题", sortable: true }),
        h(Column, { field: "venue", header: "期刊/会议" }),
        h(Column, { field: "cited", header: "被引", sortable: true }),
      ],
    }),
  code: (v: UsageValues) => {
    const attrs = [
      ':value="papers"',
      'data-key="id"',
      v.stripedRows ? "striped-rows" : "",
      v.rowHover ? "row-hover" : "",
      v.loading ? "loading" : "",
      v.paginator ? "paginator" : "",
      v.paginator && v.rows !== 10 ? `:rows="${v.rows}"` : "",
    ].filter(Boolean);
    return sfc({
      ui: ["Column", "DataTable"],
      vue: [],
      setup: [
        "const papers = [",
        '  { id: 1, title: "引文锚点研究", venue: "Nature", cited: 12 },',
        '  { id: 2, title: "协同编辑一致性", venue: "CHI", cited: 8 },',
        '  { id: 3, title: "锚定空间坐标系", venue: "UIST", cited: 5 },',
        "];",
      ],
      template: `<DataTable\n    ${attrs.join("\n    ")}\n  >\n    <Column field="title" header="标题" sortable />\n    <Column field="venue" header="期刊/会议" />\n    <Column field="cited" header="被引" sortable />\n  </DataTable>`,
    });
  },
};
