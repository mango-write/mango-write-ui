import { ToggleSwitch } from "../../../src";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "toggle-switch",
  component: ToggleSwitch,
  tag: "ToggleSwitch",
  controls: [
    { prop: "modelValue", vname: "autosave", label: "开启", kind: "boolean", default: false, vmodel: true },
    { prop: "invalid", label: "错误态", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
};
