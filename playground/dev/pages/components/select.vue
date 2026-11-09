<script setup lang="ts">
import { computed, ref } from "vue";
import { Select } from "@mango-write/ui-vue";
import { api } from "../../api/entries/select";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/select";

/* Select 直读字符串字段,候选数据按当前语言整体重建 */
const sourceType = ref<string | null>("journal");
const sourceTypes = computed(() => [
  { label: t({ zh: "期刊论文 (Journal Article)", en: "Journal article" }), value: "journal" },
  { label: t({ zh: "会议论文 (Conference Paper)", en: "Conference paper" }), value: "conference" },
  { label: t({ zh: "学位论文 (Thesis)", en: "Thesis" }), value: "thesis" },
  { label: t({ zh: "预印本 (Preprint)", en: "Preprint" }), value: "preprint" },
  { label: t({ zh: "专著章节 (Book Section)", en: "Book section" }), value: "book", disabled: true },
]);

const journal = ref<string | null>("nature");
const journals = [
  { label: "Nature", value: "nature", issn: "0028-0836" },
  { label: "Science", value: "science", issn: "0036-8075" },
  { label: "Cell", value: "cell", issn: "0092-8674" },
  { label: "PNAS", value: "pnas", issn: "0027-8424" },
  { label: "NeurIPS Proceedings", value: "neurips", issn: "1049-5258" },
  { label: "ICML Proceedings", value: "icml", issn: "2640-3498" },
  { label: "ACL Anthology", value: "acl", issn: "2307-387X" },
  { label: "IEEE TPAMI", value: "tpami", issn: "0162-8828" },
  { label: "Nature Machine Intelligence", value: "nmi", issn: "2522-5839" },
];

