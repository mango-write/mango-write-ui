import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "date-picker",
  component: "DatePicker",
  title: "日期选择",
  importPath: "@mango-write/ui",
  rows: [
    { name: "v-model", kind: "prop", type: "Date | string | Array<Date | null> | null", desc: "绑定日期值；<code>range</code> 与 <code>multiple</code> 模式下为数组" },
    { name: "selectionMode", kind: "prop", type: "single · range · multiple", desc: "单日（默认）、起止区间或多日选择" },
    { name: "showTime / timeOnly / hourFormat", kind: "prop", type: "boolean / \"24\" · \"12\"", desc: "附加时间步进器、仅选择时间、小时制（默认 <code>\"24\"</code>）" },
    { name: "dateFormat", kind: "prop", type: "string", desc: "展示格式，默认 <code>\"yy-mm-dd\"</code>（4 位年-2 位月-2 位日）" },
    { name: "minDate / maxDate", kind: "prop", type: "Date | null", desc: "最小与最大可选日期边界，越界日期置灰禁选" },
    { name: "showIcon / showClear / showButtonBar", kind: "prop", type: "boolean", desc: "右侧日历/时钟触发钮、清空按钮、底部「今天 / 清除」动作栏" },
    { name: "size / fluid / invalid / disabled / readonly", kind: "prop", type: "sm · md · lg / boolean", desc: "尺寸档位、撑满容器宽度与表单状态" },
  ],
};
