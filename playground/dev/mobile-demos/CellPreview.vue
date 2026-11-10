<script setup lang="ts">
import { ref } from "vue";
import { MpBadge, MpCell, MpCellGroup, MpIcon, MpNotice, MpPageHeader, MpSwitch, MpTag } from "@mango-write/ui-mp";
import { demoText } from "./content";
import { mpSim } from "./state";
import { t } from "../i18n";

const autoSync = ref(true);
</script>

<template>
  <main class="mp-preview__scroll mp-preview__pad">
    <MpPageHeader :title="t({ zh: '研究信息流', en: 'Research feed' })" :description="t({ zh: '标题与正文优先，元信息独立成行；折叠展开态自动双栏并排。', en: 'Titles and prose lead; expanded foldables auto-reflow into dual columns.' })" />
    <div class="mw-mp-split">
      <MpCellGroup :grouped="mpSim.cell.grouped" :title="t({ zh: '最近记录', en: 'Recent entries' })" extra="3">
        <MpCell :title="demoText.title" :subtitle="demoText.subtitle" :clickable="mpSim.cell.clickable" :arrow="mpSim.cell.arrow" :selected="mpSim.cell.selected" :selectable="mpSim.cell.selected" :disabled="mpSim.cell.disabled">
          <template v-if="mpSim.cell.showLead" #lead><MpIcon name="journal" :size="20" /></template>
          <template #meta><MpTag :label="t({ zh: '实验记录', en: 'Experiment' })" tone="info" /><span>10 min</span><MpBadge :value="3" /></template>
        </MpCell>
        <MpCell :title="t({ zh: '阅读 Attention Is All You Need', en: 'Reading Attention Is All You Need' })" :subtitle="t({ zh: '整理 RoPE 与 GQA 的显存占用对比。', en: 'Compare VRAM usage of RoPE and GQA.' })" :clickable="mpSim.cell.clickable" :arrow="mpSim.cell.arrow" />
      </MpCellGroup>
      <MpCellGroup :grouped="mpSim.cell.grouped" :title="t({ zh: '空间偏好与摘录', en: 'Space settings & excerpt' })">
        <MpCell :title="t({ zh: '自动同步批注', en: 'Auto-sync annotations' })" :disabled="mpSim.cell.disabled">
          <template #end><MpSwitch v-model="autoSync" :disabled="mpSim.cell.disabled" :aria-label="t({ zh: '自动同步批注', en: 'Auto-sync annotations' })" /></template>
        </MpCell>
        <MpNotice tone="primary" :title="t({ zh: '来源锚点', en: 'Provenance anchor' })">
          {{ t({ zh: '切换至 iPhone Duo 展开态时，主从分组自动转为双栏对照视图。', en: 'On iPhone Duo expanded viewports, groups reflow into a side-by-side split view.' }) }}
        </MpNotice>
      </MpCellGroup>
    </div>
  </main>
</template>
