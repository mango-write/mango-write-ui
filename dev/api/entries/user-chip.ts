import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "user-chip",
  component: "UserChip",
  title: "成员纸片",
  importPath: "@mango-write/ui",
  rows: [
    { name: "user", kind: "prop", type: "UserProfile", desc: "必填，用户资料对象（含 <code>name</code>、<code>avatar</code>、<code>handle</code>、<code>badge</code>、<code>role</code>、<code>email</code>、<code>description</code>）" },
    { name: "variant", kind: "prop", type: "text · tag · avatar · person", desc: "展示形态；默认 <code>text</code>" },
    { name: "size", kind: "prop", type: "xs · sm · md · lg · small · medium · large", desc: "尺寸档位；不传则跟随密度上下文（<code>text</code> 除外）" },
    { name: "showCard", kind: "prop", type: "boolean", desc: "悬停或聚焦时是否展示 <code>UserCard</code> 浮层；默认 <code>true</code>" },
    { name: "href", kind: "prop", type: "string | null", desc: "传入时根节点渲染为 <code><a></code> 链接" },
    { name: "#id-actions / #card", kind: "slot", type: "{ user }", desc: "透传至内部 <code>UserCard</code> 的 ID 旁操作区与底部扩展区" },
  ],
};
