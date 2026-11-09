<script setup lang="ts">
import { Badge } from "@mango-write/ui-vue";
import { api } from "../../api/entries/badge";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/badge";

const severities = [
  { label: { zh: "主色", en: "Primary" }, value: "primary" },
  { label: { zh: "次要", en: "Secondary" }, value: "secondary" },
  { label: { zh: "成功", en: "Success" }, value: "success" },
  { label: { zh: "信息", en: "Info" }, value: "info" },
  { label: { zh: "警告", en: "Warning" }, value: "warning" },
  { label: { zh: "危险", en: "Danger" }, value: "danger" },
  { label: { zh: "反色", en: "Contrast" }, value: "contrast" },
] as const;

const sizes = ["xs", "sm", "md", "lg"] as const;

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "展示简洁的数字计数（如未读批注数、待确认引用数）或无文本的状态圆点。",
    en: "Compact number counts (unread comments, references to confirm) or text-less status dots.",
  },
  rule2: {
    zh: "不传 <code>value</code> 且无默认插槽时自动退化为 8px 状态圆点（<code>.mw-badge--dot</code>）。",
    en: "With no <code>value</code> and no default slot, it degrades to an 8px status dot (<code>.mw-badge--dot</code>).",
  },
  rule3: {
    zh: "承载词组或分类名称时请用 <code>Tag</code>；需要用户点击移除时请用 <code>Chip</code>。",
    en: "For phrases or category names use <code>Tag</code>; when the user should click to remove, use <code>Chip</code>.",
  },
  rule4: {
    zh: "不在同一导航项旁堆叠多个高饱和度徽标，避免视觉噪音。",
    en: "Don't stack multiple saturated badges beside one nav item — it turns into visual noise.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。主色、危险色与反色使用实心底以确保醒目，其余语义色采用柔和着色底。",
    en: "Paper and frost side by side. Primary, danger, and contrast use solid fills for prominence; other tones use soft tinted fills.",
  },
  sizesTitle: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "xs / sm / md / lg 四档，默认跟随密度上下文。圆点模式尺寸恒定为 8px。",
    en: "Four tiers, xs / sm / md / lg, following the density context by default; the dot form stays fixed at 8px.",
  },
  statesTitle: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "各语义色在单位数、多位数、插槽文本与圆点形态下的对比。",
    en: "Each tone with a single digit, multiple digits, slot text, and the dot form.",
  },
  colSingle: { zh: "单位数", en: "Single digit" },
  colMulti: { zh: "多位数", en: "Multiple digits" },
  colSlot: { zh: "文本插槽", en: "Slot text" },
  colDot: { zh: "圆点指示", en: "Dot" },
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
        <li data-kind="dont" v-html="t(s.rule3)" />
        <li data-kind="dont" v-html="t(s.rule4)" />
      </ul>
    </DocSection>

    <DocSection :title="s.baseTitle" :desc="s.baseDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <div class="doc-row">
          <Badge v-for="sv in severities" :key="sv.value" :severity="sv.value" :value="12" />
        </div>
        <div class="doc-row">
          <span v-for="sv in severities" :key="`dot-${sv.value}`" class="doc-row" style="gap: 6px">
            <Badge :severity="sv.value" />
            <span class="doc-note">{{ t(sv.label) }}</span>
          </span>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizesTitle" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="sz in sizes" :key="sz" class="doc-row">
          <span class="doc-note" style="width: 24px">{{ sz }}</span>
          <Badge :size="sz" :value="3" />
          <Badge :size="sz" severity="secondary" :value="42" />
          <Badge :size="sz" severity="danger" value="99+" />
          <Badge :size="sz" severity="success" value="NEW" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.statesTitle" :desc="s.statesDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colSingle, s.colMulti, s.colSlot, s.colDot]" label-width="88px">
          <StateRow v-for="sv in severities" :key="sv.value" :label="sv.label">
            <Badge :severity="sv.value" :value="6" />
            <Badge :severity="sv.value" value="128" />
            <Badge :severity="sv.value">v2</Badge>
            <Badge :severity="sv.value" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
