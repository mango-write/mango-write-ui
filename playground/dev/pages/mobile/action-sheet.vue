<script setup lang="ts">
import { computed } from "vue";
import { ToggleSwitch } from "@mango-write/ui-vue";
import MpDocPage from "../../kit/MpDocPage.vue";
import { mobileApi } from "../../mobile-demos/api";
import { mpSim } from "../../mobile-demos/state";
import { t } from "../../i18n";

const code = computed(() =>
  t({
    zh: `<MpActionSheet v-model:open="open" title="对该记录执行操作" :options="[
  { value: 'share', label: '分享至课题组' },
  { value: 'delete', label: '删除记录', danger: true },
]" @select="onSelect" />`,
    en: `<MpActionSheet v-model:open="open" title="Actions for this entry" :options="[
  { value: 'share', label: 'Share with team' },
  { value: 'delete', label: 'Delete entry', danger: true },
]" @select="onSelect" />`,
  }),
);
</script>

<template>
  <MpDocPage slug="action-sheet" :code="code" :api="mobileApi['action-sheet']" :guidelines="[
    { kind: 'do', zh: '<strong>上下文命令面板</strong>（MpActionSheet）：只呈现一次性动作（如分享、导出、删除），点击后触发 @select 并自动收起。', en: '<strong>Contextual command sheet</strong> (MpActionSheet): presents one-shot commands and closes upon selection.' },
    { kind: 'do', zh: '<strong>危险动作防护</strong>：破坏性操作设置 danger: true 渲染危险语义色，并在点击后衔接确认弹窗。', en: '<strong>Destructive action guard</strong>: mark destructive items with danger: true and follow up with confirmation.' },
    { kind: 'dont', zh: '不用 MpActionSheet 承担状态单选（单选请用 MpSelectSheet）。', en: 'Do not use MpActionSheet for persistent single selection (use MpSelectSheet instead).' },
  ]">
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "打开动作面板", en: "Open sheet" }) }}</span><code class="mp-field__prop">v-model:open</code></div>
      <ToggleSwitch v-model="mpSim.actionSheet.open" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "包含危险动作", en: "Danger option" }) }}</span><code class="mp-field__prop">options[].danger</code></div>
      <ToggleSwitch v-model="mpSim.actionSheet.hasDanger" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "禁用分享项", en: "Disabled option" }) }}</span><code class="mp-field__prop">options[].disabled</code></div>
      <ToggleSwitch v-model="mpSim.actionSheet.disabledShare" />
    </div>
  </MpDocPage>
</template>
