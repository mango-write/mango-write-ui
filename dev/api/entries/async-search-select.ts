import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "async-search-select",
  component: "AsyncSearchSelect",
  title: "远程搜索选择",
  importPath: "@mango-write/ui",
  rows: [
    { name: "modelValue", kind: "prop", type: "string | null", desc: "选中的选项 <code>value</code>（<code>v-model</code>）" },
    { name: "search", kind: "prop", type: "(query: string) => Promise<AsyncSearchOption[]>", desc: "异步检索函数；组件内部自动处理序号竞态与防抖" },
    { name: "initialOption", kind: "prop", type: "AsyncSearchOption | null", desc: "回显未搜索过的初始 ID 对应的标签与描述" },
    { name: "excludeValues", kind: "prop", type: "string[]", desc: "从下拉结果中实时剔除的 ID 列表" },
    { name: "debounceMs / fluid / showClear", kind: "prop", type: "number / boolean", desc: "防抖毫秒（默认 250）、撑满容器宽度、显示清空按钮" },
    { name: "@select", kind: "event", type: "(option: AsyncSearchOption | null) => void", desc: "选中或清空时携带完整选项对象触发" },
    { name: "#option", kind: "slot", type: "{ option, selected }", desc: "自定义下拉选项行内容" },
  ],
};
