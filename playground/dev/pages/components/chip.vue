<script setup lang="ts">
import { computed, ref } from "vue";
import { Bookmark, FileText, Link2 } from "lucide-vue-next";
import { Button, Chip } from "@mango-write/ui-vue";
import { api } from "../../api/entries/chip";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/chip";

/* 缩略图 SVG 内嵌姓氏字符,随语言重建 */
const avatarSvg = computed(
  () =>
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="#e07a2f"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="22" font-weight="600">${t({ zh: "林", en: "L" })}</text></svg>`,
    ),
);

const resetKey = ref(0);
const sizes = ["xs", "sm", "md", "lg"] as const;

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak the options for a live preview; view the generated code and copy it into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "展示用户添加的关键词、筛选器或附件条件，并允许通过 <code>removable</code> 移除。",
    en: "Show user-added keywords, filters, or attachment criteria, removable via <code>removable</code>.",
  },
  rule2: {
    zh: "前置头像（<code>image</code>）或图标（<code>icon</code>）以标识具体实体。",
    en: "Lead with an avatar (<code>image</code>) or icon (<code>icon</code>) to identify the entity.",
  },
  rule3: {
    zh: "表达系统状态或语义等级时请用 <code>Tag</code>；展示带悬浮资料卡的用户提及请用 <code>UserChip</code>。",
    en: "For system states or semantic levels use <code>Tag</code>; for user mentions with a hover card use <code>UserChip</code>.",
  },
  rule4: {
    zh: "不在单个纸片内塞入长句；保持词条简短且单行显示。",
    en: "Don't cram long sentences into one chip; keep terms short and single-line.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。纸片使用中性控件填充底色，移除按钮在悬停时加深反馈。",
    en: "Paper and frost side by side. Chips use the neutral control fill; the remove button deepens on hover.",
  },
  compLing: { zh: "计算语言学", en: "Computational linguistics" },
  nameLin: { zh: "林知远", en: "Lin Zhiyuan" },
  recentOnly: { zh: "仅看近三年", en: "Last 3 years" },
  sizesTitle: { zh: "尺寸", en: "Sizes" },
  sizesDesc: {
    zh: "跟随容器的 .mw-size-* 密度上下文自动缩放高度、内边距、头像与移除按钮尺寸。",
    en: "Height, padding, avatar, and remove button scale with the container's .mw-size-* density context.",
  },
  llm: { zh: "大语言模型", en: "Large language model" },
  withPdf: { zh: "已附原文", en: "Full text attached" },
  statesTitle: { zh: "状态", en: "States" },
  statesDesc: {
    zh: "点击移除按钮（或聚焦后按 Enter / Backspace / Space）会隐藏纸片并触发 remove 事件。",
    en: "Clicking the remove button (or Enter / Backspace / Space while focused) hides the chip and emits remove.",
  },
  colText: { zh: "纯文本", en: "Text" },
  colIcon: { zh: "带图标", en: "With icon" },
  colImage: { zh: "带图像", en: "With image" },
  colRemovable: { zh: "可移除", en: "Removable" },
  defaultRow: { zh: "默认", en: "Default" },
  empirical: { zh: "实证研究", en: "Empirical study" },
  notes: { zh: "文献笔记", en: "Reading notes" },
  resetChips: { zh: "重置已移除的纸片", en: "Restore removed chips" },
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
      <Specimen :surfaces="['paper', 'frost']">
        <Chip :label="t(s.compLing)" />
        <Chip label="DOI: 10.1038" :icon="Link2" />
        <Chip :label="t(s.nameLin)" :image="avatarSvg" />
        <Chip :key="`frost-rm-${resetKey}`" :label="t(s.recentOnly)" removable />
      </Specimen>
    </DocSection>

    <DocSection :title="s.sizesTitle" :desc="s.sizesDesc">
      <Specimen themes="single" layout="stack">
        <div v-for="sz in sizes" :key="sz" class="doc-row" :class="`mw-size-${sz}`">
          <span class="doc-note" style="width: 24px">{{ sz }}</span>
          <Chip :label="t(s.llm)" />
          <Chip :label="t(s.withPdf)" :icon="FileText" />
          <Chip :label="t(s.nameLin)" :image="avatarSvg" removable />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.statesTitle" :desc="s.statesDesc">
      <Specimen themes="both" layout="stack">
        <StateGrid :columns="[s.colText, s.colIcon, s.colImage, s.colRemovable]" label-width="72px">
          <StateRow :key="`row-${resetKey}`" :label="s.defaultRow">
            <Chip :label="t(s.empirical)" />
            <Chip :label="t(s.notes)" :icon="Bookmark" />
            <Chip :label="t(s.nameLin)" :image="avatarSvg" />
            <Chip label="2024–2026" removable />
          </StateRow>
        </StateGrid>
        <div class="doc-row">
          <Button size="xs" variant="text" severity="secondary" :label="t(s.resetChips)" @click="resetKey++" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
