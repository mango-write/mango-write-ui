import { useEffect, useMemo, useRef, type Ref, type RefCallback } from "react";
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

export function syncScrollFade(
  el: HTMLElement,
  options: ScrollFadeOptions = {},
): ScrollFadeState {
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
      el.classList.remove("mw-scroll-fade", "mw-scroll-fade--sm");
      setOrRemoveAttr(el, "data-scroll-fade-y", null);
      setOrRemoveAttr(el, "data-scroll-fade-x", null);
      el.style.removeProperty("--mw-scroll-fade-top-offset");
    },
  };
}

function normalizeScrollFadeBinding(binding?: ScrollFadeBinding): ScrollFadeOptions {
  if (binding === false) {
    return { disabled: true };
  }
  if (typeof binding === "object" && binding !== null) {
    return {
      size: binding.size ?? "md",
      stickyHeader: binding.stickyHeader,
      disabled: binding.disabled ?? false,
    };
  }
  return { size: "md", disabled: false };
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    (ref as { current: T | null }).current = value;
  }
}

export type ScrollFadeRef<T extends HTMLElement = HTMLElement> = RefCallback<T> & {
  readonly current: T | null;
  sync: () => ScrollFadeState | null;
};

export function useScrollFade<T extends HTMLElement = HTMLElement>(
  binding?: ScrollFadeBinding,
  externalRef?: Ref<T>,
): ScrollFadeRef<T> {
  const resolved = normalizeScrollFadeBinding(binding);
  const optionsRef = useRef<ScrollFadeOptions>(resolved);
  optionsRef.current = resolved;

  const externalRefHolder = useRef<Ref<T> | undefined>(externalRef);
  externalRefHolder.current = externalRef;

  const elementRef = useRef<T | null>(null);
  const controllerRef = useRef<ScrollFadeController | null>(null);

  useEffect(() => {
    controllerRef.current?.update({
      size: resolved.size,
      stickyHeader: resolved.stickyHeader,
      disabled: resolved.disabled,
    });
  }, [resolved.size, resolved.stickyHeader, resolved.disabled]);

  useEffect(() => {
    return () => {
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, []);

  return useMemo<ScrollFadeRef<T>>(() => {
    const callback = ((node: T | null) => {
      if (controllerRef.current) {
        controllerRef.current.dispose();
        controllerRef.current = null;
      }
      elementRef.current = node;
      assignRef(externalRefHolder.current, node);
      if (node) {
        controllerRef.current = attachScrollFade(node, optionsRef.current);
      }
    }) as ScrollFadeRef<T>;

    Object.defineProperty(callback, "current", {
      get: () => elementRef.current,
      enumerable: true,
    });

    callback.sync = () => controllerRef.current?.sync() ?? null;
    return callback;
  }, []);
}
