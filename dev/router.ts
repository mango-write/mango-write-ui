import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { docGroups } from "./registry";
import LandingPage from "./pages/landing.vue";

const docRoutes: RouteRecordRaw[] = docGroups.flatMap((group) =>
  group.entries.map((entry) => ({
    path: `${group.base}/${entry.slug}`,
    name: `${group.id}.${entry.slug}`,
    component: entry.load,
    meta: { title: entry.title, en: entry.en, group: group.title },
  })),
);

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 首页是唯一 SEO 收录面（seo.config.mjs paths），不走文档外壳。
    { path: "/", name: "landing", component: LandingPage, meta: { landing: true } },
    ...docRoutes,
    // 未知路径（含历史的 /dev/ui/* 深链）回落首页。
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash };
    return { top: 0 };
  },
});
