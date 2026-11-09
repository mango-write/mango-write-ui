import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "date-picker",
  component: "DatePicker",
  title: { zh: "日期选择", en: "Date picker" },
  importPath: "@mango-write/ui-vue",
  rows: [
    {
      name: "v-model",
      kind: "prop",
      type: "Date | string | Array<Date | null> | null",
      desc: {
        zh: "绑定日期值；<code>range</code> 与 <code>multiple</code> 模式下为数组",
        en: "Bound date value; an array in <code>range</code> and <code>multiple</code> modes",
      },
    },
    {
      name: "selectionMode",
      kind: "prop",
      type: "single · range · multiple",
      desc: {
        zh: "单日（默认）、起止区间或多日选择",
        en: "Single day (default), range, or multiple dates",
      },
    },
    {
      name: "showTime / timeOnly / hourFormat",
      kind: "prop",
      type: "boolean / \"24\" · \"12\"",
      desc: {
        zh: "附加时间步进器、仅选择时间、小时制（默认 <code>\"24\"</code>）",
        en: "Attach a time stepper, pick time only, and the hour format (default <code>\"24\"</code>)",
      },
    },
    {
      name: "dateFormat",
      kind: "prop",
      type: "string",
      desc: {
        zh: "展示格式，默认 <code>\"yy-mm-dd\"</code>（4 位年-2 位月-2 位日）",
        en: "Display format, default <code>\"yy-mm-dd\"</code> (4-digit year, 2-digit month and day)",
      },
    },
    {
      name: "minDate / maxDate",
      kind: "prop",
      type: "Date | null",
      desc: {
        zh: "最小与最大可选日期边界，越界日期置灰禁选",
        en: "Selectable bounds; out-of-range days render grey and unselectable",
      },
    },
    {
      name: "showIcon / showClear / showButtonBar",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "右侧日历/时钟触发钮、清空按钮、底部「今天 / 清除」动作栏",
        en: "Trailing calendar/clock button, clear button, and the bottom “Today / Clear” action bar",
      },
    },
    {
      name: "size / fluid / invalid / disabled / readonly",
      kind: "prop",
      type: "sm · md · lg / boolean",
      desc: {
        zh: "尺寸档位、撑满容器宽度与表单状态",
        en: "Size tier, fill the container width, and form states",
      },
    },
  ],
};
