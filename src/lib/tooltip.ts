/**
 * v-tooltip —— 纯文本 tooltip 指令（自研，**不是 PrimeVue Tooltip**）。
 *
 * 底座与 HoverCard 同源：定位走 ./hover-card.ts 的 computeHoverCardPosition
 *（fixed + 视口系坐标 + 翻转/夹紧 + 出视口收起），面板复用全局
 * `.mw-hovercard__panel` 玻璃样式（styles.css——指令创建的 DOM 没有组件的
 * scoped 属性，面板样式必须是全局的），与 PrimeVue 浮层同配方、不带箭头。
 *
 * 用法：值只接字符串；方向用修饰符 `.top`（默认）/`.right`/`.bottom`/`.left`。
 * 富内容（组件、按钮、多行结构）不要往这里塞，用 HoverCard 组件。
 */
import type { Directive, DirectiveBinding } from "vue";

import {
  computeHoverCardPosition,
  isRectOutsideViewport,
  type HoverCardPlacement,
} from "./hover-card";

/** 与 HoverCard 的 showDelay 同值：防指针扫过乱弹。 */
const SHOW_DELAY = 150;

let seq = 0;

interface TooltipState {
  value: string;
  placement: HoverCardPlacement;
  panel: HTMLElement | null;
  panelId: string;
  showTimer: ReturnType<typeof setTimeout> | null;
  /** 本轮 hover 的进入时刻；timer 被 Chromium 节流钳制时由 mousemove 按它兜底。 */
  enteredAt: number | null;
  resizeObserver: ResizeObserver | null;
  /** 展开期间挂的 scroll/resize 监听（hide 时要摘，必须持有引用）。 */
  onMove: EventListener | null;
  /** 挂在宿主上的事件 handler（type → handler），unmounted 时摘除。 */
  handlers: Record<string, EventListener>;
}

type HostEl = HTMLElement & { __mwTooltip?: TooltipState };

function placementOf(binding: DirectiveBinding): HoverCardPlacement {
  if (binding.modifiers.bottom) return "bottom";
  if (binding.modifiers.left) return "left";
  if (binding.modifiers.right) return "right";
  return "top";
}

function reposition(el: HostEl, st: TooltipState) {
  const panel = st.panel;
  if (!panel) return;
  const rect = el.getBoundingClientRect();
  if (isRectOutsideViewport(rect, { width: window.innerWidth, height: window.innerHeight })) {
    hide(el, st);
    return;
  }
  const pos = computeHoverCardPosition({
    anchor: rect,
    panel: { width: panel.offsetWidth, height: panel.offsetHeight },
    viewport: { width: window.innerWidth, height: window.innerHeight },
    placement: st.placement,
  });
  panel.style.position = "fixed";
  panel.style.left = `${Math.round(pos.left)}px`;
  panel.style.top = `${Math.round(pos.top)}px`;
  panel.style.zIndex = "2000";
}

function show(el: HostEl, st: TooltipState) {
  if (st.panel || !st.value) return;
  const panel = document.createElement("div");
  panel.id = st.panelId;
  panel.className = "mw-hovercard__panel mw-hovercard__panel--static";
  panel.setAttribute("role", "tooltip");
  panel.textContent = st.value;
  document.body.appendChild(panel);
  st.panel = panel;
  el.setAttribute("aria-describedby", st.panelId);
  // 展开期间跟滚动/缩放/锚点尺寸变化（捕获阶段 scroll，同 HoverCard 的口径）。
  const onMove = () => reposition(el, st);
  st.onMove = onMove;
  window.addEventListener("scroll", onMove, true);
  window.addEventListener("resize", onMove);
  st.resizeObserver =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(onMove) : null;
  st.resizeObserver?.observe(el);
  // 两段式：先按当前尺寸出初值，渲染出面板后下一帧按实测尺寸精修。
  reposition(el, st);
  requestAnimationFrame(() => {
    if (st.panel) reposition(el, st);
  });
}

function hide(el: HostEl, st: TooltipState) {
  if (st.showTimer) {
    clearTimeout(st.showTimer);
    st.showTimer = null;
  }
  if (st.onMove) {
    window.removeEventListener("scroll", st.onMove, true);
    window.removeEventListener("resize", st.onMove);
    st.onMove = null;
  }
  st.resizeObserver?.disconnect();
  st.resizeObserver = null;
  st.enteredAt = null;
  if (!st.panel) return;
  st.panel.remove();
  st.panel = null;
  el.removeAttribute("aria-describedby");
}

function scheduleShow(el: HostEl, st: TooltipState) {
  if (!st.value || st.panel || st.showTimer) return;
  st.enteredAt = performance.now();
  st.showTimer = setTimeout(() => {
    st.showTimer = null;
    show(el, st);
  }, SHOW_DELAY);
}

const listeners: Array<[string, (el: HostEl, st: TooltipState, e: Event) => void]> = [
  ["mouseenter", (el, st) => scheduleShow(el, st)],
  ["focusin", (el, st) => scheduleShow(el, st)],
  [
    // 嵌入式窗口被 Chromium 判定遮挡时 setTimeout 会被钳到分钟级，只靠 timer
    // 的延迟出场变成「永不弹」；指针事件不经过节流，过了 SHOW_DELAY 就地兜底。
    "mousemove",
    (el, st) => {
      if (!st.showTimer || st.enteredAt == null) return;
      if (performance.now() - st.enteredAt < SHOW_DELAY) return;
      clearTimeout(st.showTimer);
      st.showTimer = null;
      show(el, st);
    },
  ],
  ["mouseleave", (el, st) => hide(el, st)],
  ["focusout", (el, st) => hide(el, st)],
  ["click", (el, st) => hide(el, st)],
  [
    "keydown",
    (el, st, e) => {
      if ((e as KeyboardEvent).key === "Escape") hide(el, st);
    },
  ],
];

export const vTooltip: Directive<HostEl, string> = {
  mounted(el, binding) {
    const st: TooltipState = {
      value: String(binding.value ?? ""),
      placement: placementOf(binding),
      panel: null,
      panelId: `mw-tooltip-${++seq}`,
      showTimer: null,
      enteredAt: null,
      resizeObserver: null,
      onMove: null,
      handlers: {},
    };
    el.__mwTooltip = st;
    for (const [type, fn] of listeners) {
      const handler = (e: Event) => fn(el, st, e);
      st.handlers[type] = handler;
      el.addEventListener(type, handler);
    }
  },
  updated(el, binding) {
    const st = el.__mwTooltip;
    if (!st) return;
    st.value = String(binding.value ?? "");
    st.placement = placementOf(binding);
    if (!st.panel) return;
    if (!st.value) {
      hide(el, st);
      return;
    }
    st.panel.textContent = st.value;
    reposition(el, st);
  },
  unmounted(el) {
    const st = el.__mwTooltip;
    if (!st) return;
    hide(el, st);
    for (const [type, handler] of Object.entries(st.handlers)) {
      el.removeEventListener(type, handler);
    }
    delete el.__mwTooltip;
  },
};
