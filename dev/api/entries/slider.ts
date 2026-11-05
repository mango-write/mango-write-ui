import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "slider",
  component: "Slider",
  title: { zh: "滑块", en: "Slider" },
  importPath: "@mango-write/ui",
  rows: [
    { name: "modelValue", kind: "prop", type: "number | [number, number]", desc: { zh: "当前数值或起止区间（<code>v-model</code>）", en: "Current value or start/end range (<code>v-model</code>)" } },
    { name: "min / max / step", kind: "prop", type: "number", desc: { zh: "最小值（默认 0）、最大值（默认 100）；step 缺省为连续拖动，显式传入正数后按刻度吸附", en: "Min (default 0) and max (default 100); without step the drag is continuous, a positive step snaps to ticks" } },
    { name: "showTicks", kind: "prop", type: "boolean", desc: { zh: "在轨道上渲染每个 step 刻度的小节点，仅在显式传入有效 step 时生效", en: "Renders a node per step tick on the track; only with an explicit valid step" } },
    { name: "range", kind: "prop", type: "boolean", desc: { zh: "开启双滑块区间选择", en: "Enables two-thumb range selection" } },
    { name: "orientation", kind: "prop", type: "horizontal · vertical", desc: { zh: "方向，默认 <code>horizontal</code>", en: "Orientation, defaults to <code>horizontal</code>" } },
    { name: "disabled / readonly / invalid", kind: "prop", type: "boolean", desc: { zh: "禁用、只读与错误态", en: "Disabled, readonly, and invalid states" } },
    { name: "@slideend", kind: "event", type: "{ originalEvent, value }", desc: { zh: "拖拽结束或键盘释放时触发", en: "Fires when a drag ends or a keyboard move is released" } },
  ],
};
