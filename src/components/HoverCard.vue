<script setup lang="ts">
/**
 * HoverCard — liquid glass、可放任意 Vue 内容的富 tooltip。
 *
 * 分工：纯文本提示继续用 `v-tooltip`；富内容走本组件（PrimeVue Tooltip 是
 * 指令，内容只吃字符串/HTML 字符串，放不进组件和插槽，`mw-bubble` 那条
 * escape:false 手拼 HTML 的路线就到头了）。面板与浮层同款玻璃
 * （--material-* 四件套），不带箭头——悬浮偏移已足够表达指向。
 *
 * 定位（防漂移的关键，与 useComboPanel 同一模型）：
 *   • panel 传送门挂 body + `position: fixed`，坐标取 getBoundingClientRect
 *     的视口系——fixed 与 rect 同坐标系，不经过 document 坐标换算，body 滚动
 *     与 transform 祖先都不会漂；
 *   • 展开期间监听 **捕获阶段** 的 scroll（scroll 不冒泡，但 window 上的捕获
 *     监听能收到任何内部滚动容器——本仓到处是 `.mw-scroll` 内滚布局，只听
 *     window scroll 会漏）、resize、panel/锚点的 ResizeObserver（异步内容
 *     长高、锚点自身变化都重算），每帧重新对准锚点而不是藏起来；
 *   • 锚点被滚出视口时收起（此时鼠标事件不会再来了，不收就悬空）。
 *
 * 展示逻辑：hover 进出各带延迟（showDelay 防扫过乱弹，hideDelay 是从锚点
 * 移进面板的指针桥）；`interactive: false` 时面板不吃指针，退化为纯提示。
 */
import { nextTick, onBeforeUnmount, ref, useId, watch } from "vue";

import {
  computeHoverCardPosition,
  isRectOutsideViewport,
  type HoverCardPlacement,
} from "../lib/hover-card";

const props = withDefaults(
  defineProps<{
    /** 期望方向；视口放不下且对侧更宽裕时自动翻转。 */
    placement?: HoverCardPlacement;
    /** 悬停多久后展开（防指针扫过乱弹）。 */
    showDelay?: number;
    /** 离开多久后收起（也是移进面板的指针桥时长）。 */
    hideDelay?: number;
    /** 允许指针移进面板停留/点击；false = 纯提示（pointer-events:none）。 */
    interactive?: boolean;
    /** 交互弹层的可访问名称，由宿主按当前语言注入。 */
    label?: string;
    disabled?: boolean;
    /**
     * wrapper 用块级盒（默认 inline-flex）。包住侧栏/列表里整行 div 时用，
     * 行保持占满父容器宽度；行内片段（截断标题、按钮）用默认。
     */
    block?: boolean;
    /**
     * 给 wrapper 一个焦点入口（键盘/读屏）。trigger 本身是可聚焦控件
     * （button/input）时设 false，避免双重 tab 停靠；focusin 仍会触发。
     */
    focusable?: boolean;
  }>(),
  {
    placement: "top",
    showDelay: 150,
    hideDelay: 150,
    interactive: true,
    label: "Details",
    disabled: false,
    block: false,
    focusable: true,
  },
);

const emit = defineEmits<{ show: []; hide: [] }>();

// 多根组件（锚点 span + Teleport），attrs 不透传会丢；显式落到锚点上，
// 调用方可以用 class 控制锚点盒（如 tw:flex-1 tw:min-w-0 嵌进截断行）。
defineOptions({ inheritAttrs: false });

const anchorRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const open = ref(false);
const side = ref<HoverCardPlacement>(props.placement);
const panelStyle = ref<Record<string, string>>({});

// 挂件 id 只求 body 内唯一（同页多实例不串 aria-describedby）。
const panelId = `mw-hovercard-${useId()}`;
let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
/** 本轮 hover 的进入时刻；timer 被 Chromium 节流钳制时由 mousemove 按它兜底。 */
let enteredAt: number | null = null;
let resizeObserver: ResizeObserver | null = null;

function clearTimers() {
  if (showTimer) clearTimeout(showTimer);
  if (hideTimer) clearTimeout(hideTimer);
  showTimer = null;
  hideTimer = null;
  enteredAt = null;
}

function reposition() {
  const anchorEl = anchorRef.value;
  const panelEl = panelRef.value;
  if (!anchorEl || !panelEl || !open.value) return;
  const rect = anchorEl.getBoundingClientRect();
  if (isRectOutsideViewport(rect, { width: window.innerWidth, height: window.innerHeight })) {
    hideNow();
    return;
  }
  const pos = computeHoverCardPosition({
    anchor: rect,
    panel: { width: panelEl.offsetWidth, height: panelEl.offsetHeight },
    viewport: { width: window.innerWidth, height: window.innerHeight },
    placement: props.placement,
  });
  side.value = pos.side;
  panelStyle.value = {
    position: "fixed",
    left: `${Math.round(pos.left)}px`,
    top: `${Math.round(pos.top)}px`,
    zIndex: "var(--z-floating)",
  };
}

// 开合

function showNow() {
  if (open.value || props.disabled) return;
  clearTimers();
  open.value = true;
  bind();
  emit("show");
  // 两段式：先按当前（未量测）尺寸出个初值，渲染出面板后下一帧按实测尺寸精修。
  nextTick(() => {
    reposition();
    requestAnimationFrame(reposition);
  });
}

