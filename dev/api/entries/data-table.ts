import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "data-table",
  component: "DataTable",
  title: { zh: "数据表格", en: "Data table" },
  importPath: "@mango-write/ui",
  exports: ["DataTable", "Column"],
  rows: [
    {
      name: "size",
      kind: "prop",
      type: "xs · sm · md · lg",
      desc: {
        zh: "行高档；不传则行高 40px、字号跟随密度上下文",
        en: "Row height tier; without one, rows are 40px and the font follows the density context",
      },
    },
    {
      name: "rowHover",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "行 hover 叠层；有选择模式时自动开启",
        en: "Row hover overlay; turns on automatically with a selection mode",
      },
    },
    {
      name: "stripedRows",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "斑马纹（极浅墨色）",
        en: "Zebra stripes (very light ink)",
      },
    },
    {
      name: "selection / selectionMode",
      kind: "prop",
      type: "single · multiple",
      desc: {
        zh: "行选择；勾选列用 <code>Column selection-mode</code>",
        en: "Row selection; checkbox column via <code>Column selection-mode</code>",
      },
    },
    {
      name: "scrollable / scrollHeight",
      kind: "prop",
      type: "boolean · string",
      desc: {
        zh: "固定高度纵向滚动：表头吸顶清晰，表体在滚动出口自动施加 <code>--scroll-fade-size</code> 边缘渐隐",
        en: "Fixed-height vertical scrolling: the header pins fully crisp, and the body's scroll edges get an automatic <code>--scroll-fade-size</code> fade",
      },
    },
    {
      name: "loading",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "半透明蒙层 + 指示器，<code>#loading</code> 可覆盖",
        en: "Translucent overlay + indicator; overridable via <code>#loading</code>",
      },
    },
    {
      name: "#empty",
      kind: "slot",
      type: { zh: "插槽", en: "Slot" },
      desc: {
        zh: "空态：说明 + 下一步动作",
        en: "Empty state: explanation + next action",
      },
    },
    {
      name: "--mw-datatable-bg / -border / -radius",
      kind: "css",
      type: { zh: "CSS 变量", en: "CSS variables" },
      desc: {
        zh: "外框定制钩子（嵌入已有卡片时去框）",
        en: "Frame customization hooks (drop the frame when embedding in an existing card)",
      },
    },
  ],
};
