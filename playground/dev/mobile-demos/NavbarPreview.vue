<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  MpBackButton,
  MpButton,
  MpCell,
  MpCellGroup,
  MpComposer,
  MpFilterChip,
  MpIcon,
  MpPageHeader,
  MpSearchBar,
  MpTabBar,
} from "@mango-write/ui-mp";
import { demoText } from "./content";
import { mpSim } from "./state";
import { t } from "../i18n";

const activeTab = ref("journal");
const hasActionSlot = ref(mpSim.navbar.railMode !== "tabs");

watch(
  () => mpSim.navbar.railMode,
  (mode) => {
    if (mode === "split") hasActionSlot.value = true;
    else if (mode === "tabs") hasActionSlot.value = false;
  },
);
const tabs = computed(() => [
  { id: "journal", label: demoText.value.journal, icon: "journal" as const, badge: mpSim.navbar.showBadges ? 3 : undefined },
  { id: "library", label: demoText.value.library, icon: "library" as const },
  { id: "assistant", label: demoText.value.assistant, icon: "assistant" as const },
]);

function onSelectTab(id: string): void {
  activeTab.value = id;
  if (id === "assistant") mpSim.navbar.railMode = "composer";
  else if (id === "journal" && mpSim.navbar.railMode === "composer") mpSim.navbar.railMode = "split";
}
</script>

<template>
  <div class="mp-stage">
    <MpBackButton v-if="mpSim.navbar.showBack" contained :aria-label="t({ zh: '返回上级', en: 'Back' })" />
    <main class="mp-preview__scroll mp-preview__pad">
      <MpPageHeader
        :title="mpSim.navbar.railMode === 'composer' ? demoText.assistant : demoText.journal"
        :description="t({ zh: '唯一微信原生顶栏；底部单轨悬浮霜面胶囊。', en: 'Single native WeChat top bar; single floating frost rail below.' })"
        :capsule-safe="mpSim.navbar.showBack"
      >
        <template v-if="!mpSim.navbar.showBack" #eyebrow>
          <MpFilterChip :label="demoText.space" selected />
        </template>
      </MpPageHeader>
      <MpSearchBar model-value="" :placeholder="t({ zh: '搜索当前空间', en: 'Search current space' })" />
      <MpCellGroup grouped>
        <MpCell :title="demoText.title" :subtitle="demoText.subtitle" clickable arrow />
      </MpCellGroup>
    </main>
    <MpTabBar
      :model-value="activeTab"
      :collapsed="mpSim.navbar.railMode === 'composer'"
      :items="tabs"
      contained
      @update:model-value="onSelectTab"
      @update:collapsed="mpSim.navbar.railMode = $event ? 'composer' : (hasActionSlot ? 'split' : 'tabs')"
    >
      <template v-if="hasActionSlot" #action>
        <MpButton size="lg" icon-only :aria-label="t({ zh: '记录新日志', en: 'New entry' })" @click="mpSim.navbar.railMode = 'composer'">
          <MpIcon name="plus" :size="22" />
        </MpButton>
      </template>
      <template #composer>
        <MpComposer
          v-model="mpSim.navbar.message"
          inline
          :placeholder="t({ zh: '围绕当前空间提问…', en: 'Ask about this space…' })"
          @submit="mpSim.navbar.message = ''"
        />
      </template>
    </MpTabBar>
  </div>
</template>
