<script setup lang="ts">
import { AlignLeft, Columns2, LayoutList } from "lucide-vue-next";
import { computed, ref } from "vue";
import { SelectButton } from "../../../src";
import { api } from "../../api/entries/select-button";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/select-button";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "切换同一内容的视图或范围：「我的 / 团队 / 全部」「列表 / 对照」。",
    en: "Switching views or scopes of the same content: “Mine / Team / All”, “List / Split”.",
  },
  rule2: {
    zh: "选项少且短，全部同时可见；可多选（<code>multiple</code>）做轻量筛选。",
    en: "Few, short options all visible at once; enable <code>multiple</code> for lightweight filtering.",
  },
  rule3: {
    zh: "切换的是不同页面内容时用 <code>Tabs</code>；选项多于 5 个用 <code>Select</code>。",
    en: "Use <code>Tabs</code> to switch between different page content; use <code>Select</code> for more than 5 options.",
  },
  rule4: {
    zh: "不用它触发动作；它只表达「当前选中什么」。",
    en: "Don't trigger actions with it; it only expresses “what is currently selected”.",
  },
  surfaces: { zh: "底面", en: "Surfaces" },
  surfacesDesc: {
    zh: "纸面与霜面并排。深色下选中段改用 --fill-strong，避免近乎透明。",
    en: "Paper and frost side by side. In dark themes the selected segment switches to --fill-strong to avoid near-transparency.",
  },
  libraryScope: { zh: "文库范围", en: "Library scope" },
  readingView: { zh: "阅读视图", en: "Reading view" },
  mine: { zh: "我的", en: "Mine" },
  team: { zh: "团队", en: "Team" },
  all: { zh: "全部", en: "All" },
  list: { zh: "列表", en: "List" },
  split: { zh: "对照", en: "Split" },
  prose: { zh: "正文", en: "Prose" },
  note: { zh: "批注", en: "Note" },
  highlight: { zh: "划线", en: "Highlight" },
  cite: { zh: "引用", en: "Cite" },
  draft: { zh: "草稿", en: "Draft" },
  published: { zh: "已发布", en: "Published" },
  archived: { zh: "归档", en: "Archived" },
  sizes: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "xs / sm / md / lg，默认跟随密度上下文。轨道圆角 --control-radius，段圆角 = 轨道圆角 − 轨道内边距（同心）。",
    en: "xs / sm / md / lg, following the density context by default. Track radius --control-radius; segment radius = track radius − track padding (concentric).",
  },
  tierScope: { zh: "档范围", en: "scope" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "方向键在段之间移动焦点；焦点为品牌色外环。",
    en: "Arrow keys move focus between segments; focus is a brand-color ring.",
  },
  colDefault: { zh: "默认", en: "Default" },
  colMultiple: { zh: "多选", en: "Multiple" },
  colItemDisabled: { zh: "单项禁用", en: "Item disabled" },
  colGroupDisabled: { zh: "整组禁用", en: "All disabled" },
  colInvalid: { zh: "错误", en: "Invalid" },
  api: { zh: "接口", en: "API" },
} as const;

const scope = ref("mine");
const scopes = computed(() => [
  { label: t(s.mine), value: "mine" },
  { label: t(s.team), value: "team" },
  { label: t(s.all), value: "all" },
]);
const view = ref("list");
const views = computed(() => [
  { label: t(s.list), value: "list", icon: LayoutList },
  { label: t(s.split), value: "split", icon: Columns2 },
  { label: t(s.prose), value: "prose", icon: AlignLeft },
]);
const marks = ref<string[]>(["note"]);
const markOptions = computed(() => [
  { label: t(s.note), value: "note" },
  { label: t(s.highlight), value: "highlight" },
  { label: t(s.cite), value: "cite" },
]);
const withDisabled = computed(() => [
  { label: t(s.draft), value: "draft" },
  { label: t(s.published), value: "published" },
  { label: t(s.archived), value: "archived", disabled: true },
]);
const status = ref("draft");
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
        <li data-kind="dont" v-html="t(s.rule3)" />
        <li data-kind="dont" v-html="t(s.rule4)" />
      </ul>
    </DocSection>

    <DocSection :title="s.surfaces" :desc="s.surfacesDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <SelectButton v-model="scope" :options="scopes" option-label="label" option-value="value" :aria-label="t(s.libraryScope)" :allow-empty="false" />
        <SelectButton v-model="view" :options="views" option-label="label" option-value="value" :aria-label="t(s.readingView)" :allow-empty="false">
          <template #option="{ option }">
            <component :is="option.icon" />
            <span>{{ option.label }}</span>
          </template>
        </SelectButton>
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizes" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="size in (['xs', 'sm', 'md', 'lg'] as const)" :key="size" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ size }}</span>
          <SelectButton v-model="scope" :size="size" :options="scopes" option-label="label" option-value="value" :aria-label="`${size} ${t(s.tierScope)}`" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colDefault, s.colMultiple, s.colItemDisabled, s.colGroupDisabled, s.colInvalid]" label-width="40px">
          <StateRow label="md">
            <SelectButton v-model="scope" :options="scopes" option-label="label" option-value="value" :aria-label="t(s.colDefault)" />
            <SelectButton v-model="marks" multiple :options="markOptions" option-label="label" option-value="value" :aria-label="t(s.colMultiple)" />
            <SelectButton v-model="status" :options="withDisabled" option-label="label" option-value="value" :aria-label="t(s.colItemDisabled)" />
            <SelectButton v-model="scope" :options="scopes" option-label="label" option-value="value" disabled :aria-label="t(s.colGroupDisabled)" />
            <SelectButton :model-value="null" :options="scopes" option-label="label" option-value="value" invalid :aria-label="t(s.colInvalid)" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
