<script setup lang="ts">
import { computed } from "vue";
import { SelectButton } from "@mango-write/ui-vue";
import MpDocPage from "../../kit/MpDocPage.vue";
import { mobileApi } from "../../mobile-demos/api";
import { mpSim } from "../../mobile-demos/state";
import { t } from "../../i18n";

const options = computed(() => [
  { label: t({ zh: "底部主操作栏 BottomActionBar", en: "BottomActionBar" }), value: "action" },
  { label: t({ zh: "提问输入栏 Composer", en: "Composer" }), value: "composer" },
]);
const code = computed(() =>
  mpSim.patterns.mode === "action"
    ? t({
        zh: `<MpBottomActionBar>
  <MpButton size="lg" block label="记录新日志" />
</MpBottomActionBar>`,
        en: `<MpBottomActionBar>
  <MpButton size="lg" block label="New journal entry" />
</MpBottomActionBar>`,
      })
    : t({
        zh: `<MpComposer v-model="message" placeholder="围绕当前空间提问…" @submit="ask" />`,
        en: `<MpComposer v-model="message" placeholder="Ask about this space…" @submit="ask" />`,
      }),
);
</script>

<template>
  <MpDocPage slug="patterns" :code="code" :api="mobileApi.patterns" :guidelines="[
    { kind: 'do', zh: '<strong>底部动作区</strong>（MpBottomActionBar / MpComposer）：固定在拇指热区底部，折叠展开态下自动居中限宽 520px。', en: '<strong>Bottom action zone</strong> (MpBottomActionBar / MpComposer): anchored in the thumb zone and auto-centered to 520px on expanded foldables.' },
    { kind: 'do', zh: '<strong>结构组合</strong>（MpPageHeader + MpSectionHeader）：统一页面大标题与分组小标题节奏，业务页不手写重复样式。', en: '<strong>Structural composition</strong> (MpPageHeader + MpSectionHeader): standardizes page and section headings across views.' },
    { kind: 'dont', zh: '不在 Composer 组件内部耦合具体业务 API 请求；通过 @submit 事件向上抛出。', en: 'Never couple business API calls inside MpComposer; emit @submit to the parent view.' },
  ]">
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "底部栏模式", en: "Bottom bar mode" }) }}</span><code class="mp-field__prop">component</code></div>
      <SelectButton size="sm" :model-value="mpSim.patterns.mode" :options="options" option-label="label" option-value="value" :allow-empty="false" @update:model-value="mpSim.patterns.mode = $event as typeof mpSim.patterns.mode" />
    </div>
  </MpDocPage>
</template>
