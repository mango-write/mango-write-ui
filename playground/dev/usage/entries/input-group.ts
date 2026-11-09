import { h } from "vue";
import { InputGroup, InputGroupAddon, InputText } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

export const usage: UsageEntry = {
  slug: "input-group",
  component: InputGroup,
  tag: "InputGroup",
  controls: [
    { prop: "prefix", label: "前缀文案", kind: "text", default: "https://doi.org/" },
    { prop: "modelValue", vname: "doi", label: "内容", kind: "text", default: "", vmodel: true },
    { prop: "fluid", label: "撑满容器", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) =>
    h(InputGroup, { style: v.fluid ? "width: 100%" : "width: min(320px, 100%)" }, {
      default: () => [
        ...(v.prefix ? [h(InputGroupAddon, () => String(v.prefix))] : []),
        h(InputText, {
          modelValue: (v.value as string | null) ?? null,
          "onUpdate:modelValue": (x: unknown) => {
            v.doi = x as string;
          },
          fluid: true,
          placeholder: "10.1038/s41586-024-07123-x",
          ariaLabel: "DOI 编号",
        }),
      ],
    }),
  code: (v: UsageValues) => {
    const addon = v.prefix ? `  <InputGroupAddon>${v.prefix}</InputGroupAddon>\n` : "";
    const inputAttrs = ['v-model="doi"', "fluid", 'placeholder="10.1038/s41586-024-07123-x"'].join(" ");
    return sfc({
      ui: ["InputGroup", "InputGroupAddon", "InputText"],
      vue: ["ref"],
      setup: ['const doi = ref("");'],
      template: `<InputGroup style="${v.fluid ? "width: 100%" : "width: min(320px, 100%)"}">\n${addon}  <InputText ${inputAttrs} />\n</InputGroup>`,
    });
  },
};
