// 包内组件测试的最小挂载：只装配 ui 组件自身的依赖（PrimeVue 配置面 + 包自持
// 文案）。宿主级基建（pinia/vue-query/路由）不属于包，测试需要时由用例自备。
import { mount } from "@vue/test-utils";
import type { Component } from "vue";
import { createI18n, type I18nOptions } from "vue-i18n";
import PrimeVue from "primevue/config";

import { uiMessages } from "../locale/index.js";

export function mountUiComponent(
  component: Component,
  options: Record<string, unknown> = {},
) {
  const i18n = createI18n({
    legacy: false,
    locale: "zh-CN",
    messages: { "zh-CN": uiMessages["zh-CN"] },
  } as unknown as I18nOptions);
  return mount(component, {
    ...options,
    global: {
      ...((options.global as Record<string, unknown>) ?? {}),
      plugins: [[PrimeVue], i18n],
    },
  });
}
