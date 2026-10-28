import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import DialogService from "primevue/dialogservice";
import ToastService from "primevue/toastservice";
import App from "./App.vue";
import { router } from "./router";
import { MangoPreset, initTheme, mergeUiMessages, vTooltip } from "../src";
import "./style.css";

initTheme({ storageKey: "mango-write-ui:dev-theme" });

const i18n = createI18n({
  legacy: false,
  locale: "zh-CN",
  fallbackLocale: "zh-CN",
  messages: { "zh-CN": {}, "en-US": {} },
});
mergeUiMessages(i18n);

createApp(App)
  .use(router)
  .use(i18n)
  .use(PrimeVue, {
    theme: {
      preset: MangoPreset,
      options: { darkModeSelector: '[data-theme="dark"]' },
    },
  })
  .use(ToastService)
  .use(ConfirmationService)
  .use(DialogService)
  .directive("tooltip", vTooltip)
  .mount("#app");
