import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import { router } from "./router";
import {
  initTheme,
  mergeUiMessages,
  provideConfirm,
  provideNotify,
  vTooltip,
} from "../src";
import "./style.css";

initTheme({ storageKey: "mango-write-ui:dev-theme" });

const i18n = createI18n({
  legacy: false,
  locale: "zh-CN",
  fallbackLocale: "zh-CN",
  messages: { "zh-CN": {}, "en-US": {} },
});
mergeUiMessages(i18n);

const app = createApp(App).use(router).use(i18n).directive("tooltip", vTooltip);
provideConfirm(app);
provideNotify(app);
app.mount("#app");
