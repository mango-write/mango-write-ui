import { h } from "vue";
import { MultiSelect } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const parts = [
  { label: "正文", value: "body" },
  { label: "图注", value: "figures" },
  { label: "参考文献", value: "refs" },
  { label: "附录", value: "appendix" },
];

export const usage: UsageEntry = {
  slug: "multi-select",
  component: MultiSelect,
  tag: "MultiSelect",
  controls: [
    {
      prop: "display",
      label: "回显样式",
      kind: "enum",
      default: "comma",
      options: [
        { label: "逗号文本", value: "comma" },
        { label: "标签 chip", value: "chip" },
      ],
    },
    { prop: "maxSelectedLabels", label: "折叠上限", kind: "number", default: 3 },
    { prop: "filter", label: "面板内过滤", kind: "boolean", default: false },
    { prop: "showToggleAll", label: "全选开关", kind: "boolean", default: false },
    { prop: "showClear", label: "清空按钮", kind: "boolean", default: false },
    {
      prop: "size",
      label: "尺寸",
      kind: "enum",
      default: undefined,
      options: [
        { label: "sm", value: "sm" },
        { label: "md", value: "md" },
        { label: "lg", value: "lg" },
      ],
    },
    { prop: "fluid", label: "撑满容器", kind: "boolean", default: true },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) => {
    if (!Array.isArray(v.selected)) v.selected = ["body", "figures"] as never;
    return h(MultiSelect, {
      options: parts,
      optionLabel: "label",
      optionValue: "value",
      modelValue: v.selected as unknown as string[],
      "onUpdate:modelValue": (x: unknown) => {
        v.selected = x as never;
      },
      display: (v.display as "comma" | "chip") ?? "comma",
      maxSelectedLabels: v.maxSelectedLabels as number | undefined,
      filter: Boolean(v.filter),
      showToggleAll: Boolean(v.showToggleAll),
      showClear: Boolean(v.showClear),
      size: v.size as "sm" | "md" | "lg" | undefined,
      fluid: Boolean(v.fluid),
      disabled: Boolean(v.disabled),
      placeholder: "选择导出部分",
      ariaLabel: "导出部分",
      style: "width: min(300px, 100%)",
    });
  },
  code: (v: UsageValues) => {
    const attrs = [
      'v-model="selected"',
      ':options="parts"',
      'option-label="label"',
      'option-value="value"',
      v.display && v.display !== "comma" ? 'display="chip"' : "",
      v.maxSelectedLabels && v.maxSelectedLabels !== 3 ? `:max-selected-labels="${v.maxSelectedLabels}"` : "",
      v.filter ? "filter" : "",
      v.showToggleAll ? "show-toggle-all" : "",
      v.showClear ? "show-clear" : "",
      v.size ? `size="${v.size}"` : "",
      v.fluid ? "fluid" : "",
      v.disabled ? "disabled" : "",
      'placeholder="选择导出部分"',
    ].filter(Boolean);
    return sfc({
      ui: ["MultiSelect"],
      vue: ["ref"],
      setup: [
        'const selected = ref(["body", "figures"]);',
        "",
        "const parts = [",
        ...parts.map((o) => `  { label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} },`),
        "];",
      ],
      template: `<MultiSelect\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