function hideNow() {
  if (!open.value) return;
  clearTimers();
  open.value = false;
  unbind();
  emit("hide");
}

function scheduleShow() {
  if (props.disabled) return;
  clearTimers();
  if (open.value) return;
  enteredAt = performance.now();
  showTimer = setTimeout(showNow, props.showDelay);
}

// 嵌入式窗口被 Chromium 判定遮挡时 setTimeout 会被钳到分钟级，只靠 timer 的
// 延迟出场变成「永不弹」；指针事件不经过节流，过了 showDelay 就地兜底。
function onMousemove() {
  if (!showTimer || enteredAt == null) return;
  if (performance.now() - enteredAt < props.showDelay) return;
  showNow();
}

function scheduleHide() {
  clearTimers();
  if (!open.value) return;
  hideTimer = setTimeout(hideNow, props.hideDelay);
}

// 展开期间的监听

function onScrollOrResize() {
  reposition();
}

function hideAndRefocus() {
  hideNow();
  anchorRef.value?.focus();
}

function onDocKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") hideAndRefocus();
}

function bind() {
  window.addEventListener("scroll", onScrollOrResize, true);
  window.addEventListener("resize", onScrollOrResize);
  document.addEventListener("keydown", onDocKeydown, true);
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(onScrollOrResize);
    if (panelRef.value) resizeObserver.observe(panelRef.value);
    if (anchorRef.value) resizeObserver.observe(anchorRef.value);
  }
}

function unbind() {
  window.removeEventListener("scroll", onScrollOrResize, true);
  window.removeEventListener("resize", onScrollOrResize);
  document.removeEventListener("keydown", onDocKeydown, true);
  resizeObserver?.disconnect();
  resizeObserver = null;
}

watch(
  () => props.placement,
  () => {
    if (open.value) reposition();
  },
);
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) hideNow();
  },
);

onBeforeUnmount(() => {
  clearTimers();
  unbind();
});

// 事件入口

function onAnchorFocusOut(e: FocusEvent) {
  // 焦点移进面板（键盘用户 tab 进交互内容）时不收。
  if (e.relatedTarget && panelRef.value?.contains(e.relatedTarget as Node)) return;
  scheduleHide();
}

function onPanelFocusOut(e: FocusEvent) {
  const to = e.relatedTarget as Node | null;
  if (to && (panelRef.value?.contains(to) || anchorRef.value?.contains(to))) return;
  scheduleHide();
}

function panelFocusables(): HTMLElement[] {
  return Array.from(
    panelRef.value?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? [],
  );
}

function onAnchorKeydown(event: KeyboardEvent) {
  if (event.key !== "Tab" || event.shiftKey || !open.value || !props.interactive) return;
  const first = panelFocusables()[0];
  if (!first) return;
  event.preventDefault();
  first.focus();
}

function onPanelKeydown(event: KeyboardEvent) {
  if (event.key !== "Tab" || !props.interactive) return;
  const focusables = panelFocusables();
  const first = focusables[0];
  const last = focusables.at(-1);
  if (!first || !last) return;
  if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
    event.preventDefault();
    hideAndRefocus();
  }
}

function cancelHide() {
  clearTimers();
}
</script>

<template>
  <span
    ref="anchorRef"
    v-bind="$attrs"
    class="mw-hovercard"
    :class="{ 'mw-hovercard--block': block }"
    :tabindex="focusable && !disabled ? 0 : undefined"
    :aria-describedby="open && !interactive ? panelId : undefined"
    :aria-expanded="interactive ? open : undefined"
    :aria-controls="interactive && open ? panelId : undefined"
    :aria-haspopup="interactive ? 'dialog' : undefined"
    @mouseenter="scheduleShow"
    @mousemove="onMousemove"
    @mouseleave="scheduleHide"
    @focusin="scheduleShow"
    @focusout="onAnchorFocusOut"
    @keydown="onAnchorKeydown"
    @click="hideNow"
  >
    <slot />
  </span>

  <Teleport to="body">
    <Transition name="mw-hovercard">
      <div
        v-if="open"
        :id="panelId"
        ref="panelRef"
        :role="interactive ? 'dialog' : 'tooltip'"
        :aria-label="interactive ? label : undefined"
        class="mw-hovercard__panel"
        :class="[`mw-hovercard__panel--${side}`, { 'mw-hovercard__panel--static': !interactive }]"
        :style="panelStyle"
        @mouseenter="cancelHide"
        @mouseleave="scheduleHide"
        @focusin="cancelHide"
        @focusout="onPanelFocusOut"
        @keydown="onPanelKeydown"
      >
        <slot name="content" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 锚点 wrapper：inline-flex 不打断文本流（同 AtUser 根节点的处理），
   且给定位一个稳定的盒子。 */
.mw-hovercard {
  display: inline-flex;
  vertical-align: baseline;
}

.mw-hovercard--block {
  display: block;
}

.mw-hovercard:focus-visible {
  outline: 0;
  border-radius: var(--radius-sm);
  box-shadow: var(--effect-focus-ring);
}

/* 面板样式（.mw-hovercard__panel 玻璃、--static、出入场过渡）在 styles.css
   全局——v-tooltip 指令创建的 DOM 没有本组件的 scoped 属性，两处共用一枚面板。 */
</style>
