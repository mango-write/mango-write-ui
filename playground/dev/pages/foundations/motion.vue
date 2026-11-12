<script setup lang="ts">
import { ref } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { Button, useThemePreference } from "@mango-write/ui-vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import { t, type Bi } from "../../i18n";

const { resolved: resolvedTheme, toggleTheme } = useThemePreference();

const durations = [
  { token: "--duration-instant", use: { zh: "70ms · 瞬态：浮层退出、tooltip", en: "70ms · Instant: overlay exit, tooltips" } },
  { token: "--duration-fast", use: { zh: "110ms · 微交互：hover / 按下 / 颜色切换", en: "110ms · Micro: hover / press / color switches" } },
  { token: "--speed-fast", use: { zh: "180ms · 快档（--duration-base）：浮层进入、区域过渡", en: "180ms · Fast (--duration-base): overlay enter, region transitions" } },
  { token: "--speed-medium", use: { zh: "290ms · 中档（--duration-slow）：对话框进入、图标旋转", en: "290ms · Medium (--duration-slow): dialog enter, icon morph" } },
  { token: "--duration-slower", use: { zh: "470ms · 空间：页面级空间转场", en: "470ms · Spatial: page-level spatial transitions" } },
  { token: "--speed-slow", use: { zh: "760ms · 慢档：全屏主题径向揭幕", en: "760ms · Slow tier: full-screen theme radial reveal" } },
];
const easings = [
  { token: "--ease-standard", use: { zh: "cubic-bezier(0.382, 0, 0.236, 1) · 38.2% 蓄力 + 61.8% 缓冲", en: "cubic-bezier(0.382, 0, 0.236, 1) · 38.2% accel + 61.8% decel" } },
  { token: "--ease-enter", use: { zh: "cubic-bezier(0.146, 0.618, 0.382, 1) · 黄金入场着陆", en: "cubic-bezier(0.146, 0.618, 0.382, 1) · Golden enter settle" } },
  { token: "--ease-exit", use: { zh: "cubic-bezier(0.382, 0, 0.764, 0.236) · 黄金蓄力离场", en: "cubic-bezier(0.382, 0, 0.764, 0.236) · Golden exit accelerate" } },
  { token: "--ease-emphasized", use: { zh: "cubic-bezier(0.236, 0.618, 0.382, 1) · 模态与大位移", en: "cubic-bezier(0.236, 0.618, 0.382, 1) · Modals & spatial movement" } },
  { token: "--ease-golden", use: { zh: "cubic-bezier(0.382, 0, 0.618, 1) · 对称黄金 S 曲线（主题揭幕）", en: "cubic-bezier(0.382, 0, 0.618, 1) · Symmetric golden S-curve (theme reveal)" } },
  { token: "--ease-apple-default", use: { zh: "cubic-bezier(0.25, 0.1, 0.25, 1) · Apple 系统默认", en: "cubic-bezier(0.25, 0.1, 0.25, 1) · Apple system default" } },
  { token: "--ease-apple-sheet", use: { zh: "cubic-bezier(0.32, 0.72, 0, 1) · iOS Sheet 气垫阻尼", en: "cubic-bezier(0.32, 0.72, 0, 1) · iOS Sheet cushion damping" } },
  { token: "--ease-apple-out", use: { zh: "cubic-bezier(0.16, 1, 0.3, 1) · Apple Keynote 丝滑揭幕", en: "cubic-bezier(0.16, 1, 0.3, 1) · Apple Keynote smooth out" } },
  { token: "--ease-spring-snap", use: { zh: "小物体归位（超调 1.5%）", en: "Small objects settling (1.5% overshoot)" } },
  { token: "--ease-spring-pop", use: { zh: "开关、勾选、图标回弹（超调 8%）", en: "Switches, checkboxes, icon pop (8% overshoot)" } },
];

const playDur = ref(false);
const playEase = ref(false);
const open = ref(false);

const choreography: { tier: string; trigger: Bi; recipe: string; rule: Bi }[] = [
  {
    tier: "M1",
    trigger: { zh: "触觉微反馈（按压 / 悬停 / 获焦）", en: "Tactile micro-feedback (press / hover / focus)" },
    recipe: "110ms · --ease-standard",
    rule: { zh: "桌面动色彩与阴影；移动触控叠加 0.97 弹性微缩。", en: "Desktop transitions color/shadow; mobile touch adds 0.97 press scale." },
  },
  {
    tier: "M2",
    trigger: { zh: "轨内归属游走（Tab 胶囊 / 分段 / 开关）", en: "In-rail indicator travel (tabs / segmented / switch)" },
    recipe: "180–290ms · --ease-emphasized",
    rule: { zh: "指示物常驻 DOM，只动 translateX，禁止旧灭新亮闪烁。", en: "Keep indicator mounted and animate translateX; never blink-swap." },
  },
  {
    tier: "M3",
    trigger: { zh: "同轨容器形变（导航展开 ↔ 折叠输入舱）", en: "Single-rail morphing (nav pill ↔ collapsed composer)" },
    recipe: "290ms · --ease-emphasized",
    rule: { zh: "严禁 v-if 拆建外壳与 max-width 互搏；单一 flex-grow 守恒推拉（禁用 x2=0 曲线防尾段 1px 顿挫）+ 内部错峰淡入。", en: "Never teardown shell via v-if; drive rail morph via single flex-grow (--ease-emphasized avoids 1px tail stepping) + staggered inner fade." },
  },
  {
    tier: "M4",
    trigger: { zh: "浮层进出场（Sheet / Dialog / Toast）", en: "Overlay enter & exit (Sheet / Dialog / Toast)" },
    recipe: "In 180–290ms · Out ×0.618",
    rule: { zh: "有进必有出：离场挂 pointer-events: none 播完下滑/微缩淡出再卸载。", en: "Every enter has a 0.618× exit with pointer-events: none before unmount." },
  },
  {
    tier: "M5",
    trigger: { zh: "区域与视口换装（页签面板 / 四态 / 主题）", en: "Region & viewport transitions (panels / states / theme)" },
    recipe: "180ms / 760ms · --ease-apple-out",
    rule: { zh: "区域交叉淡入（禁用 out-in）；全屏主题按点击圆心径向揭幕。", en: "Cross-fade regions without out-in; radially reveal full-screen themes." },
  },
];

