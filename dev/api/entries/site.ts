import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "site",
  component: "SiteHeader / SiteFooter",
  title: "营销站框架",
  importPath: "@mango-write/ui",
  exports: ["SiteHeader","SiteFooter"],
  rows: [
    { name: "SiteHeader items", kind: "prop", type: "{ label, href, active? }[]", desc: "主导航链接列表" },
    { name: "SiteHeader showLang / langLabel", kind: "prop", type: "boolean · string", desc: "显示语言切换圆钮及其文字" },
    { name: "SiteHeader #actions", kind: "prop", type: "slot", desc: "右侧操作区（登录 / 进入工作台按钮）" },
    { name: "SiteFooter locale", kind: "prop", type: "'zh-CN' · 'en'", desc: "页脚文案语言" },
    { name: "SiteFooter #default", kind: "prop", type: "slot", desc: "法务与站点导航链接行" },
  ],
};
