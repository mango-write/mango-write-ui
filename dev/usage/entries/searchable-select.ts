import { SearchableSelect } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const journals = [
  { label: "Nature", value: "nature" },
  { label: "Science", value: "science" },
  { label: "Cell", value: "cell" },
  { label: "PNAS", value: "pnas" },
  { label: "arXiv (cond-mat)", value: "arxiv" },
];

export const usage: UsageEntry = {
  slug: "searchable-select",
  component: SearchableSelect,
  tag: "SearchableSelect",
  baseProps: { options: journals, optionLabel: "label", optionValue: "value" },
  controls: [
    { prop: "modelValue", vname: "journal", label: "当前值", kind: "enum", default: "nature", options: journals.map((o) => ({ ...o })), vmodel: true },
    { prop: "placeholder", label: "占位提示", kind: "text", default: "检索期刊" },
    { prop: "showClear", label: "清空按钮", kind: "boolean", default: true },
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
  code: (v: UsageValues) => {
    const attrs = [
      'v-model="journal"',
      ':options="journals"',
      'option-label="label"',
      'option-value="value"',
      v.placeholder ? `placeholder="${v.placeholder}"` : "",
      v.showClear ? "show-clear" : "",
      v.size ? `size="${v.size}"` : "",
      v.disabled ? "disabled" : "",
      v.invalid ? "invalid" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["SearchableSelect"],
      vue: ["ref"],
      setup: [
        `const journal = ref(${JSON.stringify(v.journal ?? null)});`,
        "",
        "const journals = [",
        ...journals.map((o) => `  { label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} },`),
        "];",
      ],
      template: `<SearchableSelect\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
