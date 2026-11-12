<script setup lang="ts">
import { computed } from "vue";
import { SelectButton, ToggleSwitch } from "@mango-write/ui-vue";
import MpDocPage from "../../kit/MpDocPage.vue";
import { mobileApi } from "../../mobile-demos/api";
import { mpSim } from "../../mobile-demos/state";
import { t } from "../../i18n";

const railOptions = computed(() => [
  { label: t({ zh: "纯导航胶囊", en: "Tabs" }), value: "tabs" },
  { label: t({ zh: "导航 + 主圆钮", en: "Split orb" }), value: "split" },
  { label: t({ zh: "收折 + 输入器", en: "Composer" }), value: "composer" },
]);

const code = computed(() =>
  t({
    zh: `${mpSim.navbar.showBack ? '<MpBackButton @click="goBack" />\n<MpPageHeader title="科研日志" capsule-safe />' : '<MpPageHeader title="科研日志">\n  <template #eyebrow><MpFilterChip label="个人空间" selected /></template>\n</MpPageHeader>'}
<MpTabBar v-model="active" v-model:collapsed="collapsed" :items="items">${
      mpSim.navbar.railMode === "split"
        ? '\n  <template #action><MpButton size="lg" icon-only aria-label="记录新日志"><MpIcon name="plus" :size="22" /></MpButton></template>\n'
        : mpSim.navbar.railMode === "composer"
          ? '\n  <template #composer><MpComposer v-model="draft" inline @submit="send" /></template>\n'
          : ""
    }</MpTabBar>`,
    en: `${mpSim.navbar.showBack ? '<MpBackButton @click="goBack" />\n<MpPageHeader title="Research log" capsule-safe />' : '<MpPageHeader title="Research log">\n  <template #eyebrow><MpFilterChip label="Personal Space" selected /></template>\n</MpPageHeader>'}
<MpTabBar v-model="active" v-model:collapsed="collapsed" :items="items">${
      mpSim.navbar.railMode === "split"
        ? '\n  <template #action><MpButton size="lg" icon-only aria-label="New entry"><MpIcon name="plus" :size="22" /></MpButton></template>\n'
        : mpSim.navbar.railMode === "composer"
          ? '\n  <template #composer><MpComposer v-model="draft" inline @submit="send" /></template>\n'
          : ""
    }</MpTabBar>`,
  }),
);
</script>

<template>
  <MpDocPage slug="navbar" :code="code" :api="mobileApi.navbar" :guidelines="[
    { kind: 'do', zh: '<strong>唯一顶部导航原则</strong>：一级页交由微信原生顶栏承载，空间切换放入内容流 MpPageHeader #eyebrow；沉浸式二级页最多在左上角放置一颗 44×44px 霜面返回圆钮（MpBackButton）。', en: '<strong>Single top-nav rule</strong>: top-level pages use the native WeChat bar with space context in MpPageHeader #eyebrow; custom-nav secondary pages place at most one 44×44px frost MpBackButton in the top-left.' },
    { kind: 'do', zh: '<strong>底部单轨编排</strong>（MpTabBar）：导航、主操作圆钮（#action）与 AI 输入器（collapsed + #composer）共享同一条底部悬浮轨道，绝不垂直叠两层底栏。', en: '<strong>Single bottom rail</strong> (MpTabBar): tabs, trailing action orb (#action), and inline AI composer (collapsed + #composer) share one floating rail—never stack two bottom bars.' },
    { kind: 'dont', zh: '不自绘与微信胶囊争抢顶栏空间的自建导航条；无真实未读通知时不展示红色数字角标。', en: 'Never build a custom top navbar that competes with the WeChat capsule; only show badges for real unread notifications.' },
  ]">
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "底部单轨编排", en: "Bottom rail mode" }) }}</span><code class="mp-field__prop">collapsed / #action</code></div>
      <SelectButton size="sm" :model-value="mpSim.navbar.railMode" :options="railOptions" option-label="label" option-value="value" :allow-empty="false" @update:model-value="mpSim.navbar.railMode = $event as typeof mpSim.navbar.railMode" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "沉浸式返回圆钮", en: "Floating back button" }) }}</span><code class="mp-field__prop">MpBackButton</code></div>
      <ToggleSwitch v-model="mpSim.navbar.showBack" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "底栏未读角标", en: "Tab badges" }) }}</span><code class="mp-field__prop">items[].badge</code></div>
      <ToggleSwitch v-model="mpSim.navbar.showBadges" />
    </div>
  </MpDocPage>
</template>
