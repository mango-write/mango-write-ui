import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { docGroups } from "./registry";

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
    { path: "/", redirect: "/dev/ui/foundations/overview" },
    { path: "/dev/ui", redirect: "/dev/ui/foundations/overview" },
    { path: "/dev/icon", redirect: "/dev/ui/foundations/icon" },
    ...docRoutes,
    { path: "/:pathMatch(.*)*", redirect: "/dev/ui/foundations/overview" },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash };
    return { top: 0 };
  },
});
