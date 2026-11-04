<script setup lang="ts">
import { ref } from "vue";
import { Button } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";

const durations = [
  ["--duration-instant", "浮层退出、tooltip"],
  ["--duration-fast", "hover / 按下 / 颜色切换"],
  ["--duration-base", "浮层进入、展开收起"],
  ["--duration-slow", "对话框进入、区域切换"],
  ["--duration-slower", "页面级空间转场"],
];
const easings = [
  ["--ease-standard", "状态切换"],
  ["--ease-enter", "进入：快启动、长减速"],
  ["--ease-exit", "退出：加速离场"],
  ["--ease-emphasized", "空间位移、对话框"],
  ["--ease-spring-snap", "小物体归位（超调 1.5%）"],
  ["--ease-spring-pop", "开关、勾选（超调 8%）"],
];

const playDur = ref(false);
const playEase = ref(false);
const open = ref(false);
</script>

<template>
  <DocPage lead="动效解释因果：东西从哪来、到哪去、现在处于什么状态。它不表演，不抢注意力，只动 transform、opacity 与颜色。">
    <DocSection title="时长">
      <div class="doc-row" style="margin-bottom: var(--space-3)">
        <Button size="sm" severity="secondary" :label="playDur ? '复位' : '播放'" @click="playDur = !playDur" />
      </div>
      <div class="tracks">
        <div v-for="[t, u] in durations" :key="t" class="track">
          <code>{{ t }}</code><span class="track__use">{{ u }}</span>
          <div class="track__rail">
            <span class="track__dot" :class="{ 'is-on': playDur }" :style="{ transitionDuration: `var(${t})`, transitionTimingFunction: 'var(--ease-standard)' }" />
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection title="曲线">
      <div class="doc-row" style="margin-bottom: var(--space-3)">
        <Button size="sm" severity="secondary" :label="playEase ? '复位' : '播放'" @click="playEase = !playEase" />
      </div>
      <div class="tracks">
        <div v-for="[t, u] in easings" :key="t" class="track">
          <code>{{ t }}</code><span class="track__use">{{ u }}</span>
          <div class="track__rail">
            <span class="track__dot" :class="{ 'is-on': playEase }" :style="{ transitionDuration: 'var(--duration-slower)', transitionTimingFunction: `var(${t})` }" />
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection title="浮层进出" desc="进入 = 透明度 + 自锚点方向 4px 位移 + 0.97 缩放（base · enter）；退出只淡出（instant · exit），约为进入的 60%。">
      <div class="doc-row">
        <Button severity="secondary" :label="open ? '收起' : '展开浮层'" @click="open = !open" />
      </div>
      <div class="pop-stage">
        <Transition name="dl-pop">
          <div v-if="open" class="pop mw-frost">
            <b>插入引用</b>
            <span>在当前光标处插入 [1] Smith 2024</span>
          </div>
        </Transition>
      </div>
    </DocSection>

    <DocSection title="规则">
      <ul class="doc-rules">
        <li data-kind="do">hover / 按下只过渡颜色与背景（fast · standard）；不做位移、不做缩放。</li>
        <li data-kind="do">弹簧只给小物体归位（位移 &lt; 24px 或缩放），时长 ≤ base；开关滑块、勾选、按钮松手。</li>
        <li data-kind="dont">转场、抽屉、面板位移禁止弹簧——大位移上的弹簧显得廉价。</li>
        <li data-kind="dont"><span class="doc-code">filter</span> / <span class="doc-code">backdrop-filter</span> 不进 transition 与 keyframes（逐帧重算 = 掉帧）。</li>
        <li>系统开启「减少动态效果」时，只保留透明度变化。一屏同时运动的区域不超过两处。</li>
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
