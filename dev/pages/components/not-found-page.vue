<script setup lang="ts">
import { NotFoundPage } from "../../../src";
import { api } from "../../api/entries/not-found-page";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
</script>

<template>
  <DocPage lead="404 页面壳：Write 与 Rewrite 双站共用的全屏未找到页面，采用厚霜（.mw-frost--thick）卡片承载品牌、状态码、出错路径与恢复动作。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">路由未命中或资源无权限回落 404 时作为整页视图渲染。</li>
        <li data-kind="do">主操作按钮明确指向当前站点的安全落点（如「返回工作台」或「返回首页」）。</li>
        <li data-kind="dont">局部卡片或抽屉内的数据缺失用 <code>AsyncSlot</code>，不用全屏 404。</li>
      </ul>
    </DocSection>

    <DocSection title="深浅主题预览" desc="卡片使用 .mw-frost--thick 浮于暖色光晕画布之上，路径块使用半透明内凹槽。整页组件按全宽上下堆叠展示。">
      <div class="nf-showcase-stack">
        <div
          v-for="theme in (['light', 'dark'] as const)"
          :key="theme"
          class="nf-showcase-cell"
          :data-theme="theme"
        >
          <span class="nf-showcase-label">{{ theme === "light" ? "浅色 · 全屏 404 壳" : "深色 · 全屏 404 壳" }}</span>
          <NotFoundPage
            title="页面不存在或已迁移"
            lead="你访问的草稿或文库链接可能已被移除，或者当前身份空间无权查看该资源。"
            tagline="AI，你的科研伙伴"
            path="/drafts/9f82c1a0-missing"
            path-label="请求路径"
            primary-label="返回工作台"
            secondary-label="上一页"
          />
        </div>
      </div>
    </DocSection>

    <DocSection title="接口">
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
