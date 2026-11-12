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
