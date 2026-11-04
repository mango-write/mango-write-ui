<script setup lang="ts">
import { Button, SiteFooter, SiteHeader } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";

const navItems = [
  { label: "产品特性", href: "#features", active: true },
  { label: "学术规范", href: "#integrity" },
  { label: "定价方案", href: "#pricing" },
  { label: "帮助文档", href: "#docs" },
];
</script>

<template>
  <DocPage lead="站点顶栏与页脚：Write 与 Rewrite 营销站、法务页共用的顶层导航（SiteHeader）与合规页脚（SiteFooter）。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">公开营销页、定价页、帮助中心与法务页统一使用 <code>SiteHeader</code> + <code>SiteFooter</code>。</li>
        <li data-kind="do">站点内链接经 <code>items</code> 与默认插槽注入，保持双站视觉与备案合规信息同源。</li>
        <li data-kind="dont">登录后的工作台应用面使用各自的应用壳，不混用营销站顶栏。</li>
      </ul>
    </DocSection>

    <DocSection title="站点顶栏（SiteHeader）" desc="固定霜面导航栏，集成品牌标志、导航链接、语言切换、主题切换与右侧主行动按钮。全宽上下展示浅深两套主题。">
      <div class="site-showcase-stack">
        <div
          v-for="theme in (['light', 'dark'] as const)"
          :key="`header-${theme}`"
          class="site-showcase-cell"
          :data-theme="theme"
        >
          <span class="site-showcase-label">{{ theme === "light" ? "浅色 · 站点顶栏" : "深色 · 站点顶栏" }}</span>
          <div class="site-showcase-frame">
            <SiteHeader
              :items="navItems"
              show-lang
              lang-label="EN"
              style="position: relative"
            >
              <template #actions>
                <Button size="sm" label="进入工作台" />
              </template>
            </SiteHeader>
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection title="站点页脚（SiteFooter）" desc="包含品牌标、官方社媒二维码悬浮卡、法务链接插槽与 ICP/网安备案合规行。">
      <div class="site-showcase-stack">
        <div
          v-for="theme in (['light', 'dark'] as const)"
          :key="`footer-${theme}`"
          class="site-showcase-cell"
          :data-theme="theme"
        >
          <span class="site-showcase-label">{{ theme === "light" ? "浅色 · 站点页脚" : "深色 · 站点页脚" }}</span>
          <div class="site-showcase-frame">
            <SiteFooter locale="zh-CN">
              <a href="#privacy">隐私政策</a>
              <a href="#terms">服务协议</a>
              <a href="#security">数据安全</a>
            </SiteFooter>
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>组件 / 属性</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>SiteHeader items</code></td><td><code>{ label, href, active? }[]</code></td><td>主导航链接列表</td></tr>
          <tr><td><code>SiteHeader showLang</code> / <code>langLabel</code></td><td><code>boolean · string</code></td><td>显示语言切换圆钮及其文字</td></tr>
          <tr><td><code>SiteHeader #actions</code></td><td>slot</td><td>右侧操作区（登录 / 进入工作台按钮）</td></tr>
          <tr><td><code>SiteFooter locale</code></td><td><code>'zh-CN' · 'en'</code></td><td>页脚文案语言</td></tr>
          <tr><td><code>SiteFooter #default</code></td><td>slot</td><td>法务与站点导航链接行</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.site-showcase-stack {
  display: grid;
  gap: var(--space-3);
}

.site-showcase-cell {
  position: relative;
  padding: var(--space-8) var(--space-5) var(--space-5);
  border-radius: var(--radius-card);
  border: var(--border-width) solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-primary);
}

.site-showcase-label {
  position: absolute;
  top: var(--space-2-5);
  left: var(--space-3);
  color: var(--text-tertiary);
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-weight: var(--weight-medium);
}

.site-showcase-frame {
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--border-subtle);
}
</style>
