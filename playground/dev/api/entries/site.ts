import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "site",
  component: "SiteHeader / SiteFooter",
  title: { zh: "营销站框架", en: "Marketing site chrome" },
  importPath: "@mango-write/ui-vue",
  exports: ["SiteHeader", "SiteFooter"],
  rows: [
    {
      name: "SiteHeader items",
      kind: "prop",
      type: "{ label, href, active? }[]",
      desc: {
        zh: "主导航链接列表",
        en: "Primary navigation link list",
      },
    },
    {
      name: "SiteHeader showLang / langLabel",
      kind: "prop",
      type: "boolean · string",
      desc: {
        zh: "显示语言切换圆钮及其文字",
        en: "Shows the language-switch button and its label",
      },
    },
    {
      name: "SiteHeader #actions",
      kind: "prop",
      type: "slot",
      desc: {
        zh: "右侧操作区（登录 / 进入工作台按钮）",
        en: "Right-side action area (sign-in / enter-workspace button)",
      },
    },
    {
      name: "SiteFooter locale",
      kind: "prop",
      type: "'zh-CN' · 'en'",
      desc: {
        zh: "页脚文案语言",
        en: "Footer copy language",
      },
    },
    {
      name: "SiteFooter #default",
      kind: "prop",
      type: "slot",
      desc: {
        zh: "法务与站点导航链接行",
        en: "Legal and site navigation link row",
      },
    },
  ],
};
