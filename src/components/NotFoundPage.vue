<script setup lang="ts">
// 全屏 404 的展示壳：品牌 + 大号状态码 + 文案 + 出错路径 + 两个动作。
// 文案与跳转全部由宿主注入——两站的鉴权模型和首页落点不同（write 走空间/登录，
// rewrite 走 locale 裸根），包内不感知路由与 store。卡片用霜（.mw-frost），不自调 blur。
import AppLogo from "./AppLogo.vue";

withDefaults(
  defineProps<{
    title: string;
    lead: string;
    /** 品牌行下方的副标（如 Slogan）。 */
    tagline?: string;
    /** 出错路径；不给则不渲染路径块。 */
    path?: string;
    pathLabel?: string;
    primaryLabel: string;
    secondaryLabel?: string;
  }>(),
  {
    tagline: undefined,
    path: undefined,
    pathLabel: undefined,
    secondaryLabel: undefined,
  },
);

const emit = defineEmits<{ (e: "primary"): void; (e: "secondary"): void }>();
</script>

<template>
  <section class="mw-nf">
    <div class="mw-nf__blob mw-nf__blob--a" aria-hidden="true" />
    <div class="mw-nf__blob mw-nf__blob--b" aria-hidden="true" />

    <div class="mw-nf__card mw-frost mw-frost--thick">
      <header class="mw-nf__brand">
        <AppLogo class="mw-nf__logo" />
        <p v-if="tagline" class="mw-nf__tagline">{{ tagline }}</p>
      </header>

      <p class="mw-nf__code" aria-hidden="true">4<span class="mw-nf__code-zero">0</span>4</p>
      <h1 class="mw-nf__title">{{ title }}</h1>
      <p class="mw-nf__lead">{{ lead }}</p>

      <div v-if="path" class="mw-nf__path mw-inlay">
        <span v-if="pathLabel" class="mw-nf__path-label">{{ pathLabel }}</span>
        <code class="mw-nf__path-value">{{ path }}</code>
      </div>

      <div class="mw-nf__actions">
        <button type="button" class="mw-btn-site" @click="emit('primary')">
          {{ primaryLabel }}
        </button>
        <button
          v-if="secondaryLabel"
          type="button"
          class="mw-nf__btn--text"
          @click="emit('secondary')"
        >
          {{ secondaryLabel }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mw-nf {
  --mw-nf-drift-a: 22s;
  --mw-nf-drift-b: 26s;
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--space-12) var(--space-6);
  overflow: hidden auto;
  background:
    radial-gradient(1000px 520px at 82% -10%, var(--accent-subtle), transparent 62%),
    radial-gradient(760px 460px at -8% 108%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 58%),
    var(--bg-surface);
}

/* 点阵一直铺到霜卡底下——backdrop blur 需要真实的细节才有「霜化」可读。mask 只取 alpha。 */
.mw-nf::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, var(--border-strong) 1px, transparent 0);
  background-size: 22px 22px;
  opacity: 0.45;
  mask-image: radial-gradient(960px 680px at 50% 46%, currentColor, transparent 75%);
  -webkit-mask-image: radial-gradient(960px 680px at 50% 46%, currentColor, transparent 75%);
  pointer-events: none;
}

.mw-nf__blob {
  position: absolute;
  border-radius: var(--radius-full);
  pointer-events: none;
}

.mw-nf__blob--a {
  width: 440px;
  height: 440px;
  left: calc(50% - 340px);
  top: calc(50% - 300px);
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 30%, transparent), transparent 68%);
  animation: mw-nf-drift-a var(--mw-nf-drift-a) var(--ease-standard) infinite alternate;
}

.mw-nf__blob--b {
  width: 360px;
  height: 360px;
  right: calc(50% - 380px);
  bottom: calc(50% - 280px);
  background: radial-gradient(circle, color-mix(in srgb, var(--accent-hover) 26%, transparent), transparent 68%);
  animation: mw-nf-drift-b var(--mw-nf-drift-b) var(--ease-standard) infinite alternate;
}

@keyframes mw-nf-drift-a {
  to {
    transform: translate3d(72px, 40px, 0);
  }
}

@keyframes mw-nf-drift-b {
  to {
    transform: translate3d(-64px, -44px, 0);
  }
}

.mw-nf__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 520px;
  padding: var(--space-10) var(--space-10) var(--space-8);
  border-radius: var(--radius-2xl);
  text-align: center;
  animation: mw-nf-enter var(--duration-slower) var(--ease-emphasized) both;
}

@keyframes mw-nf-enter {
  from {
    opacity: 0;
    transform: translateY(var(--space-2-5));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mw-nf__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.mw-nf__logo {
  height: var(--space-8);
}

.mw-nf__tagline {
  margin: 0;
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  letter-spacing: var(--tracking-caps);
}

.mw-nf__code {
  margin: var(--space-6) 0 0;
  color: var(--text-primary);
  font-size: clamp(calc(var(--type-display-lg-size) * 1.6), 12vw, calc(var(--type-display-lg-size) * 2.5));
  font-weight: var(--weight-bold);
  line-height: 1;
  letter-spacing: calc(var(--tracking-display) * 2);
  font-variant-numeric: tabular-nums;
}

.mw-nf__code-zero {
  color: var(--accent);
}

.mw-nf__title {
  margin: var(--space-3) 0 0;
  color: var(--text-primary);
  font-size: var(--type-headline-size);
  font-weight: var(--weight-semibold);
  line-height: var(--type-headline-line);
  letter-spacing: var(--tracking-title);
}

.mw-nf__lead {
  max-width: 420px;
  margin: var(--space-2) 0 0;
  color: var(--text-secondary);
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
  text-wrap: balance;
}

.mw-nf__path {
  display: flex;
  align-items: center;
  gap: var(--space-2-5);
  max-width: 100%;
  margin-top: var(--space-6);
  padding: var(--space-2) var(--space-3);
}

.mw-nf__path-label {
  flex-shrink: 0;
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
}

.mw-nf__path-value {
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  text-align: start;
  word-break: break-all;
}

.mw-nf__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.mw-nf__btn--text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--size-lg-h);
  padding: 0 var(--space-4);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--type-body-sm-size);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.mw-nf__btn--text:hover {
  background-color: var(--fill-default);
  color: var(--text-primary);
}

.mw-nf__btn--text:focus-visible {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: var(--focus-offset);
}

@media (prefers-reduced-motion: reduce) {
  .mw-nf__card,
  .mw-nf__blob--a,
  .mw-nf__blob--b {
    animation: none;
  }
  .mw-nf__btn--text {
    transition: none;
  }
}
</style>
