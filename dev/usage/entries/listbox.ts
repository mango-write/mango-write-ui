import { Listbox } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const venues = [
  { label: "NeurIPS 2025", value: "neurips" },
  { label: "ICML 2025", value: "icml" },
  { label: "ACL 2025", value: "acl" },
  { label: "CVPR 2025", value: "cvpr" },
];

export const usage: UsageEntry = {
  slug: "listbox",
  component: Listbox,
  tag: "Listbox",
  baseProps: { options: venues, optionLabel: "label", optionValue: "value", listStyle: "height: 172px" },
  controls: [
    { prop: "modelValue", vname: "venue", label: "当前值", kind: "enum", default: "neurips", options: venues.map((o) => ({ ...o })), vmodel: true },
    { prop: "filter", label: "过滤框", kind: "boolean", default: false },
    { prop: "invalid", label: "错误态", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
  code: (v: UsageValues) => {
    const attrs = [
      'v-model="venue"',
      ':options="venues"',
      'option-label="label"',
      'option-value="value"',
      'list-style="height: 172px"',
      v.filter ? "filter" : "",
      v.invalid ? "invalid" : "",
      v.disabled ? "disabled" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["Listbox"],
      vue: ["ref"],
      setup: [
        `const venue = ref(${JSON.stringify(v.venue ?? null)});`,
        "",
        "const venues = [",
        ...venues.map((o) => `  { label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} },`),
        "];",
      ],
      template: `<Listbox\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
