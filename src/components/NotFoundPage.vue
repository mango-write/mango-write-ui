<script setup lang="ts">
// 全屏 404 的展示壳：品牌 + 大号状态码 + 文案 + 出错路径 + 两个动作。
// 文案与跳转全部由宿主注入——两站的鉴权模型和首页落点不同（write 走空间/登录，
// rewrite 走 locale 裸根），包内不感知路由与 store。样式复用 theme.css 的
// 玻璃配方（.mw-glass / .mw-inlay），不再自调 blur 数值。
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

    <div class="mw-nf__card mw-glass">
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
        <button type="button" class="mw-nf__btn mw-nf__btn--primary" @click="emit('primary')">
          {{ primaryLabel }}
        </button>
        <button
          v-if="secondaryLabel"
          type="button"
          class="mw-nf__btn mw-nf__btn--text"
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
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 48px 24px;
  overflow: hidden auto;
  background:
    radial-gradient(1000px 520px at 82% -10%, rgb(var(--color-brand-500-rgb) / 0.12), transparent 62%),
    radial-gradient(760px 460px at -8% 108%, rgb(var(--color-brand-500-rgb) / 0.08), transparent 58%),
    var(--color-bg);
}

/* 点阵一直铺到玻璃卡底下——backdrop blur 需要真实的细节才有「霜化」可读。 */
.mw-nf::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, var(--color-border-strong) 1px, transparent 0);
  background-size: 22px 22px;
  opacity: 0.45;
  mask-image: radial-gradient(960px 680px at 50% 46%, black, transparent 75%);
  -webkit-mask-image: radial-gradient(960px 680px at 50% 46%, black, transparent 75%);
  pointer-events: none;
}

/* 两块缓慢漂移的暖色光斑：从玻璃卡边缘底下路过，让 blur/saturate 持续可见。 */
.mw-nf__blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.mw-nf__blob--a {
  width: 440px;
  height: 440px;
  left: calc(50% - 340px);
  top: calc(50% - 300px);
  background: radial-gradient(circle, rgb(var(--color-brand-500-rgb) / 0.3), transparent 68%);
  animation: mw-nf-drift-a 22s ease-in-out infinite alternate;
}

.mw-nf__blob--b {
  width: 360px;
  height: 360px;
  right: calc(50% - 380px);
  bottom: calc(50% - 280px);
  background: radial-gradient(circle, rgb(var(--color-brand-400-rgb) / 0.26), transparent 68%);
  animation: mw-nf-drift-b 26s ease-in-out infinite alternate;
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
  text-align: center;
  width: 100%;
  max-width: 520px;
  padding: 40px 44px 36px;
  border-radius: var(--radius-xl);
  animation: mw-nf-enter var(--motion-duration-spatial) var(--motion-ease-emphasized) both;
}

@keyframes mw-nf-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
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
  gap: 8px;
}

.mw-nf__logo {
  height: 30px;
}

.mw-nf__tagline {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--color-text-tertiary);
}

.mw-nf__code {
  margin: 28px 0 0;
  font-size: clamp(72px, 12vw, 108px);
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--color-text-primary);
}

.mw-nf__code-zero {
  color: var(--color-brand-500);
}

.mw-nf__title {
  margin: 14px 0 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.mw-nf__lead {
  margin: 10px 0 0;
  max-width: 420px;
  font-size: 14.5px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  text-wrap: balance;
}

.mw-nf__path {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  padding: 8px 14px;
}

.mw-nf__path-label {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.mw-nf__path-value {
  font-family: var(--font-family-mono);
  font-size: 12.5px;
  color: var(--color-text-secondary);
  text-align: left;
  word-break: break-all;
}

.mw-nf__actions {
  margin-top: 26px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.mw-nf__btn {
  min-height: 40px;
  padding: 0 20px;
  border: 0;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 180ms var(--motion-ease-standard),
    box-shadow 180ms var(--motion-ease-standard),
    background-color 180ms var(--motion-ease-standard);
}

.mw-nf__btn--primary {
  color: #fff;
  background-image: linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600));
  box-shadow: 0 10px 22px rgb(var(--color-brand-500-rgb) / 0.28);
}

.mw-nf__btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgb(var(--color-brand-500-rgb) / 0.34);
}

.mw-nf__btn--text {
  color: var(--color-text-secondary);
  background: transparent;
}

.mw-nf__btn--text:hover {
  background-color: var(--color-surface-muted);
  color: var(--color-text-primary);
}

.mw-nf__btn:focus-visible {
  outline: 2px solid var(--color-brand-500);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .mw-nf__card {
    animation: none;
  }
  .mw-nf__blob--a,
  .mw-nf__blob--b {
    animation: none;
  }
  .mw-nf__btn {
    transition: none;
  }
}
</style>
