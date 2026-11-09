import { Select } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const sections = [
  { label: "引言", value: "intro" },
  { label: "材料与方法", value: "methods" },
  { label: "实验结果", value: "results" },
  { label: "讨论", value: "discussion" },
  { label: "结论", value: "conclusion" },
];

export const usage: UsageEntry = {
  slug: "select",
  component: Select,
  tag: "Select",
  // options 由 baseProps 传给渲染;代码侧的 :options 走自定义 code 输出
  baseProps: { options: sections, optionLabel: "label", optionValue: "value" },
  controls: [
    { prop: "modelValue", vname: "section", label: "当前值", kind: "enum", default: "methods", options: sections.map((o) => ({ ...o })), vmodel: true },
    { prop: "placeholder", label: "占位提示", kind: "text", default: "选择章节" },
    { prop: "filter", label: "面板内过滤", kind: "boolean", default: false },
    { prop: "showClear", label: "清空按钮", kind: "boolean", default: false },
    {
      prop: "size",
      label: "尺寸",
      kind: "enum",
      default: undefined,
      options: [
        { label: "xs", value: "xs" },
        { label: "sm", value: "sm" },
        { label: "md", value: "md" },
        { label: "lg", value: "lg" },
      ],
    },
    { prop: "fluid", label: "撑满容器", kind: "boolean", default: true },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
  code: (v: UsageValues) => {
    const attrs = [
      'v-model="section"',
      ':options="sections"',
      'option-label="label"',
      'option-value="value"',
      v.placeholder ? `placeholder="${v.placeholder}"` : "",
      v.filter ? "filter" : "",
      v.showClear ? "show-clear" : "",
      v.size ? `size="${v.size}"` : "",
      v.fluid ? "fluid" : "",
      v.disabled ? "disabled" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["Select"],
      vue: ["ref"],
      setup: [
        `const section = ref(${JSON.stringify(v.section ?? null)});`,
        "",
        "const sections = [",
        ...sections.map((o) => `  { label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} },`),
        "];",
      ],
      template: `<Select\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
