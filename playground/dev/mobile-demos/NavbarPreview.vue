<script setup lang="ts">
import { computed } from "vue";
import { MpCell, MpNavBar, MpPageHeader, MpSearchBar, MpTabBar } from "@mango-write/ui-mp";
import { demoText } from "./content";
import { mpSim } from "./state";
import { t } from "../i18n";

const tabs = computed(() => [
  { id: "journal", label: demoText.value.journal, icon: "journal" as const, badge: mpSim.navbar.showBadges ? 3 : undefined },
  { id: "library", label: demoText.value.library, icon: "library" as const },
  { id: "assistant", label: demoText.value.assistant, icon: "assistant" as const },
]);
</script>

<template>
  <div class="mp-stage">
    <MpNavBar :title="mpSim.navbar.showBack ? demoText.journal : undefined" :show-back="mpSim.navbar.showBack" :capsule-safe="mpSim.navbar.capsuleSafe">
      <template v-if="!mpSim.navbar.showBack" #leading>
        <button type="button" class="mw-mp-navbar__leading-action"><span>{{ demoText.space }}</span></button>
      </template>
    </MpNavBar>
    <main class="mp-preview__scroll mp-preview__pad">
      <MpPageHeader :title="demoText.journal" :description="t({ zh: '导航退后，内容向前。', en: 'Navigation recedes; content leads.' })" />
      <MpSearchBar model-value="" :placeholder="t({ zh: '搜索当前空间', en: 'Search current space' })" />
      <MpCell :title="demoText.title" :subtitle="demoText.subtitle" clickable arrow />
    </main>
    <MpTabBar model-value="journal" :items="tabs" contained />
  </div>
</template>
