<script setup lang="ts">
import { AppLogo, Button } from "../../src";

const githubUrl = "https://github.com/mango-write/mango-write-ui";

const stats = [
  { value: "50+", label: "组件" },
  { value: "10", label: "篇设计规范" },
  { value: "6", label: "层 token" },
  { value: "2", label: "套主题" },
];

const features = [
  {
    title: "设计语言",
    body: "颜色、文字、尺寸、圆角、层级、动效都有唯一的 token 来源与机械门禁——设计决策有据可查，不靠口头约定。",
  },
  {
    title: "Vue 3 组件库",
    body: "表单、浮层、数据展示一整套组件：原生语义打底，aria 落点与键盘路径开箱即用，受控与非受控都支持。",
  },
  {
    title: "纸与霜双材质",
    body: "纸面承载内容，霜面承载浮层；浅色深色全 token 化，跟随系统一键切换，长时阅读不刺眼。",
  },
];

const products = [
  {
    title: "芒果写作 · 科研平台",
    body: "AI 科研写作工作台：素材、理解、沉淀、写作、发布的数据闭环。",
    url: "https://mangowrite.com",
    cta: "前往科研平台",
  },
  {
    title: "芒果写作降 AI",
    body: "论文降 AI 率、降 AIGC 率与 AI 率检测，改写全程可追溯。",
    url: "https://rewrite.mangowrite.com",
    cta: "前往降 AI",
  },
];
</script>

<template>
  <div class="landing">
    <header class="landing-topbar">
      <div class="landing-brand">
        <AppLogo />
        <span class="landing-brand__name">MangoWrite UI</span>
      </div>
      <span class="landing-topbar__spacer" />
      <Button
        href="https://rewrite.mangowrite.com"
        target="_blank"
        rel="noreferrer"
        size="sm"
        variant="outlined"
        severity="secondary"
        label="降 AI"
      />
      <Button
        href="https://mangowrite.com"
        target="_blank"
        rel="noreferrer"
        size="sm"
        label="科研平台"
      />
      <a
        class="landing-gh"
        :href="githubUrl"
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub 仓库"
      >
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      </a>
    </header>

    <main class="landing-main">
      <section class="landing-hero">
        <p class="landing-eyebrow">开源 · Apache-2.0</p>
        <h1 class="landing-title">纸与霜设计语言</h1>
        <p class="landing-lede">
          MangoWrite 全线产品共用的设计语言与 Vue 3 组件库：六层 token
          单一真相源，纸面与霜面双材质，浅色深色双主题——为长时间阅读与写作而生。
        </p>
        <div class="landing-cta">
          <RouterLink class="landing-cta-primary" to="/dev/ui/foundations/overview">
            浏览设计规范
          </RouterLink>
          <a class="landing-cta-ghost" :href="githubUrl" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
        <dl class="landing-stats">
          <div v-for="stat in stats" :key="stat.label" class="landing-stats__item">
            <dt class="landing-stats__value">{{ stat.value }}</dt>
            <dd class="landing-stats__label">{{ stat.label }}</dd>
          </div>
        </dl>
      </section>

      <section class="landing-features" aria-label="核心特性">
        <article v-for="feature in features" :key="feature.title" class="landing-card mw-frost">
          <h2 class="landing-card__title">{{ feature.title }}</h2>
          <p class="landing-card__body">{{ feature.body }}</p>
        </article>
      </section>

      <section class="landing-products" aria-label="由它驱动的产品">
        <h2 class="landing-section-title">由它驱动的产品</h2>
        <div class="landing-products__grid">
          <a
            v-for="product in products"
            :key="product.title"
            class="landing-product mw-frost"
            :href="product.url"
            target="_blank"
            rel="noreferrer"
          >
            <h3 class="landing-product__title">{{ product.title }}</h3>
            <p class="landing-product__body">{{ product.body }}</p>
            <span class="landing-product__cta">{{ product.cta }} →</span>
          </a>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <span>© 2026 MangoWrite · 以 Apache-2.0 发布</span>
      <a :href="githubUrl" target="_blank" rel="noreferrer">github.com/mango-write/mango-write-ui</a>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-canvas);
  color: var(--text-primary);
}

