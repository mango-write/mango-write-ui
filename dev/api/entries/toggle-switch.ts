import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "toggle-switch",
  component: "ToggleSwitch",
  title: { zh: "开关", en: "Toggle switch" },
  importPath: "@mango-write/ui",
  rows: [
    { name: "modelValue", kind: "prop", type: "boolean", desc: { zh: "开关状态（<code>v-model</code>），默认 <code>false</code>", en: "Switch state (<code>v-model</code>), defaults to <code>false</code>" } },
    { name: "inputId / id / name", kind: "prop", type: "string", desc: { zh: "关联 <code><label></code> 与表单字段标识", en: "Associates <code><label></code> and form field identity" } },
    { name: "disabled / readonly", kind: "prop", type: "boolean", desc: { zh: "禁用或只读，阻断状态变更", en: "Disabled or readonly; blocks state changes" } },
    { name: "invalid / required", kind: "prop", type: "boolean", desc: { zh: "表单校验状态与必填标记", en: "Validation state and the required mark" } },
  ],
};