const s = {
  durationsTitle: { zh: "快 · 中 · 慢三档速度与黄金时长阶梯（×1.618）", en: "Fast · Medium · Slow speeds & golden duration scale (×1.618)" },
  easingsTitle: { zh: "黄金分割与 Apple 曲线族", en: "Golden ratio & Apple easing curves" },
  play: { zh: "播放", en: "Play" },
  reset: { zh: "复位", en: "Reset" },
  overlayTitle: { zh: "浮层进出", en: "Overlay enter & exit" },
  overlayDesc: {
    zh: "进入 = 透明度 + 自锚点方向 4px 位移 + 0.97 缩放（base 290ms · enter）；退出只淡出（instant 110ms · exit），时长严格满足黄金比 1/Φ ≈ 61.8%。",
    en: "Enter = opacity + a 4px offset along the anchor direction + 0.97 scale (base 290ms · enter); exit only fades out (instant 110ms · exit), following the golden ratio 1/Φ ≈ 61.8%.",
  },
  expandOverlay: { zh: "展开浮层", en: "Expand overlay" },
  collapse: { zh: "收起", en: "Collapse" },
  insertCitation: { zh: "插入引用", en: "Insert citation" },
  insertCitationDesc: { zh: "在当前光标处插入 [1] Smith 2024", en: "Inserts [1] Smith 2024 at the current cursor" },
  themeRevealTitle: { zh: "主题切换 · 径向揭幕", en: "Theme switch · radial reveal" },
  themeRevealDesc: {
    zh: "基于 View Transitions API，以触发点为圆心，按慢档 --speed-slow（760ms）与 --ease-apple-out（0.16, 1, 0.3, 1）向外扩散新主题快照；不支持环境自动降级为色彩淡入。",
    en: "Built on the View Transitions API, expanding the new theme snapshot radially from the trigger point with --speed-slow (760ms) and --ease-apple-out (0.16, 1, 0.3, 1); falls back to a color cross-fade where unsupported.",
  },
  themeSwitchToDark: { zh: "切换至深色（从此处扩散）", en: "Switch to dark (ripple from here)" },
  themeSwitchToLight: { zh: "切换至浅色（从此处扩散）", en: "Switch to light (ripple from here)" },
  themeStageHint: {
    zh: "点击下方画布任意位置或顶栏主题开关，观察从点击坐标出发的径向揭幕：",
    en: "Click anywhere on the canvas below or the topbar theme switcher to see the radial reveal from the click point:",
  },
  matrixTitle: { zh: "M1–M5 触发与编排矩阵（何时必须上什么动画）", en: "M1–M5 trigger & choreography matrix" },
  matrixDesc: {
    zh: "所有状态变化按物理尺度归入五级判据：同轨与指示物保持常驻做连续位移/形变，模态浮层有进必有出，绝不用 v-if 硬切制造闪跳。",
    en: "Every state change maps to five physical tiers: keep rail capsules and indicators mounted for continuous motion, pair every overlay enter with an asymmetric exit, and never flash-cut via bare v-if.",
  },
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

    <DocSection :title="s.themeRevealTitle" :desc="s.themeRevealDesc">
      <div
        class="theme-stage"
        role="button"
        tabindex="0"
        @click="toggleTheme($event)"
        @keydown.enter.prevent="toggleTheme($event)"
        @keydown.space.prevent="toggleTheme($event)"
      >
        <span class="theme-stage__hint">{{ t(s.themeStageHint) }}</span>
        <div class="doc-row">
          <Button
            :icon="resolvedTheme === 'dark' ? Sun : Moon"
            :label="resolvedTheme === 'dark' ? t(s.themeSwitchToLight) : t(s.themeSwitchToDark)"
            @click.stop="toggleTheme($event)"
          />
        </div>
      </div>
    </DocSection>

    <DocSection :title="s.matrixTitle" :desc="s.matrixDesc">
      <table class="doc-table">
        <thead>
          <tr>
            <th>{{ t({ zh: "等级", en: "Tier" }) }}</th>
            <th>{{ t({ zh: "触发时机", en: "Trigger" }) }}</th>
            <th>{{ t({ zh: "时长 × 曲线", en: "Duration × Curve" }) }}</th>
            <th>{{ t({ zh: "编排规则", en: "Choreography Rule" }) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in choreography" :key="item.tier">
            <td><strong>{{ item.tier }}</strong></td>
            <td>{{ t(item.trigger) }}</td>
            <td><code>{{ item.recipe }}</code></td>
            <td>{{ t(item.rule) }}</td>
          </tr>
        </tbody>
      </table>
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
  grid-template-columns: 180px 320px 1fr;
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

.theme-stage {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-card);
  border: var(--border-width) dashed var(--border-default);
  background: var(--bg-sunken);
  cursor: pointer;
  user-select: none;
  transition: border-color var(--duration-fast) var(--ease-standard);
}

.theme-stage:hover {
  border-color: var(--border-strong);
}

.theme-stage__hint {
  color: var(--text-secondary);
  font-size: var(--type-body-sm-size);
}
</style>
