<script setup lang="ts">
import { watch } from "vue";
import {
  MpButton,
  MpConfirmHost,
  MpMessage,
  MpNotice,
  MpPageHeader,
  MpToastHost,
  useMpConfirm,
  useMpNotify,
} from "@mango-write/ui-mp";
import { mpSim } from "./state";
import { t } from "../i18n";

const confirm = useMpConfirm();
const notify = useMpNotify();
async function openConfirm(): Promise<void> {
  await confirm.ask({
    title: t({ zh: "删除这条研究记录？", en: "Delete this research entry?" }),
    message: t({ zh: "此操作无法撤销，文献来源仍保留在文库。", en: "This cannot be undone. The source remains in the library." }),
    acceptLabel: t({ zh: "删除", en: "Delete" }),
    rejectLabel: t({ zh: "保留", en: "Keep" }),
    danger: mpSim.feedback.danger,
  });
}
function showToast(): void {
  notify[mpSim.feedback.toastTone](mpSim.feedback.toastMessage, t({ zh: "来源与空间上下文已保留", en: "Source and space context preserved" }));
}
watch(() => mpSim.feedback.confirmTick, (value) => { if (value > 0) void openConfirm(); });
watch(() => mpSim.feedback.toastTick, (value) => { if (value > 0) showToast(); });
</script>

<template>
  <div class="mp-stage">
    <main class="mp-preview__scroll mp-preview__pad">
      <MpPageHeader :title="t({ zh: '反馈与对话', en: 'Messages' })" :description="t({ zh: '反馈不抢焦点，也不遮挡主操作。', en: 'Feedback preserves focus and avoids primary actions.' })" />
      <div class="mp-preview__stack">
        <MpButton fluid :variant="mpSim.feedback.danger ? 'tinted' : 'filled'" :severity="mpSim.feedback.danger ? 'danger' : 'primary'" :label="t({ zh: '打开确认框', en: 'Open confirmation' })" @click="openConfirm" />
        <MpButton fluid :label="t({ zh: '显示最新通知', en: 'Show latest toast' })" @click="showToast" />
      </div>
      <MpNotice severity="success" :title="t({ zh: '来源已保留', en: 'Source preserved' })">{{ t({ zh: '文献标题和 DOI 会随摘录进入日志。', en: 'Paper title and DOI travel with the excerpt.' }) }}</MpNotice>
      <div class="mp-preview__conversation">
        <MpMessage from="user" :text="t({ zh: '总结最近的实验结论', en: 'Summarize recent experiment results' })" />
        <MpMessage from="assistant" label="MANGO AI" :text="t({ zh: '重排提升了证据召回率，但仍需核验原始实验设置。', en: 'Reranking improved evidence recall, but the original setup still needs verification.' })" />
      </div>
    </main>
    <MpConfirmHost contained />
    <MpToastHost contained />
  </div>
</template>
