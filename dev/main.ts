import { createApp, watch } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import { router } from "./router";
import { locale } from "./i18n";
import {
  initTheme,
  mergeUiMessages,
  provideConfirm,
  provideNotify,
  vScrollFade,
  vTooltip,
} from "../src";
import "./style.css";

initTheme({ storageKey: "mango-write-ui:dev-theme" });

const i18n = createI18n({
  legacy: false,
  locale: locale.value,
  fallbackLocale: "zh-CN",
  messages: { "zh-CN": {}, "en-US": {} },
});
mergeUiMessages(i18n);
// 库组件内置文案(SearchableSelect noMatch、Confirm 按钮等)跟随展示站语言;
// lang 同步给无障碍环境。immediate 只补 lang,locale 初始值模块加载时已落。
watch(
  locale,
  (value) => {
    i18n.global.locale.value = value;
    document.documentElement.lang = value;
  },
  { immediate: true },
);

const app = createApp(App)
  .use(router)
  .use(i18n)
  .directive("tooltip", vTooltip)
  .directive("scroll-fade", vScrollFade);
provideConfirm(app);
provideNotify(app);
app.mount("#app");
