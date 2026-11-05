<script setup lang="ts">
import { ref } from "vue";
import { Button } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import { t, type Bi } from "../../i18n";

const durations = [
  { token: "--duration-instant", use: { zh: "浮层退出、tooltip", en: "Overlay exit, tooltips" } },
  { token: "--duration-fast", use: { zh: "hover / 按下 / 颜色切换", en: "Hover / press / color switches" } },
  { token: "--duration-base", use: { zh: "浮层进入、展开收起", en: "Overlay enter, expand & collapse" } },
  { token: "--duration-slow", use: { zh: "对话框进入、区域切换", en: "Dialog enter, region switches" } },
  { token: "--duration-slower", use: { zh: "页面级空间转场", en: "Page-level spatial transitions" } },
];
const easings = [
  { token: "--ease-standard", use: { zh: "状态切换", en: "State switches" } },
  { token: "--ease-enter", use: { zh: "进入：快启动、长减速", en: "Enter: quick start, long deceleration" } },
  { token: "--ease-exit", use: { zh: "退出：加速离场", en: "Exit: accelerate away" } },
  { token: "--ease-emphasized", use: { zh: "空间位移、对话框", en: "Spatial movement, dialogs" } },
  { token: "--ease-spring-snap", use: { zh: "小物体归位（超调 1.5%）", en: "Small objects settling (1.5% overshoot)" } },
  { token: "--ease-spring-pop", use: { zh: "开关、勾选（超调 8%）", en: "Switches, checkboxes (8% overshoot)" } },
];

const playDur = ref(false);
const playEase = ref(false);
const open = ref(false);

const s = {
  durationsTitle: { zh: "时长", en: "Durations" },
  easingsTitle: { zh: "曲线", en: "Easing curves" },
  play: { zh: "播放", en: "Play" },
  reset: { zh: "复位", en: "Reset" },
  overlayTitle: { zh: "浮层进出", en: "Overlay enter & exit" },
  overlayDesc: {
    zh: "进入 = 透明度 + 自锚点方向 4px 位移 + 0.97 缩放（base · enter）；退出只淡出（instant · exit），约为进入的 60%。",
    en: "Enter = opacity + a 4px offset along the anchor direction + 0.97 scale (base · enter); exit only fades out (instant · exit) at about 60% of the enter duration.",
  },
  expandOverlay: { zh: "展开浮层", en: "Expand overlay" },
  collapse: { zh: "收起", en: "Collapse" },
  insertCitation: { zh: "插入引用", en: "Insert citation" },
  insertCitationDesc: { zh: "在当前光标处插入 [1] Smith 2024", en: "Inserts [1] Smith 2024 at the current cursor" },
  rulesTitle: { zh: "规则", en: "Rules" },
  ruleHover: {
    zh: "hover / 按下只过渡颜色与背景（fast · standard）；不做位移、不做缩放。",
    en: "Hover / press transitions only color and background (fast · standard); no movement, no scaling.",
  },
  ruleSpring: {
    zh: "弹簧只给小物体归位（位移 &lt; 24px 或缩放），时长 ≤ base；开关滑块、勾选、按钮松手。",
    en: "Springs are only for small objects settling (movement &lt; 24px or scaling), duration ≤ base: switch thumbs, checkboxes, button release.",
  },
  ruleNoSpring: {
    zh: "转场、抽屉、面板位移禁止弹簧——大位移上的弹簧显得廉价。",
    en: "No springs for transitions, drawers, or panel movement — springs over large distances look cheap.",
  },
  ruleFilter: {
    zh: "<span class=\"doc-code\">filter</span> / <span class=\"doc-code\">backdrop-filter</span> 不进 transition 与 keyframes（逐帧重算 = 掉帧）。",
    en: "<span class=\"doc-code\">filter</span> / <span class=\"doc-code\">backdrop-filter</span> never go into transition or keyframes (per-frame recomputation = dropped frames).",
  },
  ruleReduced: {
    zh: "系统开启「减少动态效果」时，只保留透明度变化。一屏同时运动的区域不超过两处。",
    en: "When the system turns on “reduce motion”, keep only opacity changes. No more than two regions animating at once on screen.",
  },
} as const;
</script>

