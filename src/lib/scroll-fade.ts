/**
 * 滚动边缘渐隐（Scroll Edge Fade）—— 动态感知滚动容器的溢出方向，
 * 在有内容滚出/待滚入的出口边缘写入 `data-scroll-fade-y="top|bottom|both"` 与
 * `data-scroll-fade-x="left|right|both"`，由 `base.css` 的 `mask-image` 施加渐变遮罩。
 * 滚到顶/底/左/右尽头时对应侧自动移除遮罩，恢复清晰边界。
 */
import type { Directive, DirectiveBinding } from "vue";

export type ScrollFadeY = "top" | "bottom" | "both" | null;
export type ScrollFadeX = "left" | "right" | "both" | null;
export type ScrollFadeSize = "md" | "sm";

export interface ScrollFadeMetrics {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
}

export interface ScrollFadeState {
  y: ScrollFadeY;
  x: ScrollFadeX;
}

export interface ScrollFadeOptions {
  size?: ScrollFadeSize;
  /** 内部吸顶表头选择器（如 `.mw-datatable__thead`），顶部渐隐起点自动下移到吸顶层下方。 */
  stickyHeader?: string;
  disabled?: boolean;
}

export type ScrollFadeBinding = ScrollFadeOptions | boolean | undefined;

const EPSILON = 1;

export function computeScrollFadeState(metrics: ScrollFadeMetrics): ScrollFadeState {
  const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = metrics;

  let y: ScrollFadeY = null;
  if (clientHeight > 0 && scrollHeight - clientHeight > EPSILON) {
    const hasTop = scrollTop > EPSILON;
    const hasBottom = scrollHeight - clientHeight - scrollTop > EPSILON;
    if (hasTop && hasBottom) y = "both";
    else if (hasTop) y = "top";
    else if (hasBottom) y = "bottom";
  }

  let x: ScrollFadeX = null;
  if (clientWidth > 0 && scrollWidth - clientWidth > EPSILON) {
    const hasLeft = scrollLeft > EPSILON;
    const hasRight = scrollWidth - clientWidth - scrollLeft > EPSILON;
    if (hasLeft && hasRight) x = "both";
    else if (hasLeft) x = "left";
    else if (hasRight) x = "right";
  }

  return { y, x };
}

function setOrRemoveAttr(el: HTMLElement, attr: string, value: string | null) {
  if (value) {
    if (el.getAttribute(attr) !== value) el.setAttribute(attr, value);
  } else if (el.hasAttribute(attr)) {
    el.removeAttribute(attr);
  }
}

export function syncScrollFade(el: HTMLElement, options: ScrollFadeOptions = {}): ScrollFadeState {
  if (options.disabled) {
    setOrRemoveAttr(el, "data-scroll-fade-y", null);
    setOrRemoveAttr(el, "data-scroll-fade-x", null);
    el.style.removeProperty("--mw-scroll-fade-top-offset");
    return { y: null, x: null };
  }

  const state = computeScrollFadeState({
    scrollTop: el.scrollTop,
    scrollLeft: el.scrollLeft,
    scrollHeight: el.scrollHeight,
    scrollWidth: el.scrollWidth,
    clientHeight: el.clientHeight,
    clientWidth: el.clientWidth,
  });

  setOrRemoveAttr(el, "data-scroll-fade-y", state.y);
  setOrRemoveAttr(el, "data-scroll-fade-x", state.x);

  if (options.stickyHeader && (state.y === "top" || state.y === "both")) {
    const header = el.querySelector<HTMLElement>(options.stickyHeader);
    const headerHeight = header?.offsetHeight ?? 0;
    if (headerHeight > 0) {
      el.style.setProperty("--mw-scroll-fade-top-offset", `${headerHeight}px`);
    } else {
      el.style.removeProperty("--mw-scroll-fade-top-offset");
    }
  } else {
    el.style.removeProperty("--mw-scroll-fade-top-offset");
  }

  return state;
}

export interface ScrollFadeController {
  sync: () => ScrollFadeState;
  update: (options: ScrollFadeOptions) => void;
  dispose: () => void;
}

function applySizeClasses(el: HTMLElement, options: ScrollFadeOptions) {
  if (options.disabled) {
    el.classList.remove("mw-scroll-fade", "mw-scroll-fade--sm");
    return;
  }
  el.classList.add("mw-scroll-fade");
  el.classList.toggle("mw-scroll-fade--sm", options.size === "sm");
}

export function attachScrollFade(
  el: HTMLElement,
  initialOptions: ScrollFadeOptions = {},
): ScrollFadeController {
  let opts: ScrollFadeOptions = { ...initialOptions };
  let rafId: number | null = null;
  let observedChild: Element | null = null;

  applySizeClasses(el, opts);

  const sync = () => syncScrollFade(el, opts);
  const onScroll = () => {
    sync();
  };

  el.addEventListener("scroll", onScroll, { passive: true });

  const resizeObserver =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => sync()) : null;
  resizeObserver?.observe(el);

  function syncObservedChild() {
    if (!resizeObserver) return;
    const nextChild = el.firstElementChild;
    if (nextChild === observedChild) return;
    if (observedChild) resizeObserver.unobserve(observedChild);
    observedChild = nextChild;
    if (observedChild) resizeObserver.observe(observedChild);
  }
  syncObservedChild();

  const mutationObserver =
    typeof MutationObserver !== "undefined"
      ? new MutationObserver(() => {
          syncObservedChild();
          sync();
        })
      : null;
  mutationObserver?.observe(el, { childList: true, subtree: true });

  sync();
  if (typeof requestAnimationFrame === "function") {
    rafId = requestAnimationFrame(() => {
      rafId = null;
      sync();
    });
  }

  return {
    sync,
    update(nextOptions: ScrollFadeOptions) {
      opts = { ...nextOptions };
      applySizeClasses(el, opts);
      syncObservedChild();
      sync();
    },
    dispose() {
      if (rafId != null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      el.removeEventListener("scroll", onScroll);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      observedChild = null;
      setOrRemoveAttr(el, "data-scroll-fade-y", null);
      setOrRemoveAttr(el, "data-scroll-fade-x", null);
      el.style.removeProperty("--mw-scroll-fade-top-offset");
    },
  };
}

type HostEl = HTMLElement & { __mwScrollFade?: ScrollFadeController };

function resolveDirectiveOptions(binding: DirectiveBinding<ScrollFadeBinding>): ScrollFadeOptions {
  const val = binding.value;
  if (val === false) {
    return { disabled: true };
  }
  const fromValue: ScrollFadeOptions = typeof val === "object" && val !== null ? val : {};
  return {
    size: fromValue.size ?? (binding.modifiers.sm ? "sm" : "md"),
    stickyHeader: fromValue.stickyHeader,
    disabled: fromValue.disabled ?? false,
  };
}

export const vScrollFade: Directive<HostEl, ScrollFadeBinding> = {
  mounted(el, binding) {
    el.__mwScrollFade = attachScrollFade(el, resolveDirectiveOptions(binding));
  },
  updated(el, binding) {
    if (!el.__mwScrollFade) {
      el.__mwScrollFade = attachScrollFade(el, resolveDirectiveOptions(binding));
      return;
    }
    el.__mwScrollFade.update(resolveDirectiveOptions(binding));
  },
  unmounted(el) {
    el.__mwScrollFade?.dispose();
    delete el.__mwScrollFade;
  },
};
