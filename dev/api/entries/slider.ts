import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "slider",
  component: "Slider",
  title: "滑块",
  importPath: "@mango-write/ui",
  rows: [
    { name: "modelValue", kind: "prop", type: "number | [number, number]", desc: "当前数值或起止区间（<code>v-model</code>）" },
    { name: "min / max / step", kind: "prop", type: "number", desc: "最小值（默认 0）、最大值（默认 100）；step 缺省为连续拖动，显式传入正数后按刻度吸附" },
    { name: "showTicks", kind: "prop", type: "boolean", desc: "在轨道上渲染每个 step 刻度的小节点，仅在显式传入有效 step 时生效" },
    { name: "range", kind: "prop", type: "boolean", desc: "开启双滑块区间选择" },
    { name: "orientation", kind: "prop", type: "horizontal · vertical", desc: "方向，默认 <code>horizontal</code>" },
    { name: "disabled / readonly / invalid", kind: "prop", type: "boolean", desc: "禁用、只读与错误态" },
    { name: "@slideend", kind: "event", type: "{ originalEvent, value }", desc: "拖拽结束或键盘释放时触发" },
  ],
};
