<script setup lang="ts">
import { computed, ref } from "vue";
import { MpButton, MpCell, MpCellGroup, MpNotice, MpPageHeader, MpSelectSheet, MpSheet, MpTextarea } from "@mango-write/ui-mp";
import { demoText } from "./content";
import { mpSim } from "./state";
import { t } from "../i18n";

const space = ref("personal");
const spaces = computed(() => [
  { value: "personal", label: t({ zh: "个人空间", en: "Personal Space" }), subtitle: t({ zh: "私有记录与文献", en: "Private entries and papers" }) },
  { value: "nlp", label: "NLP", subtitle: t({ zh: "团队 · 8 位成员", en: "Team · 8 members" }) },
]);
</script>

<template>
  <div class="mp-stage">
    <main class="mp-preview__scroll mp-preview__pad">
      <MpPageHeader :title="t({ zh: '底部浮层', en: 'Bottom sheets' })" :description="t({ zh: '轻量详情和单选使用 Sheet，长文编辑仍走独立页面。', en: 'Sheets handle lightweight details and selection; long editing gets a full page.' })" />
      <div class="mp-preview__stack">
        <MpButton fluid :label="t({ zh: '查看文献详情', en: 'View paper details' })" @click="mpSim.sheet.open = true" />
        <MpButton fluid variant="tinted" severity="secondary" :label="t({ zh: '选择工作空间', en: 'Select space' })" @click="mpSim.sheet.selectOpen = true" />
      </div>
      <MpCellGroup>
        <MpCell :title="demoText.title" :subtitle="demoText.subtitle" clickable arrow @click="mpSim.sheet.open = true" />
      </MpCellGroup>
    </main>
    <MpSheet v-model:open="mpSim.sheet.open" contained :title="t({ zh: '文献详情', en: 'Paper details' })" subtitle="ICLR 2024">
      <MpNotice icon="quote" severity="primary" :title="demoText.title">{{ demoText.subtitle }}</MpNotice>
      <MpTextarea :model-value="t({ zh: '保留来源的文献摘录', en: 'Literature excerpt with source preserved' })" :maxlength="300" />
      <template v-if="mpSim.sheet.showFooter" #footer>
        <MpButton variant="tinted" severity="secondary" :label="t({ zh: '取消', en: 'Cancel' })" @click="mpSim.sheet.open = false" />
        <MpButton :label="t({ zh: '摘录到日志', en: 'Cite to journal' })" @click="mpSim.sheet.open = false" />
      </template>
    </MpSheet>
    <MpSelectSheet v-model:open="mpSim.sheet.selectOpen" v-model="space" contained :title="t({ zh: '选择工作空间', en: 'Select space' })" :options="spaces" />
  </div>
</template>
