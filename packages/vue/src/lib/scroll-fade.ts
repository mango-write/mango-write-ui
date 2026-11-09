import type { Directive, DirectiveBinding } from "vue";
import {
  computeScrollFadeState,
  type ScrollFadeBinding,
  type ScrollFadeMetrics,
  type ScrollFadeOptions,
  type ScrollFadeSize,
  type ScrollFadeState,
  type ScrollFadeX,
  type ScrollFadeY,
} from "@mango-write/ui-core/headless/scroll-fade-core";

export {
  computeScrollFadeState,
  type ScrollFadeBinding,
  type ScrollFadeMetrics,
  type ScrollFadeOptions,
  type ScrollFadeSize,
  type ScrollFadeState,
  type ScrollFadeX,
  type ScrollFadeY,
};

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
