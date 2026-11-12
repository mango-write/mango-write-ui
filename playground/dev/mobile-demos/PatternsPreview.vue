<script setup lang="ts">
import { MpBottomActionBar, MpButton, MpCell, MpCellGroup, MpComposer, MpIcon, MpNotice, MpPageHeader } from "@mango-write/ui-mp";
import { demoText } from "./content";
import { mpSim } from "./state";
import { t } from "../i18n";

function submit(value: string): void {
  mpSim.patterns.submitted = value;
  mpSim.patterns.message = "";
}
</script>

<template>
  <div class="mp-stage">
    <main class="mp-preview__scroll mp-preview__pad mp-preview__with-action">
      <MpPageHeader :title="mpSim.patterns.mode === 'action' ? demoText.journal : demoText.assistant" :description="t({ zh: '公共模式组合成真实任务；折叠展开态下底部动作条自动居中限宽。', en: 'Shared patterns form real tasks; bottom bars center and cap width on expanded foldables.' })" />
      <div class="mw-mp-split">
        <MpCellGroup :title="t({ zh: '最近记录', en: 'Recent entries' })" extra="2">
          <MpCell :title="demoText.title" :subtitle="demoText.subtitle" clickable arrow />
        </MpCellGroup>
        <MpNotice severity="primary" :title="t({ zh: '上下文摘要', en: 'Context summary' })">
          {{ mpSim.patterns.submitted || t({ zh: '已关联 3 篇文献片段与 1 份实验基线数据。', en: 'Linked 3 literature excerpts and 1 baseline run.' }) }}
        </MpNotice>
      </div>
    </main>
    <MpBottomActionBar v-if="mpSim.patterns.mode === 'action'" contained>
      <MpButton size="lg" fluid><MpIcon name="plus" :size="22" />{{ t({ zh: "记录新日志", en: "New journal entry" }) }}</MpButton>
    </MpBottomActionBar>
    <MpComposer v-else v-model="mpSim.patterns.message" contained :placeholder="t({ zh: '围绕当前空间提问…', en: 'Ask about this space…' })" @submit="submit" />
  </div>
</template>
