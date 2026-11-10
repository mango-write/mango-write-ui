<script setup lang="ts">
import { computed } from "vue";
import { Button, InputText, SelectButton, ToggleSwitch } from "@mango-write/ui-vue";
import MpDocPage from "../../kit/MpDocPage.vue";
import { mobileApi } from "../../mobile-demos/api";
import { mpSim } from "../../mobile-demos/state";
import { t } from "../../i18n";

const tones = computed(() => [
  { label: t({ zh: "成功 success", en: "success" }), value: "success" },
  { label: t({ zh: "信息 info", en: "info" }), value: "info" },
  { label: t({ zh: "警告 warn", en: "warn" }), value: "warn" },
  { label: t({ zh: "错误 error", en: "error" }), value: "error" },
]);
const code = computed(() =>
  t({
    zh: `const accepted = await confirm.ask({ title: "删除这条研究记录？", danger: ${mpSim.feedback.danger} });
notify.${mpSim.feedback.toastTone}("${mpSim.feedback.toastMessage}");`,
    en: `const accepted = await confirm.ask({ title: "Delete this research entry?", danger: ${mpSim.feedback.danger} });
notify.${mpSim.feedback.toastTone}("${mpSim.feedback.toastMessage}");`,
  }),
);
</script>

<template>
  <MpDocPage slug="feedback" :code="code" :api="mobileApi.feedback" :guidelines="[
    { kind: 'do', zh: '<strong>二次确认</strong>（MpConfirmHost）：破坏性操作必经确认弹窗，默认初始焦点落在「取消」以防误触。', en: '<strong>Confirmation</strong> (MpConfirmHost): destructive actions require confirmation, focusing Cancel by default.' },
    { kind: 'do', zh: '<strong>轻量提示</strong>（MpToastHost）：只展示最新一条通知，不堆叠遮挡内容，附带 44px 关闭按钮。', en: '<strong>Toast notification</strong> (MpToastHost): shows only the latest message without stacking, with a 44px close target.' },
    { kind: 'dont', zh: '不用 Toast 承载需要用户阅读长文或做决策的报错信息。', en: 'Never use toasts for long error explanations that require user decisions.' },
  ]">
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "危险确认样式", en: "Danger confirm" }) }}</span><code class="mp-field__prop">danger</code></div>
      <ToggleSwitch v-model="mpSim.feedback.danger" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "通知类型", en: "Toast severity" }) }}</span><code class="mp-field__prop">notify.*</code></div>
      <SelectButton size="sm" :model-value="mpSim.feedback.toastTone" :options="tones" option-label="label" option-value="value" :allow-empty="false" @update:model-value="mpSim.feedback.toastTone = $event as typeof mpSim.feedback.toastTone" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "通知文案", en: "Toast message" }) }}</span><code class="mp-field__prop">summary</code></div>
      <InputText v-model="mpSim.feedback.toastMessage" size="sm" fluid />
    </div>
    <template #actions>
      <Button size="sm" variant="tinted" severity="danger" :label="t({ zh: '触发确认弹窗', en: 'Trigger confirm' })" @click="mpSim.feedback.confirmTick += 1" />
      <Button size="sm" variant="tinted" :label="t({ zh: '发送 Toast 通知', en: 'Trigger toast' })" @click="mpSim.feedback.toastTick += 1" />
    </template>
  </MpDocPage>
</template>
