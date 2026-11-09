import { h } from "vue";
import { AsyncSearchSelect, type AsyncSearchOption } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const corpus: AsyncSearchOption[] = [
  { value: "10.1038/s41586-024-07123-x", label: "Nature · 2024 · 深度学习蛋白质设计" },
  { value: "10.1126/science.adk9587", label: "Science · 2024 · 常温超导体制备" },
  { value: "10.1016/j.cell.2024.05.012", label: "Cell · 2024 · 单细胞时空组学" },
  { value: "10.1103/PhysRevLett.132.191601", label: "PRL · 2024 · 引力波记忆效应" },
];

// 演示用假远程搜索:300ms 延迟 + 子串过滤,契约与真接口一致
async function search(query: string): Promise<AsyncSearchOption[]> {
  await new Promise((r) => setTimeout(r, 300));
  const q = query.trim().toLowerCase();
  if (!q) return corpus;
  return corpus.filter((o) => o.label.toLowerCase().includes(q) || o.value.includes(q));
}

export const usage: UsageEntry = {
  slug: "async-search-select",
  component: AsyncSearchSelect,
  tag: "AsyncSearchSelect",
  controls: [
    { prop: "placeholder", label: "占位提示", kind: "text", default: "输入 DOI 或标题关键词" },
    { prop: "showClear", label: "清空按钮", kind: "boolean", default: true },
    { prop: "fluid", label: "撑满容器", kind: "boolean", default: true },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) =>
    h(AsyncSearchSelect, {
      modelValue: (v.doi as string | null) ?? null,
      "onUpdate:modelValue": (x: unknown) => {
        v.doi = x as never;
      },
      search,
      placeholder: v.placeholder as string | undefined,
      showClear: Boolean(v.showClear),
      fluid: Boolean(v.fluid),
      disabled: Boolean(v.disabled),
      ariaLabel: "远程检索文献",
    }),
  code: (v: UsageValues) => {
    const attrs = [
      'v-model="doi"',
      ':search="search"',
      v.placeholder ? `placeholder="${v.placeholder}"` : "",
      v.showClear ? "show-clear" : "",
      v.fluid ? "fluid" : "",
      v.disabled ? "disabled" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["AsyncSearchSelect", "type AsyncSearchOption"],
      vue: ["ref"],
      setup: [
        'const doi = ref<string | null>(null);',
        "",
        "// 远程检索函数:入参为关键词,返回候选(label/value)数组",
        "async function search(query: string): Promise<AsyncSearchOption[]> {",
        "  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);",
        "  return res.json();",
        "}",
      ],
      template: `<AsyncSearchSelect\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
