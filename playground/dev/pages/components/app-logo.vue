<script setup lang="ts">
import { AppLogo } from "@mango-write/ui-vue";
import { api } from "../../api/entries/app-logo";
import { usage } from "../../usage/entries/app-logo";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";

const s = {
  whenToUse: { zh: "何时使用", en: "When to use" },
  rule1: {
    zh: "顶栏、登录壳、营销站导航与页脚统一使用 <code>AppLogo</code>，禁止走静态 <code>&lt;img&gt;</code>。",
    en: "Use <code>AppLogo</code> everywhere — top bars, login shells, marketing nav, footers; static <code>&lt;img&gt;</code> is off-limits.",
  },
  rule2: {
    zh: "窄屏或折叠侧栏传入 <code>markOnly</code> 切换为紧凑方形 viewBox。",
    en: "On narrow screens or collapsed sidebars, pass <code>markOnly</code> to switch to the compact square viewBox.",
  },
  rule3: {
    zh: "不要在业务代码里硬编码 SVG 路径或覆写品牌色。",
    en: "Don't hardcode SVG paths or override brand colors in app code.",
  },
  baseTitle: { zh: "底面", en: "Surfaces" },
  baseDesc: {
    zh: "纸面与霜面并排。主体填色绑定 --accent，内部高光绑定 --bg-raised，深色下不会产生刺眼白斑。",
    en: "Paper and frost side by side. The main fill binds to --accent and the inner highlight to --bg-raised, so dark mode never gets harsh white patches.",
  },
  formsTitle: { zh: "形态对比", en: "Form comparison" },
  formsDesc: {
    zh: "完整版（367×90 viewBox）与仅图形版（120×90 viewBox）。",
    en: "The full lockup (367×90 viewBox) vs the mark-only version (120×90 viewBox).",
  },
  colFull: { zh: "完整标志 (markOnly=false)", en: "Full (markOnly=false)" },
  colMark: { zh: "仅图形标 (markOnly=true)", en: "Mark only (markOnly=true)" },
  rowDefault: { zh: "默认", en: "Default" },
  api: { zh: "接口", en: "API" },
} as const;
</script>

<template>
  <DocPage>
    <UsagePlayground :entry="usage" />

    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.rule1)" />
        <li data-kind="do" v-html="t(s.rule2)" />
        <li data-kind="dont" v-html="t(s.rule3)" />
      </ul>
    </DocSection>

    <DocSection :title="s.baseTitle" :desc="s.baseDesc">
      <Specimen :surfaces="['paper', 'frost']" layout="row">
        <AppLogo />
        <AppLogo mark-only />
      </Specimen>
    </DocSection>

    <DocSection :title="s.formsTitle" :desc="s.formsDesc">
      <Specimen themes="both">
        <StateGrid :columns="[s.colFull, s.colMark]" label-width="64px">
          <StateRow :label="s.rowDefault">
            <AppLogo />
            <AppLogo mark-only />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