.landing-topbar {
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
}

.landing-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.landing-brand__name {
  font-size: var(--type-title-size);
  font-weight: var(--weight-semibold);
}

.landing-topbar__spacer {
  flex: 1;
}

.landing-gh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-sm-h);
  height: var(--size-sm-h);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.landing-gh:hover {
  background: var(--fill-default);
  color: var(--text-primary);
}

.landing-main {
  flex: 1;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-6);
  box-sizing: border-box;
}

.landing-hero {
  padding: var(--space-6) 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
}

.landing-eyebrow {
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
  color: var(--text-accent);
  letter-spacing: 0.08em;
}

.landing-title {
  margin: 0;
  font-size: var(--type-display-lg-size);
  line-height: var(--type-display-lg-line);
  font-weight: var(--weight-bold);
}

.landing-lede {
  margin: 0;
  max-width: 40em;
  font-size: var(--type-body-lg-size);
  line-height: var(--type-body-lg-line);
  color: var(--text-secondary);
}

.landing-cta {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.landing-cta-primary,
.landing-cta-ghost {
  display: inline-flex;
  align-items: center;
  height: var(--control-h);
  padding: 0 var(--control-px);
  border-radius: var(--control-radius);
  font-size: var(--control-font);
  font-weight: var(--weight-medium);
  text-decoration: none;
}

.landing-cta-primary {
  background: var(--accent);
  color: var(--text-on-accent);
}

.landing-cta-primary:hover {
  background: var(--accent-hover);
}

.landing-cta-primary:active {
  background: var(--accent-pressed);
}

.landing-cta-ghost {
  border: var(--border-width) solid var(--border-default);
  color: var(--text-primary);
}

.landing-cta-ghost:hover {
  background: var(--fill-default);
}

.landing-stats {
  display: flex;
  gap: var(--space-6);
  margin: var(--space-4) 0 0;
}

.landing-stats__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.landing-stats__value {
  font-size: var(--type-headline-size);
  line-height: var(--type-headline-line);
  font-weight: var(--weight-semibold);
}

.landing-stats__label {
  margin: 0;
  font-size: var(--type-caption-size);
  color: var(--text-tertiary);
}

.landing-features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
  padding: var(--space-6) 0;
}

.landing-card {
  border-radius: var(--radius-card);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.landing-card__title {
  margin: 0;
  font-size: var(--type-title-lg-size);
  line-height: var(--type-title-lg-line);
  font-weight: var(--weight-semibold);
}

.landing-card__body {
  margin: 0;
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
  color: var(--text-secondary);
}

.landing-products {
  padding: var(--space-6) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.landing-section-title {
  margin: 0;
  font-size: var(--type-headline-size);
  line-height: var(--type-headline-line);
  font-weight: var(--weight-semibold);
}

.landing-products__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.landing-product {
  border-radius: var(--radius-card);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  text-decoration: none;
  color: inherit;
}

.landing-product__title {
  margin: 0;
  font-size: var(--type-title-lg-size);
  line-height: var(--type-title-lg-line);
  font-weight: var(--weight-semibold);
}

.landing-product__body {
  margin: 0;
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
  color: var(--text-secondary);
}

.landing-product__cta {
  margin-top: var(--space-1);
  font-size: var(--type-body-sm-size);
  font-weight: var(--weight-medium);
  color: var(--text-accent);
}

.landing-footer {
  flex: none;
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  font-size: var(--type-caption-size);
  color: var(--text-tertiary);
}

.landing-footer a {
  color: inherit;
}

@media (max-width: 720px) {
  .landing-features,
  .landing-products__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .landing-stats {
    flex-wrap: wrap;
    gap: var(--space-4);
  }
}
</style>
