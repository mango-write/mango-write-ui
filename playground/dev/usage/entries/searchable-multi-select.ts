import { h } from "vue";
import { SearchableMultiSelect } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const tags = [
  { label: "机器学习", value: "ml" },
  { label: "气候建模", value: "climate" },
  { label: "蛋白质结构", value: "protein" },
  { label: "引力波", value: "gw" },
  { label: "量子计算", value: "quantum" },
];

export const usage: UsageEntry = {
  slug: "searchable-multi-select",
  component: SearchableMultiSelect,
  tag: "SearchableMultiSelect",
  controls: [
    { prop: "placeholder", label: "占位提示", kind: "text", default: "检索并选择研究方向" },
    {
      prop: "size",
      label: "尺寸",
      kind: "enum",
      default: undefined,
      options: [
        { label: "small", value: "small" },
        { label: "large", value: "large" },
      ],
    },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
    { prop: "invalid", label: "错误态", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) => {
    if (!Array.isArray(v.picked)) v.picked = ["ml", "climate"] as never;
    return h(SearchableMultiSelect, {
      options: tags,
      optionLabel: "label",
      optionValue: "value",
      modelValue: v.picked as unknown as string[],
      "onUpdate:modelValue": (x: unknown) => {
        v.picked = x as never;
      },
      placeholder: v.placeholder as string | undefined,
      size: v.size as "small" | "large" | undefined,
      disabled: Boolean(v.disabled),
      invalid: Boolean(v.invalid),
      ariaLabel: "研究方向",
      style: "width: min(300px, 100%)",
    });
  },
  code: (v: UsageValues) => {
    const attrs = [
      'v-model="picked"',
      ':options="tags"',
      'option-label="label"',
      'option-value="value"',
      v.placeholder ? `placeholder="${v.placeholder}"` : "",
      v.size ? `size="${v.size}"` : "",
      v.disabled ? "disabled" : "",
      v.invalid ? "invalid" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["SearchableMultiSelect"],
      vue: ["ref"],
      setup: [
        'const picked = ref(["ml", "climate"]);',
        "",
        "const tags = [",
        ...tags.map((o) => `  { label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} },`),
        "];",
      ],
      template: `<SearchableMultiSelect\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
