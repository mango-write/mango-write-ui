<script setup lang="ts">
import { computed } from "vue";
import { Button, SiteFooter, SiteHeader } from "../../../src";
import { api } from "../../api/entries/site";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import { locale, t } from "../../i18n";

const s = {
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "公开营销页、定价页、帮助中心与法务页统一使用 <code>SiteHeader</code> + <code>SiteFooter</code>。",
    en: "Public marketing, pricing, help-center, and legal pages all use <code>SiteHeader</code> + <code>SiteFooter</code>.",
  },
  do2: {
    zh: "站点内链接经 <code>items</code> 与默认插槽注入，保持双站视觉与备案合规信息同源。",
    en: "Site links come in via <code>items</code> and the default slot, keeping both sites' visuals and compliance lines single-sourced.",
  },
  do3: {
    zh: "社媒账号经 <code>socials</code>、合规行经 <code>#legal</code>、品牌经 <code>#brand</code> 由宿主站点注入；组件默认值是产品站的运营事实，第三方宿主必须整组覆盖。",
    en: "Socials arrive via <code>socials</code>, compliance lines via <code>#legal</code>, and branding via <code>#brand</code>, all injected by the host site; the component defaults are the product site's operational facts, and third-party hosts must override the whole set.",
  },
  dont1: {
    zh: "登录后的工作台应用面使用各自的应用壳，不混用营销站顶栏。",
    en: "Logged-in workspace surfaces use their own app shells; don't mix in the marketing header.",
  },
  headerTitle: { zh: "站点顶栏（SiteHeader）", en: "Site header (SiteHeader)" },
  headerDesc: {
    zh: "固定霜面导航栏，集成品牌标志、导航链接、语言切换、主题切换与右侧主行动按钮。全宽上下展示浅深两套主题。",
    en: "A fixed frosted navigation bar combining brand logo, nav links, language switcher, theme toggle, and the primary action on the right. Light and dark themes shown full-width, stacked.",
  },
  labelLightHeader: { zh: "浅色 · 站点顶栏", en: "Light · site header" },
  labelDarkHeader: { zh: "深色 · 站点顶栏", en: "Dark · site header" },
  enterWorkspace: { zh: "进入工作台", en: "Enter workspace" },
  footerTitle: { zh: "站点页脚（SiteFooter）", en: "Site footer (SiteFooter)" },
  footerDesc: {
    zh: "品牌标、社媒二维码悬浮卡（默认官方三号，扫码可找到我们；第三方宿主经 socials 整组覆盖）、法务链接插槽与合规行（#legal 插槽）。合规行是各站运营事实，演示页只保留版权行，真实备案行只出现在产品站。上方的假主体占位用于演示二维码悬浮卡的展开环境。",
    en: "Brand mark, social QR-code hover cards (the three official accounts by default, scannable to find us; third-party hosts override the set via socials), legal link slots, and the compliance line (#legal slot). Compliance lines are per-site operational facts, so this demo keeps only the copyright line — real filing lines appear on the product site only. The fake body above exists to give the QR hover cards room to open.",
  },
  labelLightFooter: { zh: "浅色 · 站点页脚", en: "Light · site footer" },
  labelDarkFooter: { zh: "深色 · 站点页脚", en: "Dark · site footer" },
  bodyPlaceholder: { zh: "页面主体内容", en: "Page body content" },
  privacy: { zh: "隐私政策", en: "Privacy policy" },
  terms: { zh: "服务协议", en: "Terms of service" },
  security: { zh: "数据安全", en: "Data security" },
  copyright: { zh: "芒果写作 MangoWrite 版权所有", en: "MangoWrite. All rights reserved." },
  api: { zh: "接口", en: "API" },
} as const;

/* SiteHeader 直读字符串 label,导航项按当前语言重建;页脚内置文案语言跟随演示语言 */
const navItems = computed(() => [
  { label: t({ zh: "产品特性", en: "Features" }), href: "#features", active: true },
  { label: t({ zh: "学术规范", en: "Academic integrity" }), href: "#integrity" },
  { label: t({ zh: "定价方案", en: "Pricing" }), href: "#pricing" },
  { label: t({ zh: "帮助文档", en: "Help docs" }), href: "#docs" },
]);
const footerLocale = computed(() => (locale.value === "zh-CN" ? "zh-CN" : "en"));
</script>

<template>
  <DocPage>
    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.do1)" />
        <li data-kind="do" v-html="t(s.do2)" />
        <li data-kind="do" v-html="t(s.do3)" />
        <li data-kind="dont" v-html="t(s.dont1)" />
      </ul>
    </DocSection>

    <DocSection :title="s.headerTitle" :desc="s.headerDesc">
      <div class="site-showcase-stack">
        <div
          v-for="theme in (['light', 'dark'] as const)"
          :key="`header-${theme}`"
          class="site-showcase-cell"
          :data-theme="theme"
        >
          <span class="site-showcase-label">{{ theme === "light" ? t(s.labelLightHeader) : t(s.labelDarkHeader) }}</span>
          <div class="site-showcase-frame">
            <SiteHeader
              :items="navItems"
              show-lang
              lang-label="EN"
              style="position: relative"
            >
              <template #actions>
                <Button size="sm" :label="t(s.enterWorkspace)" />
              </template>
            </SiteHeader>
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection :title="s.footerTitle" :desc="s.footerDesc">
      <div class="site-showcase-stack">
        <div
          v-for="theme in (['light', 'dark'] as const)"
          :key="`footer-${theme}`"
          class="site-showcase-cell"
          :data-theme="theme"
        >
          <span class="site-showcase-label">{{ theme === "light" ? t(s.labelLightFooter) : t(s.labelDarkFooter) }}</span>
          <div class="site-showcase-frame">
            <div class="site-showcase-body" aria-hidden="true">
              <span>{{ t(s.bodyPlaceholder) }}</span>
            </div>
            <SiteFooter :locale="footerLocale">
              <a href="#privacy">{{ t(s.privacy) }}</a>
              <a href="#terms">{{ t(s.terms) }}</a>
              <a href="#security">{{ t(s.security) }}</a>
              <template #legal>
                <span>© {{ new Date().getFullYear() }} {{ t(s.copyright) }}</span>
              </template>
            </SiteFooter>
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection :title="s.api">
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
