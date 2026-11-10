<script setup lang="ts">
import { computed } from "vue";
import { ToggleSwitch } from "@mango-write/ui-vue";
import MpDocPage from "../../kit/MpDocPage.vue";
import { mobileApi } from "../../mobile-demos/api";
import { mpSim } from "../../mobile-demos/state";
import { t } from "../../i18n";

const code = computed(() =>
  t({
    zh: `<MpNavBar ${mpSim.navbar.showBack ? 'title="科研日志" show-back' : ':capsule-safe="true"'}>
  <template #leading><!-- 空间入口或返回 --></template>
</MpNavBar>
<MpTabBar v-model="active" :items="items" />`,
    en: `<MpNavBar ${mpSim.navbar.showBack ? 'title="Research log" show-back' : ':capsule-safe="true"'}>
  <template #leading><!-- Space switcher or back --></template>
</MpNavBar>
<MpTabBar v-model="active" :items="items" />`,
  }),
);
</script>

<template>
  <MpDocPage slug="navbar" :code="code" :api="mobileApi.navbar" :guidelines="[
    { kind: 'do', zh: '<strong>顶栏</strong>（MpNavBar）：只承载返回按钮、空间切换或当前页面标题；横屏态自动收敛为 38px 净高。', en: '<strong>Top bar</strong> (MpNavBar): carries back navigation, space switcher, or page title; compacts to 38px in landscape.' },
    { kind: 'do', zh: '<strong>底栏</strong>（MpTabBar）：承载 3–4 个一级目的地，横屏态图标与文字自动转为水平并排。', en: '<strong>Bottom bar</strong> (MpTabBar): 3–4 top-level destinations; icons and labels align inline in landscape.' },
    { kind: 'dont', zh: '不把低频设置项挤入顶栏；无真实未读通知时不展示红色数字角标。', en: 'Do not crowd low-frequency settings into the navbar; only show badges for real unread notifications.' },
  ]">
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "显示返回按钮", en: "Back button" }) }}</span><code class="mp-field__prop">showBack</code></div>
      <ToggleSwitch v-model="mpSim.navbar.showBack" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "预留胶囊安全区", en: "Capsule safe area" }) }}</span><code class="mp-field__prop">capsuleSafe</code></div>
      <ToggleSwitch v-model="mpSim.navbar.capsuleSafe" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "底栏未读角标", en: "Tab badges" }) }}</span><code class="mp-field__prop">items[].badge</code></div>
      <ToggleSwitch v-model="mpSim.navbar.showBadges" />
    </div>
  </MpDocPage>
</template>
