import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { docGroups } from "./registry";
import type { Bi } from "./i18n";
import LandingPage from "./pages/landing.vue";

declare module "vue-router" {
  interface RouteMeta {
    landing?: boolean;
    /** 页标题(Bi);App.vue 拼进 document.title,DocPage 作 h1 */
    title?: Bi;
    /** 页首一句话简介;DocPage 未接 lead prop 时用它 */
    lead?: Bi;
    group?: Bi;
  }
}

const docRoutes: RouteRecordRaw[] = docGroups.flatMap((group) =>
  group.entries.map((entry) => ({
    path: `${group.base}/${entry.slug}`,
    name: `${group.id}.${entry.slug}`,
    component: entry.load,
    meta: { title: entry.title, lead: entry.lead, group: group.title },
  })),
);

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 首页是唯一 SEO 收录面（seo.config.mjs paths），不走文档外壳。
    {
      path: "/",
      name: "landing",
      component: LandingPage,
      meta: {
        landing: true,
        title: { zh: "纸与霜设计语言", en: "Paper & Frost Design Language" },
      },
    },
    ...docRoutes,
    // 未知路径（含历史的 /dev/ui/* 深链）回落首页。
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash };
    return { top: 0 };
  },
});