<template>
  <DocPage>
    <DocSection :title="s.durationsTitle">
      <div class="doc-row" style="margin-bottom: var(--space-3)">
        <Button size="sm" severity="secondary" :label="playDur ? t(s.reset) : t(s.play)" @click="playDur = !playDur" />
      </div>
      <div class="tracks">
        <div v-for="row in durations" :key="row.token" class="track">
          <code>{{ row.token }}</code><span class="track__use">{{ t(row.use) }}</span>
          <div class="track__rail">
            <span class="track__dot" :class="{ 'is-on': playDur }" :style="{ transitionDuration: `var(${row.token})`, transitionTimingFunction: 'var(--ease-standard)' }" />
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection :title="s.easingsTitle">
      <div class="doc-row" style="margin-bottom: var(--space-3)">
        <Button size="sm" severity="secondary" :label="playEase ? t(s.reset) : t(s.play)" @click="playEase = !playEase" />
      </div>
      <div class="tracks">
        <div v-for="row in easings" :key="row.token" class="track">
          <code>{{ row.token }}</code><span class="track__use">{{ t(row.use) }}</span>
          <div class="track__rail">
            <span class="track__dot" :class="{ 'is-on': playEase }" :style="{ transitionDuration: 'var(--duration-slower)', transitionTimingFunction: `var(${row.token})` }" />
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection :title="s.overlayTitle" :desc="s.overlayDesc">
      <div class="doc-row">
        <Button severity="secondary" :label="open ? t(s.collapse) : t(s.expandOverlay)" @click="open = !open" />
      </div>
      <div class="pop-stage">
        <Transition name="dl-pop">
          <div v-if="open" class="pop mw-frost">
            <b>{{ t(s.insertCitation) }}</b>
            <span>{{ t(s.insertCitationDesc) }}</span>
          </div>
        </Transition>
      </div>
    </DocSection>

    <DocSection :title="s.rulesTitle">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.ruleHover)" />
        <li data-kind="do" v-html="t(s.ruleSpring)" />
        <li data-kind="dont" v-html="t(s.ruleNoSpring)" />
        <li data-kind="dont" v-html="t(s.ruleFilter)" />
        <li v-html="t(s.ruleReduced)" />
      </ul>
    </DocSection>
  </DocPage>
</template>

<style scoped>
.tracks {
  display: grid;
  gap: var(--space-2);
}

.track {
  display: grid;
  grid-template-columns: 180px 200px 1fr;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--type-caption-size);
}

.track code {
  font-family: var(--font-mono);
}

.track__use {
  color: var(--text-tertiary);
}

.track__rail {
  position: relative;
  height: var(--size-sm-h);
  border-radius: var(--radius-full);
  background: var(--fill-subtle);
}

.track__dot {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--accent);
  transition-property: left;
}

.track__dot.is-on {
  left: calc(100% - 24px);
}

.pop-stage {
  height: 120px;
  margin-top: var(--space-3);
}

.pop {
  display: grid;
  gap: var(--space-1);
  width: 280px;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-float);
  font-size: var(--type-body-sm-size);
  transform-origin: top left;
}

.pop span {
  color: var(--text-secondary);
}

.dl-pop-enter-active {
  transition:
    opacity var(--duration-base) var(--ease-enter),
    transform var(--duration-base) var(--ease-enter);
}

.dl-pop-leave-active {
  transition: opacity var(--duration-instant) var(--ease-exit);
}

.dl-pop-enter-from {
  opacity: 0;
  transform: translateY(calc(var(--motion-enter-offset) * -1)) scale(var(--motion-enter-scale));
}

.dl-pop-leave-to {
  opacity: 0;
}
</style>
