import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "multi-select",
  component: "MultiSelect",
  title: { zh: "多选", en: "Multi-select" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "options / optionLabel / optionValue / optionDisabled",
      kind: "prop",
      type: "string | ((opt) => any)",
      desc: { zh: "候选数组与字段访问器", en: "Candidate array plus field accessors" },
    },
    {
      name: "display",
      kind: "prop",
      type: "comma · chip",
      desc: {
        zh: "回显样式：逗号文本或可移除标签，默认 <code>comma</code>；chip 单行铺开、控件撑长到恰好容纳，放不下折成 <code>+N</code>（悬停查看剩余），绝不竖向换行",
        en: "Echo style: comma text or removable chips, default <code>comma</code>; chips lay out on one line — the control stretches to fit exactly and folds into <code>+N</code> when space runs out (hover to see the rest), never wrapping vertically",
      },
    },
    {
      name: "maxSelectedLabels / selectedItemsLabel",
      kind: "prop",
      type: "number / string",
      desc: {
        zh: "comma 模式超出上限后折叠为计数文案（如 <code>已选 {0} 项</code>），默认 3；chip 模式的可见数按容器宽度折叠",
        en: "In comma mode, overflow past the cap folds into a count template (e.g. <code>{0} selected</code>), default 3; in chip mode the visible count folds by container width",
      },
    },
    {
      name: "filter / showToggleAll / showClear",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "面板内过滤、头部全选复选框与触发器清空按钮",
        en: "In-panel filter, a header select-all checkbox, and a trigger clear button",
      },
    },
    {
      name: "size / fluid",
      kind: "prop",
      type: "sm · md · lg / boolean",
      desc: { zh: "尺寸档位与撑满父容器", en: "Size tier and fill the parent container" },
    },
    {
      name: "#value / #option / #header / #footer / #empty",
      kind: "slot",
      type: { zh: "插槽", en: "slot" },
      desc: {
        zh: "自定义回显、选项行、面板头尾与空状态",
        en: "Customize the echo, option rows, panel header/footer, and empty state",
      },
    },
  ],
};
