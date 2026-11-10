<script setup lang="ts">
import { computed } from "vue";
import { ToggleSwitch } from "@mango-write/ui-vue";
import MpDocPage from "../../kit/MpDocPage.vue";
import { mobileApi } from "../../mobile-demos/api";
import { mpSim } from "../../mobile-demos/state";
import { t } from "../../i18n";

const code = computed(() =>
  t({
    zh: `<MpCellGroup${mpSim.cell.grouped ? " grouped" : ""} title="最近记录">
  <MpCell title="长文档证据召回实验" subtitle="ColBERTv2 重排提升召回率。"${mpSim.cell.clickable ? " clickable" : ""}${mpSim.cell.arrow ? " arrow" : ""}>
    <template #meta><MpTag label="实验记录" tone="info" /></template>
  </MpCell>
</MpCellGroup>`,
    en: `<MpCellGroup${mpSim.cell.grouped ? " grouped" : ""} title="Recent entries">
  <MpCell title="Long-document evidence retrieval" subtitle="ColBERTv2 reranking improves recall."${mpSim.cell.clickable ? " clickable" : ""}${mpSim.cell.arrow ? " arrow" : ""}>
    <template #meta><MpTag label="Experiment" tone="info" /></template>
  </MpCell>
</MpCellGroup>`,
  }),
);
const fields = [
  { key: "grouped", label: { zh: "圆角卡片分组", en: "Grouped card" }, prop: "grouped" },
  { key: "showLead", label: { zh: "前置图标", en: "Leading icon" }, prop: "#lead" },
  { key: "clickable", label: { zh: "可点击反馈", en: "Clickable" }, prop: "clickable" },
  { key: "arrow", label: { zh: "右侧导向箭头", en: "Trailing arrow" }, prop: "arrow" },
  { key: "selected", label: { zh: "选中状态", en: "Selected" }, prop: "selected" },
  { key: "disabled", label: { zh: "禁用状态", en: "Disabled" }, prop: "disabled" },
] as const;
</script>

<template>
  <MpDocPage slug="cell" :code="code" :api="mobileApi.cell" :guidelines="[
    { kind: 'do', zh: '<strong>通栏信息流</strong>：科研日志与文献列表默认使用通栏分隔；设置项等短行分组才开启 grouped 圆角纸卡。', en: '<strong>Flush content feed</strong>: use flush dividers for research feeds; reserve grouped cards for short settings rows.' },
    { kind: 'do', zh: '<strong>折叠屏双栏自适应</strong>：使用 .mw-mp-split 包裹主从分组，在 iPhone Duo 与 Pura X 横屏下自动升维为双栏对照。', en: '<strong>Foldable split view</strong>: wrap groups in .mw-mp-split to auto-reflow into dual columns on expanded foldables.' },
    { kind: 'dont', zh: '不在单行右侧同时堆叠徽标、开关与长文本；行内布尔开关统一使用 MpSwitch。', en: 'Do not stack badges, switches, and long text in the trailing slot at once; use MpSwitch for boolean toggles.' },
  ]">
    <div v-for="field in fields" :key="field.key" class="mp-field">
      <div class="mp-field__head">
        <span class="mp-field__label">{{ t(field.label) }}</span>
        <code class="mp-field__prop">{{ field.prop }}</code>
      </div>
      <ToggleSwitch v-model="mpSim.cell[field.key]" />
    </div>
  </MpDocPage>
</template>
