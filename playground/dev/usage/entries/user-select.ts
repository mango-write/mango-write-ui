import { h } from "vue";
import { UserSelect, type UserSelectOption } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const members: UserSelectOption[] = [
  { id: "u-lin", name: "林晚晴", email: "wanqing.lin@mango.dev" },
  { id: "u-gu", name: "顾之遥", email: "zhiyao.gu@mango.dev" },
  { id: "u-sen", name: "森下知惠", email: "tomoe.morishita@mango.dev" },
  { id: "u-hart", name: "Jonas Hart", email: "jonas.hart@mango.dev" },
];

export const usage: UsageEntry = {
  slug: "user-select",
  component: UserSelect,
  tag: "UserSelect",
  controls: [
    { prop: "placeholder", label: "占位提示", kind: "text", default: undefined },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) => {
    if (!Array.isArray(v.assignees)) v.assignees = ["u-lin"] as never;
    return h(UserSelect, {
      modelValue: v.assignees as unknown as string[],
      "onUpdate:modelValue": (x: unknown) => {
        v.assignees = x as never;
      },
      users: members,
      placeholder: v.placeholder as string | undefined,
      disabled: Boolean(v.disabled),
      ariaLabel: "指派协作成员",
      style: "width: min(300px, 100%)",
    });
  },
  code: (v: UsageValues) => {
    const attrs = [
      'v-model="assignees"',
      ':users="members"',
      v.placeholder ? `placeholder="${v.placeholder}"` : "",
      v.disabled ? "disabled" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["UserSelect", "type UserSelectOption"],
      vue: ["ref"],
      setup: [
        'const assignees = ref(["u-lin"]);',
        "",
        "const members: UserSelectOption[] = [",
        ...members.map((m) => `  { id: ${JSON.stringify(m.id)}, name: ${JSON.stringify(m.name)}, email: ${JSON.stringify(m.email)} },`),
        "];",
      ],
      template: `<UserSelect\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
