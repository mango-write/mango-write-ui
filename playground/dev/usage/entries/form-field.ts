import { h } from "vue";
import { FormField, InputText } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

interface FieldSlot {
  inputId: string;
  describedBy: string | undefined;
  invalid: boolean;
}

export const usage: UsageEntry = {
  slug: "form-field",
  component: FormField,
  tag: "FormField",
  controls: [
    { prop: "label", label: "标签", kind: "text", default: "论文标题" },
    { prop: "value", label: "内容", kind: "text", default: "", vmodel: true },
    { prop: "placeholder", label: "占位提示", kind: "text", default: "输入标题" },
    { prop: "hint", label: "帮助文案", kind: "text", default: undefined },
    { prop: "error", label: "错误文案", kind: "text", default: undefined },
    { prop: "required", label: "必填", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) =>
    h(
      FormField,
      {
        inputId: "demo-title",
        label: v.label as string,
        hint: v.hint as string | undefined,
        error: v.error as string | undefined,
        required: Boolean(v.required),
      },
      {
        default: (slot: FieldSlot) =>
          h(InputText, {
            id: slot.inputId,
            modelValue: (v.value as string | null) ?? null,
            "onUpdate:modelValue": (x: unknown) => {
              v.value = x as string;
            },
            "aria-describedby": slot.describedBy,
            invalid: slot.invalid,
            placeholder: v.placeholder as string | undefined,
            fluid: true,
          }),
      },
    ),
  code: (v: UsageValues) => {
    const headAttrs = [
      'input-id="demo-title"',
      `label="${v.label ?? ""}"`,
      v.hint ? `hint="${v.hint}"` : "",
      v.error ? `error="${v.error}"` : "",
      v.required ? "required" : "",
    ].filter(Boolean);
    const inputAttrs = [
      'v-model="value"',
      ':id="inputId"',
      ':aria-describedby="describedBy"',
      ':invalid="invalid"',
      v.placeholder ? `placeholder="${v.placeholder}"` : "",
      "fluid",
    ].filter(Boolean);
    return sfc({
      ui: ["FormField", "InputText"],
      vue: ["ref"],
      setup: ['const value = ref("");'],
      template: `<FormField\n    ${headAttrs.join("\n    ")}\n  >\n    <template #default="{ inputId, describedBy, invalid }">\n      <InputText\n        ${inputAttrs.join("\n        ")}\n      />\n    </template>\n  </FormField>`,
    });
  },
};
