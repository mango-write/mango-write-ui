<script setup lang="ts">
import { MpBottomActionBar, MpButton, MpCell, MpComposer, MpIcon, MpNotice, MpPageHeader, MpSectionHeader } from "@mango-write/ui-mp";
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
        <div>
          <MpSectionHeader :title="t({ zh: '最近记录', en: 'Recent entries' })" meta="2" />
          <MpCell :title="demoText.title" :subtitle="demoText.subtitle" clickable arrow />
        </div>
        <MpNotice tone="primary" :title="t({ zh: '上下文摘要', en: 'Context summary' })">
          {{ mpSim.patterns.submitted || t({ zh: '已关联 3 篇文献片段与 1 份实验基线数据。', en: 'Linked 3 literature excerpts and 1 baseline run.' }) }}
        </MpNotice>
      </div>
    </main>
    <MpBottomActionBar v-if="mpSim.patterns.mode === 'action'" contained offset-bottom="0">
      <MpButton size="lg" block><MpIcon name="plus" :size="22" />{{ t({ zh: "记录新日志", en: "New journal entry" }) }}</MpButton>
    </MpBottomActionBar>
    <MpComposer v-else v-model="mpSim.patterns.message" contained offset-bottom="0" :placeholder="t({ zh: '围绕当前空间提问…', en: 'Ask about this space…' })" @submit="submit" />
  </div>
</template>
