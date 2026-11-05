import { h } from "vue";
import { UserCard, type UserProfile } from "../../../src";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";

const user: UserProfile = {
  id: "u-gu",
  handle: "@zhiyao",
  name: "顾之遥",
  email: "zhiyao.gu@mango.dev",
  role: "通讯作者",
  description: "凝聚态理论与计算材料学方向，负责课题的整体设计与论文定稿。",
};

export const usage: UsageEntry = {
  slug: "user-card",
  component: UserCard,
  tag: "UserCard",
  controls: [
    {
      prop: "size",
      label: "尺寸",
      kind: "enum",
      default: "medium",
      options: [
        { label: "medium", value: "medium" },
        { label: "large", value: "large" },
      ],
    },
  ],
  render: (v: UsageValues) =>
    h(UserCard, { user, size: (v.size as "medium" | "large") ?? "medium", style: "width: min(320px, 100%)" }),
  code: (v: UsageValues) => {
    const attrs = [':user="user"', v.size && v.size !== "medium" ? 'size="large"' : ""].filter(Boolean);
    return sfc({
      ui: ["UserCard", "type UserProfile"],
      vue: [],
      setup: [
        "const user: UserProfile = {",
        '  id: "u-gu",',
        '  handle: "@zhiyao",',
        '  name: "顾之遥",',
        '  email: "zhiyao.gu@mango.dev",',
        '  role: "通讯作者",',
        '  description: "凝聚态理论与计算材料学方向，负责课题的整体设计与论文定稿。",',
        "};",
      ],
      template: `<UserCard style="width: min(320px, 100%)"\n    ${attrs.join("\n    ")}\n  />`,
    });
  },
};
