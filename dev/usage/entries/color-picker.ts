import { ColorPicker } from "../../../src";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "color-picker",
  component: ColorPicker,
  tag: "ColorPicker",
  controls: [
    { prop: "modelValue", vname: "color", label: "取值", kind: "color", default: "#7c6cf6", vmodel: true },
    {
      prop: "format",
      label: "格式",
      kind: "enum",
      default: "hex",
      options: [
        { label: "hex", value: "hex" },
        { label: "rgb", value: "rgb" },
        { label: "hsb", value: "hsb" },
      ],
    },
    { prop: "inline", label: "内联面板", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
};
