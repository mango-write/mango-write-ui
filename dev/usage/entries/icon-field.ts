import { h } from "vue";
import { AtSign, Calendar, Search } from "lucide-vue-next";
import { IconField, InputIcon, InputText } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const icons = [
  { name: "Search", component: Search },
  { name: "AtSign", component: AtSign },
  { name: "Calendar", component: Calendar },
];

export const usage: UsageEntry = {
  slug: "icon-field",
  component: IconField,
  tag: "IconField",
  controls: [
    { prop: "modelValue", vname: "query", label: "内容", kind: "text", default: "", vmodel: true },
    { prop: "placeholder", label: "占位提示", kind: "text", default: "搜索文献" },
    {
      prop: "icon",
      label: "图标",
      kind: "enum",
      default: "Search",
      componentOptions: icons,
    },
    {
      prop: "size",
      label: "密度档",
      kind: "enum",
      default: undefined,
      options: [
        { label: "xs", value: "xs" },
        { label: "sm", value: "sm" },
        { label: "md", value: "md" },
        { label: "lg", value: "lg" },
      ],
    },
  ],
  render: (v: UsageValues) => {
    const icon = icons.find((o) => o.name === v.icon) ?? icons[0];
    return h(
      IconField,
      { class: v.size ? `mw-size-${v.size}` : undefined, style: "width: min(300px, 100%)" },
      {
        default: () => [
          h(InputIcon, () => h(icon.component)),
          h(InputText, {
            modelValue: (v.value as string | null) ?? null,
            "onUpdate:modelValue": (x: unknown) => {
              v.query = x as string;
            },
            placeholder: v.placeholder as string | undefined,
            fluid: true,
            ariaLabel: "示例输入框",
          }),
        ],
      },
    );
  },
  code: (v: UsageValues) => {
    const inputAttrs = [
      'v-model="query"',
      v.placeholder ? `placeholder="${v.placeholder}"` : "",
      "fluid",
    ].filter(Boolean);
    return sfc({
      ui: ["IconField", "InputIcon", "InputText"],
      vue: ["ref"],
      lucide: [String(v.icon ?? "Search")],
      setup: ['const query = ref("");'],
      template: `<IconField${v.size ? ` class="mw-size-${v.size}"` : ""} style="width: min(300px, 100%)">\n  <InputIcon><${v.icon ?? "Search"} /></InputIcon>\n  <InputText ${inputAttrs.join(" ")} />\n</IconField>`,
    });
  },
};
