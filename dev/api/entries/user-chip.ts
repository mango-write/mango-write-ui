import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "user-chip",
  component: "UserChip",
  title: { zh: "成员纸片", en: "User chip" },
  importPath: "@mango-write/ui",
  rows: [
    {
      name: "user",
      kind: "prop",
      type: "UserProfile",
      desc: {
        zh: "必填，用户资料对象（含 <code>name</code>、<code>avatar</code>、<code>handle</code>、<code>badge</code>、<code>role</code>、<code>email</code>、<code>description</code>）",
        en: "Required profile object (<code>name</code>, <code>avatar</code>, <code>handle</code>, <code>badge</code>, <code>role</code>, <code>email</code>, <code>description</code>)",
      },
    },
    {
      name: "variant",
      kind: "prop",
      type: "text · tag · avatar · person",
      desc: { zh: "展示形态；默认 <code>text</code>", en: "Display form; defaults to <code>text</code>" },
    },
    {
      name: "size",
      kind: "prop",
      type: "xs · sm · md · lg · small · medium · large",
      desc: {
        zh: "尺寸档位；不传则跟随密度上下文（<code>text</code> 除外）",
        en: "Size tier; follows the density context when omitted (except <code>text</code>)",
      },
    },
    {
      name: "showCard",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "悬停或聚焦时是否展示 <code>UserCard</code> 浮层；默认 <code>true</code>",
        en: "Show the <code>UserCard</code> overlay on hover or focus; defaults to <code>true</code>",
      },
    },
    {
      name: "href",
      kind: "prop",
      type: "string | null",
      desc: {
        zh: "传入时根节点渲染为 <code><a></code> 链接",
        en: "When set, the root renders as an <code><a></code> link",
      },
    },
    {
      name: "#id-actions / #card",
      kind: "slot",
      type: "{ user }",
      desc: {
        zh: "透传至内部 <code>UserCard</code> 的 ID 旁操作区与底部扩展区",
        en: "Forwarded to the inner <code>UserCard</code>'s ID-adjacent actions and bottom extension area",
      },
    },
  ],
};
