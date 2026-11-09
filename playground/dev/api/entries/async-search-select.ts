import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "async-search-select",
  component: "AsyncSearchSelect",
  title: { zh: "远程搜索选择", en: "Async search select" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "modelValue",
      kind: "prop",
      type: "string | null",
      desc: {
        zh: "选中的选项 <code>value</code>（<code>v-model</code>）",
        en: "The selected option's <code>value</code> (<code>v-model</code>)",
      },
    },
    {
      name: "search",
      kind: "prop",
      type: "(query: string) => Promise<AsyncSearchOption[]>",
      desc: {
        zh: "异步检索函数；组件内部自动处理序号竞态与防抖",
        en: "Async search function; the component handles request racing and debouncing internally",
      },
    },
    {
      name: "initialOption",
      kind: "prop",
      type: "AsyncSearchOption | null",
      desc: {
        zh: "回显未搜索过的初始 ID 对应的标签与描述",
        en: "Echoes the label and description for an initial ID that has not been searched yet",
      },
    },
    {
      name: "excludeValues",
      kind: "prop",
      type: "string[]",
      desc: { zh: "从下拉结果中实时剔除的 ID 列表", en: "IDs removed from the dropdown results in real time" },
    },
    {
      name: "debounceMs / fluid / showClear",
      kind: "prop",
      type: "number / boolean",
      desc: {
        zh: "防抖毫秒（默认 250）、撑满容器宽度、显示清空按钮",
        en: "Debounce milliseconds (default 250), fill the container width, show the clear button",
      },
    },
    {
      name: "@select",
      kind: "event",
      type: "(option: AsyncSearchOption | null) => void",
      desc: {
        zh: "选中或清空时携带完整选项对象触发",
        en: "Fires with the full option object on select or clear",
      },
    },
    {
      name: "#option",
      kind: "slot",
      type: "{ option, selected }",
      desc: { zh: "自定义下拉选项行内容", en: "Customize the dropdown option rows" },
    },
  ],
};