const customVenue = ref<string | null>("arXiv:2611.00421");

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "候选项在 5 个以上，或表单空间不足以平铺展示。",
    en: "More than five options, or not enough form space to lay them all out.",
  },
  rule2: {
    zh: "开启 <code>filter</code> 在弹出面板顶部提供筛选框；开启 <code>editable</code> 允许既可选预设又可手填。",
    en: "Turn on <code>filter</code> for a search box at the top of the panel; <code>editable</code> lets users pick a preset or type a custom value.",
  },
  rule3: {
    zh: "触发器宽度按最宽候选锁定（封顶 <code>--mw-select-fit-max</code>，默认 24rem），切换选择不漂移；覆写 <code>--mw-select-fit-text</code> 可关闭，或用 <code>fluid</code> 撑满容器。",
    en: "Trigger width locks to the widest option (capped at <code>--mw-select-fit-max</code>, default 24rem) so it does not shift when the selection changes; override <code>--mw-select-fit-text</code> to turn that off, or use <code>fluid</code> to fill the container.",
  },
  rule4: {
    zh: "若核心交互是「聚焦直接在框内打字过滤」，用更紧凑的 <code>SearchableSelect</code>。",
    en: "If the core interaction is focusing and typing to filter in place, use the more compact <code>SearchableSelect</code>.",
  },
  rule5: {
    zh: "仅 2–4 个短选项且用于视图/范围切换时，用 <code>SelectButton</code>。",
    en: "For 2–4 short options that switch views or ranges, use <code>SelectButton</code>.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。触发器在霜面上为半透明控件面，弹出列表始终挂在 body 的霜面浮层上。",
    en: "Paper and frost side by side. On frost the trigger becomes a translucent control surface, and the popup list always mounts on a body-level frost overlay.",
  },
  pickSourceType: { zh: "选择文献类型", en: "Choose a source type" },
  sourceTypeLabel: { zh: "文献类型", en: "Source type" },
  pickJournal: { zh: "选择目标期刊", en: "Choose a target journal" },
  journalLabel: { zh: "目标期刊", en: "Target journal" },
  filterJournals: { zh: "筛选期刊名称…", en: "Filter journals…" },
  variants: { zh: "变体", en: "Variants" },
  variantsDesc: {
    zh: "支持面板内搜索（filter）、一键清空（showClear）、自由编辑（editable）与自定义选项插槽（#option）。",
    en: "Panel search (filter), one-click clear (showClear), free-form entry (editable), and a custom option slot (#option).",
  },
  customSlotPh: { zh: "自定义选项插槽", en: "Custom option slot" },
  issnAria: { zh: "带 ISSN 的期刊选择", en: "Journal picker with ISSN" },
  venuePh: { zh: "可选择或直接输入发表来源", en: "Pick a venue or type your own" },
  editableAria: { zh: "可编辑来源", en: "Editable venue" },
  sizes: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "xs / sm / md / lg 四档，不传则跟随外层密度上下文。",
    en: "Four tiers, xs / sm / md / lg; follows the surrounding density context when omitted.",
  },
  sizeAria: { zh: "档下拉选择", en: "dropdown select" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "方向键上下导航、Enter 确认、Esc 关闭并归还焦点。",
    en: "Navigate with the arrow keys, confirm with Enter, and close with Esc — focus returns to the trigger.",
  },
  colEmpty: { zh: "未选占位", en: "Empty" },
  colClearable: { zh: "已选可清", en: "Clearable" },
  colLoading: { zh: "加载中", en: "Loading" },
  colReadonly: { zh: "只读", en: "Read-only" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colError: { zh: "错误", en: "Error" },
  pleaseSelect: { zh: "请选择…", en: "Select…" },
  loadingPh: { zh: "加载中…", en: "Loading…" },
  required: { zh: "必选项", en: "Required" },
  api: { zh: "接口", en: "API" },
} as const;
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.rule1)" />
        <li data-kind="do" v-html="t(s.rule2)" />
        <li data-kind="do" v-html="t(s.rule3)" />
        <li data-kind="dont" v-html="t(s.rule4)" />
        <li data-kind="dont" v-html="t(s.rule5)" />
      </ul>
    </DocSection>

    <DocSection :title="s.baseTitle" :desc="s.baseDesc">
      <Specimen :surfaces="['paper', 'frost']">
        <Select
          v-model="sourceType"
          :options="sourceTypes"
          option-label="label"
          option-value="value"
          option-disabled="disabled"
          :placeholder="t(s.pickSourceType)"
          :aria-label="t(s.sourceTypeLabel)"
        />
        <Select
          v-model="journal"
          :options="journals"
          option-label="label"
          option-value="value"
          filter
          show-clear
          :filter-placeholder="t(s.filterJournals)"
          :placeholder="t(s.pickJournal)"
          :aria-label="t(s.journalLabel)"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.variants" :desc="s.variantsDesc">
      <Specimen themes="single">
        <Select
          v-model="journal"
          :options="journals"
          option-label="label"
          option-value="value"
          filter
          show-clear
          :placeholder="t(s.customSlotPh)"
          :aria-label="t(s.issnAria)"
        >
          <template #option="{ option }">
            <span class="doc-row" style="justify-content: space-between; width: 100%; gap: var(--space-4)">
              <span>{{ option.label }}</span>
              <span class="doc-note">{{ option.issn }}</span>
            </span>
          </template>
        </Select>
        <Select
          v-model="customVenue"
          :options="journals"
          option-label="label"
          option-value="label"
          editable
          :placeholder="t(s.venuePh)"
          :aria-label="t(s.editableAria)"
        />
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizes" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="sz in (['xs', 'sm', 'md', 'lg'] as const)" :key="sz" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ sz }}</span>
          <Select
            v-model="sourceType"
            :size="sz"
            :options="sourceTypes"
            option-label="label"
            option-value="value"
            :aria-label="`${sz} ${t(s.sizeAria)}`"
          />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colEmpty, s.colClearable, s.colLoading, s.colReadonly, s.colDisabled, s.colError]" label-width="48px">
          <StateRow label="md">
            <Select :model-value="null" :options="sourceTypes" option-label="label" option-value="value" :placeholder="t(s.pleaseSelect)" :aria-label="t(s.colEmpty)" />
            <Select v-model="sourceType" :options="sourceTypes" option-label="label" option-value="value" show-clear :aria-label="t(s.colClearable)" />
            <Select :model-value="null" :options="sourceTypes" option-label="label" option-value="value" loading :placeholder="t(s.loadingPh)" :aria-label="t(s.colLoading)" />
            <Select v-model="sourceType" :options="sourceTypes" option-label="label" option-value="value" readonly :aria-label="t(s.colReadonly)" />
            <Select v-model="sourceType" :options="sourceTypes" option-label="label" option-value="value" disabled :aria-label="t(s.colDisabled)" />
            <Select :model-value="null" :options="sourceTypes" option-label="label" option-value="value" invalid :placeholder="t(s.required)" :aria-label="t(s.colError)" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
