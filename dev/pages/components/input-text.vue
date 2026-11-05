<script setup lang="ts">
import { ref } from "vue";
import { InputText } from "../../../src";
import { api } from "../../api/entries/input-text";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/input-text";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "短文本、一行能写完的值：草稿标题、团队名称、DOI。",
    en: "Short, single-line values: draft titles, team names, DOIs.",
  },
  rule2: {
    zh: "需要前后缀或图标时，外面套 <code>InputGroup</code> / <code>IconField</code>，不要在输入框里手写定位。",
    en: "For prefix/suffix or icons, wrap with <code>InputGroup</code> / <code>IconField</code>; don't hand-position inside the input.",
  },
  rule3: {
    zh: "多行内容（摘要、批注）用 <code>Textarea</code>；数值用 <code>InputNumber</code>。",
    en: "Multi-line content (abstracts, annotations) uses <code>Textarea</code>; numbers use <code>InputNumber</code>.",
  },
  rule4: {
    zh: "不用占位符代替标签：标签交给 <code>FormField</code> 常驻显示。",
    en: "Don't use placeholders as labels: keep a persistent label via <code>FormField</code>.",
  },
  surfaces: { zh: "底面", en: "Surfaces" },
  surfacesDesc: {
    zh: "纸面与霜面、浅色与深色并排。控件面是半透明叠层，放进弹出层不会出现实色块。",
    en: "Paper and frost, light and dark, side by side. The control surface is a translucent overlay—no solid blocks inside popups.",
  },
  demoTitle: { zh: "基于检索增强的综述写作流程", en: "A retrieval-augmented review workflow" },
  searchPlaceholder: { zh: "搜索文献、作者或 DOI", en: "Search sources, authors, or DOI" },
  sizes: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "xs / sm / md / lg 四档，默认跟随密度上下文（md）。高度、字号与内距由同一档位派生，与同档按钮对齐。",
    en: "xs / sm / md / lg, following the density context (md) by default. Height, font, and padding derive from the tier, aligned with same-tier buttons.",
  },
  citeKeyPlaceholder: { zh: "引用键，如 zhang2024", en: "Cite key, e.g. zhang2024" },
  smContainer: { zh: ".mw-size-sm 容器", en: ".mw-size-sm container" },
  followContainer: { zh: "不传 size，跟随容器", en: "No size—follows the container" },
  states: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "hover / 焦点请用指针与 Tab 键体验。只读保持文字完整可读，禁用才降级。",
    en: "Try hover and focus with a pointer and the Tab key. Readonly keeps text fully readable; only disabled degrades.",
  },
  colEmpty: { zh: "空", en: "Empty" },
  colFilled: { zh: "有值", en: "Filled" },
  colDisabled: { zh: "禁用", en: "Disabled" },
  colReadonly: { zh: "只读", en: "Readonly" },
  colInvalid: { zh: "错误", en: "Invalid" },
  draftTitle: { zh: "草稿标题", en: "Draft title" },
  weeklyReport: { zh: "课题组周报", en: "Research group weekly" },
  api: { zh: "接口", en: "API" },
} as const;

const title = ref(t(s.demoTitle));
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
        <InputText v-model="title" fluid />
        <InputText :placeholder="t(s.searchPlaceholder)" fluid />
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizes" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="size in (['xs', 'sm', 'md', 'lg'] as const)" :key="size" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ size }}</span>
          <InputText :size="size" :placeholder="t(s.citeKeyPlaceholder)" />
        </div>
        <div class="doc-row mw-size-sm">
          <span class="doc-note">{{ t(s.smContainer) }}</span>
          <InputText :placeholder="t(s.followContainer)" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.states" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colEmpty, s.colFilled, s.colDisabled, s.colReadonly, s.colInvalid]" label-width="56px">
          <StateRow label="md">
            <InputText :placeholder="t(s.draftTitle)" />
            <InputText :model-value="t(s.weeklyReport)" />
            <InputText :model-value="t(s.weeklyReport)" disabled />
            <InputText model-value="10.1000/xyz123" readonly />
            <InputText model-value="zhang 2024" invalid />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
