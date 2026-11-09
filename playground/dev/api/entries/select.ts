import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "select",
  component: "Select",
  title: { zh: "下拉选择", en: "Select" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "options / optionLabel / optionValue / optionDisabled",
      kind: "prop",
      type: "string | ((opt) => any)",
      desc: { zh: "候选数组与字段取值访问器", en: "Candidate array plus field accessors" },
    },
    {
      name: "filter / filterPlaceholder",
      kind: "prop",
      type: "boolean / string",
      desc: { zh: "在浮层面板顶部开启过滤输入框", en: "Adds a filter input at the top of the popup panel" },
    },
    {
      name: "showClear / allowEmpty",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "显示清空按钮；<code>allowEmpty=false</code> 时禁止清空",
        en: "Shows a clear button; clearing is blocked when <code>allowEmpty=false</code>",
      },
    },
    {
      name: "editable",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "触发器变为文本输入框，既可选列表项也可自由输入",
        en: "The trigger becomes a text input; pick from the list or type freely",
      },
    },
    {
      name: "size / fluid",
      kind: "prop",
      type: "xs · sm · md · lg / boolean",
      desc: { zh: "尺寸档位与是否撑满父容器宽度", en: "Size tier and whether to fill the parent width" },
    },
    {
      name: "loading / disabled / readonly / invalid",
      kind: "prop",
      type: "boolean",
      desc: { zh: "加载旋转指示、禁用、只读与错误态", en: "Loading spinner, disabled, read-only, and error states" },
    },
    {
      name: "#value / #option / #header / #empty",
      kind: "slot",
      type: { zh: "插槽", en: "slot" },
      desc: {
        zh: "自定义已选展示、选项行、面板头部与空态文案",
        en: "Customize the selected display, option rows, panel header, and empty message",
      },
    },
  ],
};
