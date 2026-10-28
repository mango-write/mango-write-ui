import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/dev/ui" },
    {
      path: "/dev/ui",
      name: "dev.ui",
      component: () => import("./pages/UiShowcase.vue"),
    },
    {
      path: "/dev/icon",
      name: "dev.icon",
      component: () => import("./pages/IconShowcase.vue"),
    },
    { path: "/:pathMatch(.*)*", redirect: "/dev/ui" },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash };
    return { top: 0 };
  },
});
