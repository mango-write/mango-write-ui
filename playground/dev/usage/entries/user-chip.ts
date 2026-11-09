import { h } from "vue";
import { UserChip, type UserProfile } from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const user: UserProfile = {
  id: "u-lin",
  handle: "@linwq",
  name: "林晚晴",
  email: "wanqing.lin@mango.dev",
  role: "共同作者",
};

export const usage: UsageEntry = {
  slug: "user-chip",
  component: UserChip,
  tag: "UserChip",
  controls: [
    {
      prop: "variant",
      label: "形态",
      kind: "enum",
      default: "text",
      options: [
        { label: "text 文本", value: "text" },
        { label: "tag 标签", value: "tag" },
        { label: "avatar 头像", value: "avatar" },
        { label: "person 人卡", value: "person" },
      ],
    },
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
    { prop: "showCard", label: "悬停名片", kind: "boolean", default: false },
  ],
  render: (v: UsageValues) =>
    h(UserChip, {
      user,
      variant: (v.variant as "text" | "tag" | "avatar" | "person") ?? "text",
      size: v.size as "xs" | "sm" | "md" | "lg" | undefined,
      showCard: Boolean(v.showCard),
    }),
  code: (v: UsageValues) => {
    const attrs = [
      ":user=\"user\"",
      v.variant && v.variant !== "text" ? `variant="${v.variant}"` : "",
      v.size ? `size="${v.size}"` : "",
      v.showCard ? "show-card" : "",
    ].filter(Boolean);
    return sfc({
      ui: ["UserChip", "type UserProfile"],
      vue: [],
      setup: [
        "const user: UserProfile = {",
        '  id: "u-lin",',
        '  handle: "@linwq",',
        '  name: "林晚晴",',
        '  email: "wanqing.lin@mango.dev",',
        '  role: "共同作者",',
        "};",
      ],
      template: `<UserChip\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
