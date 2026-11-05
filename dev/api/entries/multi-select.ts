import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "multi-select",
  component: "MultiSelect",
  title: "多选",
  importPath: "@mango-write/ui",
  rows: [
    { name: "options / optionLabel / optionValue / optionDisabled", kind: "prop", type: "string | ((opt) => any)", desc: "候选数组与字段访问器" },
    { name: "display", kind: "prop", type: "comma · chip", desc: "回显样式：逗号文本或可移除标签，默认 <code>comma</code>" },
    { name: "maxSelectedLabels / selectedItemsLabel", kind: "prop", type: "number / string", desc: "超出上限后折叠为计数文案（如 <code>已选 {0} 项</code>），默认 3" },
    { name: "filter / showToggleAll / showClear", kind: "prop", type: "boolean", desc: "面板内过滤、头部全选复选框与触发器清空按钮" },
    { name: "size / fluid", kind: "prop", type: "sm · md · lg / boolean", desc: "尺寸档位与撑满父容器" },
    { name: "#value / #option / #header / #footer / #empty", kind: "slot", type: "插槽", desc: "自定义回显、选项行、面板头尾与空状态" },
  ],
};
