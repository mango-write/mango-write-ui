import { h } from "vue";
import { SelectButton } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const alignments = [
  { label: "左对齐", value: "left" },
  { label: "居中", value: "center" },
  { label: "右对齐", value: "right" },
] as const;

// options 数组进不了声明式代码序列化,渲染与代码都走自定义
export const usage: UsageEntry = {
  slug: "select-button",
  component: SelectButton,
  tag: "SelectButton",
  controls: [
    { prop: "modelValue", vname: "align", label: "当前值", kind: "enum", default: "left", options: alignments.map((o) => ({ ...o })), vmodel: true },
    {
      prop: "size",
      label: "尺寸",
      kind: "enum",
      default: "md",
      options: [
        { label: "xs", value: "xs" },
        { label: "sm", value: "sm" },
        { label: "md", value: "md" },
        { label: "lg", value: "lg" },
      ],
    },
    { prop: "allowEmpty", label: "允许取消选中", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) =>
    h(SelectButton, {
      options: alignments,
      optionLabel: "label",
      optionValue: "value",
      modelValue: v.align,
      "onUpdate:modelValue": (x: unknown) => {
        v.align = x as string;
      },
      size: v.size as "xs" | "sm" | "md" | "lg" | undefined,
      allowEmpty: Boolean(v.allowEmpty),
      disabled: Boolean(v.disabled),
      ariaLabel: "对齐方式",
    }),
  code: (v: UsageValues) => {
    const attrs = [
      'v-model="align"',
      ":options=\"alignments\"",
      'option-label="label"',
      'option-value="value"',
      v.size && v.size !== "md" ? `size="${v.size}"` : "",
      v.allowEmpty ? "allow-empty" : "",
      v.disabled ? "disabled" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["SelectButton"],
      vue: ["ref"],
      setup: [
        `const align = ref(${JSON.stringify(v.align ?? "left")});`,
        "",
        "const alignments = [",
        ...alignments.map((o) => `  { label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} },`),
        "];",
      ],
      template: `<SelectButton\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
