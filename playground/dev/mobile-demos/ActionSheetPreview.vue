<script setup lang="ts">
import { computed } from "vue";
import { MpActionSheet, MpButton, MpCell, MpNotice, MpPageHeader } from "@mango-write/ui-mp";
import { demoText } from "./content";
import { mpSim } from "./state";
import { t } from "../i18n";

const options = computed(() => [
  { value: "share", label: t({ zh: "分享至课题组", en: "Share to team" }), subtitle: t({ zh: "成员可查看并批注", en: "Members can view and annotate" }), disabled: mpSim.actionSheet.disabledShare },
  { value: "export", label: t({ zh: "导出 Markdown", en: "Export Markdown" }) },
  ...(mpSim.actionSheet.hasDanger ? [{ value: "delete", label: t({ zh: "删除记录", en: "Delete entry" }), danger: true }] : []),
]);
</script>

<template>
  <div class="mp-stage">
    <main class="mp-preview__scroll mp-preview__pad">
      <MpPageHeader :title="t({ zh: '条目动作', en: 'Item actions' })" :description="t({ zh: '动作菜单与单选选择器是两个独立语义。', en: 'Action menus and single-select sheets have distinct semantics.' })" />
      <MpCell :title="demoText.title" :subtitle="demoText.subtitle" clickable arrow @click="mpSim.actionSheet.open = true" />
      <MpNotice tone="warning" :title="t({ zh: '危险动作需要明确确认', en: 'Destructive actions need explicit confirmation' })">{{ t({ zh: '菜单只呈现动作，不代替最终确认。', en: 'The menu presents actions; it does not replace final confirmation.' }) }}</MpNotice>
      <MpButton block :label="t({ zh: '打开动作菜单', en: 'Open action menu' })" @click="mpSim.actionSheet.open = true" />
    </main>
    <MpActionSheet v-model:open="mpSim.actionSheet.open" contained :title="t({ zh: '对该记录执行操作', en: 'Actions for this entry' })" :options="options" />
  </div>
</template>
