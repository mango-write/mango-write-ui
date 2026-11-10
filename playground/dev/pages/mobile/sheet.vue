<script setup lang="ts">
import { computed } from "vue";
import { ToggleSwitch } from "@mango-write/ui-vue";
import MpDocPage from "../../kit/MpDocPage.vue";
import { mobileApi } from "../../mobile-demos/api";
import { mpSim } from "../../mobile-demos/state";
import { t } from "../../i18n";

const code = computed(() =>
  t({
    zh: `<MpSheet v-model:open="open" title="文献详情">
  <article>标题、作者、DOI 与来源说明</article>
  <template #footer><MpButton label="摘录到日志" /></template>
</MpSheet>
<MpSelectSheet v-model:open="selectOpen" v-model="space" :options="spaces" />`,
    en: `<MpSheet v-model:open="open" title="Paper details">
  <article>Title, authors, DOI, and provenance</article>
  <template #footer><MpButton label="Save excerpt to log" /></template>
</MpSheet>
<MpSelectSheet v-model:open="selectOpen" v-model="space" :options="spaces" />`,
  }),
);
</script>

<template>
  <MpDocPage slug="sheet" :code="code" :api="mobileApi.sheet" :guidelines="[
    { kind: 'do', zh: '<strong>轻量详情抽屉</strong>（MpSheet）：承载文献详情、快速筛选或短表单；折叠展开态（iPhone Duo）自动居中限宽 480px，短阔屏（Pura X）自动限制 78% 最大高度。', en: '<strong>Lightweight sheet</strong> (MpSheet): for paper details, quick filters, or short forms; auto-centers to 480px on expanded foldables and caps at 78% height on wide-short screens.' },
    { kind: 'do', zh: '<strong>单选抽屉</strong>（MpSelectSheet）：拥有明确的 v-model 单选值与选中勾选态。', en: '<strong>Single-select sheet</strong> (MpSelectSheet): owns an explicit v-model selection state.' },
    { kind: 'dont', zh: '不在 Sheet 中嵌套长篇富文本编辑器；长文写作应进入独立全屏页面。', en: 'Never embed long-form rich-text editors inside a sheet; use a dedicated full-screen page.' },
  ]">
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "打开详情抽屉", en: "Open detail sheet" }) }}</span><code class="mp-field__prop">v-model:open</code></div>
      <ToggleSwitch v-model="mpSim.sheet.open" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "打开单选抽屉", en: "Open select sheet" }) }}</span><code class="mp-field__prop">MpSelectSheet</code></div>
      <ToggleSwitch v-model="mpSim.sheet.selectOpen" />
    </div>
    <div class="mp-field">
      <div class="mp-field__head"><span class="mp-field__label">{{ t({ zh: "底部操作区", en: "Footer slot" }) }}</span><code class="mp-field__prop">#footer</code></div>
      <ToggleSwitch v-model="mpSim.sheet.showFooter" />
    </div>
  </MpDocPage>
</template>
