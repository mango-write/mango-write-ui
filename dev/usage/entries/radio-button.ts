import { h } from "vue";
import { RadioButton } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const options = [
  { label: "APA 7th", value: "apa" },
  { label: "IEEE Numeric", value: "ieee" },
  { label: "GB/T 7714", value: "gbt" },
];

const labelStyle = "display:inline-flex;align-items:center;gap:var(--space-2);cursor:pointer";

export const usage: UsageEntry = {
  slug: "radio-button",
  component: RadioButton,
  tag: "RadioButton",
  controls: [
    { prop: "modelValue", vname: "style", label: "当前值", kind: "enum", default: "apa", options: options.map((o) => ({ ...o })), vmodel: true },
    {
      prop: "size",
      label: "尺寸",
      kind: "enum",
      default: "md",
      options: [
        { label: "sm", value: "sm" },
        { label: "md", value: "md" },
        { label: "lg", value: "lg" },
      ],
    },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) =>
    options.map((o) =>
      h("label", { key: o.value, style: labelStyle }, [
        h(RadioButton, {
          name: "cite-style",
          inputId: `cite-${o.value}`,
          value: o.value,
          modelValue: v.style,
          "onUpdate:modelValue": (x: unknown) => {
            v.style = x as string;
          },
          size: v.size as "sm" | "md" | "lg" | undefined,
          disabled: Boolean(v.disabled),
        }),
        o.label,
      ]),
    ),
  code: (v: UsageValues) => {
    const extra = [v.size && v.size !== "md" ? `size="${v.size}"` : "", v.disabled ? "disabled" : ""].filter(Boolean);
    const radioAttrs = (o: { value: string }) =>
      [`v-model="style"`, `value="${o.value}"`, `name="cite-style"`, `input-id="cite-${o.value}"`, ...extra].join(" ");
    return sfc({
      ui: ["RadioButton"],
      vue: ["ref"],
      setup: [`const style = ref(${JSON.stringify(v.style ?? "apa")});`],
      template: options
        .map(
          (o) =>
            `<label style="display: inline-flex; align-items: center; gap: var(--space-2); cursor: pointer">\n    <RadioButton ${radioAttrs(o)} />\n    <span>${o.label}</span>\n  </label>`,
        )
        .join("\n"),
    });
  },
};
