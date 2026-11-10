<script setup lang="ts">
import { MpButton, MpEmpty, MpLoading } from "@mango-write/ui-mp";
import { mpSim } from "./state";
import { t } from "../i18n";
</script>

<template>
  <main class="mp-preview__scroll mp-preview__pad mp-preview__center">
    <MpLoading v-if="mpSim.empty.status === 'loading'" :label="t({ zh: '正在整理研究记录…', en: 'Organizing research entries…' })" />
    <MpEmpty v-else :status="mpSim.empty.status" :title="mpSim.empty.status === 'error' ? t({ zh: '记录暂时无法加载', en: 'Entries could not load' }) : t({ zh: '当前空间暂无记录', en: 'No entries in this space' })" :hint="t({ zh: '可以清除筛选，或写下第一条研究记录。', en: 'Clear filters or write your first research entry.' })">
      <template v-if="mpSim.empty.showAction" #action>
        <MpButton size="sm" :label="mpSim.empty.status === 'error' ? t({ zh: '重新加载', en: 'Retry' }) : t({ zh: '新建记录', en: 'Create entry' })" />
      </template>
    </MpEmpty>
  </main>
</template>
