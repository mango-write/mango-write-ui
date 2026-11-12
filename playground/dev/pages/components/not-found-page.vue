<script setup lang="ts">
import { NotFoundPage } from "@mango-write/ui-vue";
import { api } from "../../api/entries/not-found-page";
import { usage } from "../../usage/entries/not-found-page";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";

const s = {
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "路由未命中或资源无权限回落 404 时作为整页视图渲染。",
    en: "Render as a full-page view when a route misses or an inaccessible resource falls back to 404.",
  },
  do2: {
    zh: "主操作按钮明确指向当前站点的安全落点（如「返回工作台」或「返回首页」）。",
    en: "Point the primary action at a safe landing spot for the current site (e.g. “Back to workspace” or “Back home”).",
  },
  dont1: {
    zh: "局部卡片或抽屉内的数据缺失用 <code>AsyncSlot</code>，不用全屏 404。",
    en: "Missing data inside a card or drawer belongs to <code>AsyncSlot</code>, not a fullscreen 404.",
  },
  previewTitle: { zh: "深浅主题预览", en: "Light and dark preview" },
  previewDesc: {
    zh: "卡片使用 .mw-frost--thick 浮于暖色光晕画布之上，路径块使用半透明内凹槽。整页组件按全宽上下堆叠展示。",
    en: "The card floats on a warm halo canvas using .mw-frost--thick, and the path block uses a translucent inset. The fullscreen component is shown full-width, stacked.",
  },
  labelLight: { zh: "浅色 · 全屏 404 壳", en: "Light · fullscreen 404 shell" },
  labelDark: { zh: "深色 · 全屏 404 壳", en: "Dark · fullscreen 404 shell" },
  nfTitle: { zh: "页面不存在或已迁移", en: "Page not found or moved" },
  nfLead: {
    zh: "你访问的草稿或文库链接可能已被移除，或者当前身份空间无权查看该资源。",
    en: "The draft or library link you followed may have been removed, or your current identity space has no access to it.",
  },
  nfTagline: { zh: "AI，你的科研伙伴", en: "AI, your research companion" },
  nfPathLabel: { zh: "请求路径", en: "Request path" },
  nfPrimary: { zh: "返回工作台", en: "Back to workspace" },
  nfSecondary: { zh: "上一页", en: "Go back" },
  api: { zh: "接口", en: "API" },
} as const;
</script>

<template>
  <DocPage>
    <UsagePlayground :entry="usage" />

    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.do1)" />
        <li data-kind="do" v-html="t(s.do2)" />
        <li data-kind="dont" v-html="t(s.dont1)" />
      </ul>
    </DocSection>

    <DocSection :title="s.previewTitle" :desc="s.previewDesc">
      <div class="nf-showcase-stack">
        <div
          v-for="theme in (['light', 'dark'] as const)"
          :key="theme"
          class="nf-showcase-cell"
          :data-theme="theme"
        >
          <span class="nf-showcase-label">{{ theme === "light" ? t(s.labelLight) : t(s.labelDark) }}</span>
          <NotFoundPage
            :title="t(s.nfTitle)"
            :lead="t(s.nfLead)"
            :tagline="t(s.nfTagline)"
            path="/drafts/9f82c1a0-missing"
            :path-label="t(s.nfPathLabel)"
            :primary-label="t(s.nfPrimary)"
            :secondary-label="t(s.nfSecondary)"
          />
        </div>
      </div>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>

<style scoped>
.nf-showcase-stack {
  display: grid;
  gap: var(--space-4);
}

.nf-showcase-cell {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-card);
  border: var(--border-width) solid var(--border-subtle);
}

.nf-showcase-label {
  position: absolute;
  top: var(--space-3);
  left: var(--space-4);
  z-index: 2;
  color: var(--text-tertiary);
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-weight: var(--weight-medium);
}

.nf-showcase-cell :deep(.mw-nf) {
  min-height: auto;
  padding: var(--space-10) var(--space-6);
}
</style>
