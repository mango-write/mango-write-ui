<script setup lang="ts">
import { Button, SiteFooter, SiteHeader } from "../../../src";
import { api } from "../../api/entries/site";
import ApiTable from "../../kit/ApiTable.vue";
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
        <li data-kind="do">社媒账号经 <code>socials</code>、合规行经 <code>#legal</code>、品牌经 <code>#brand</code> 由宿主站点注入；组件默认值是产品站的运营事实，第三方宿主必须整组覆盖。</li>
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

    <DocSection
      title="站点页脚（SiteFooter）"
      desc="品牌标、社媒二维码悬浮卡（默认官方三号，扫码可找到我们；第三方宿主经 socials 整组覆盖）、法务链接插槽与合规行（#legal 插槽）。合规行是各站运营事实，演示页只保留版权行，真实备案行只出现在产品站。上方的假主体占位用于演示二维码悬浮卡的展开环境。"
    >
      <div class="site-showcase-stack">
        <div
          v-for="theme in (['light', 'dark'] as const)"
          :key="`footer-${theme}`"
          class="site-showcase-cell"
          :data-theme="theme"
        >
          <span class="site-showcase-label">{{ theme === "light" ? "浅色 · 站点页脚" : "深色 · 站点页脚" }}</span>
          <div class="site-showcase-frame">
            <div class="site-showcase-body" aria-hidden="true">
              <span>页面主体内容</span>
            </div>
            <SiteFooter locale="zh-CN">
              <a href="#privacy">隐私政策</a>
              <a href="#terms">服务协议</a>
              <a href="#security">数据安全</a>
              <template #legal>
                <span>© {{ new Date().getFullYear() }} 芒果写作 MangoWrite 版权所有</span>
              </template>
            </SiteFooter>
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
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

/* 假主体占位：给页脚的二维码悬浮卡（向上展开）留出完整的弹出空间 */
.site-showcase-body {
  display: grid;
  place-items: center;
  padding: calc(var(--space-12) * 2) var(--space-5);
  background: var(--bg-sunken);
  border-bottom: var(--border-width) solid var(--border-subtle);
}

.site-showcase-body span {
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
}
</style>
