import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type FocusEventHandler,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type ReactPortal,
  type Ref,
  type RefCallback,
} from "react";
import { createPortal } from "react-dom";
import {
  computeHoverCardPosition,
  isRectOutsideViewport,
  type HoverCardPlacement,
} from "./hover-card";

export const TOOLTIP_SHOW_DELAY = 150;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

let tooltipSeq = 0;

export interface TooltipController {
  update: (options: { value?: string | null; placement?: HoverCardPlacement; delay?: number }) => void;
  hide: () => void;
  dispose: () => void;
}

export function attachTooltip(
  el: HTMLElement,
  initial: { value?: string | null; placement?: HoverCardPlacement; delay?: number },
): TooltipController {
  let value = initial.value ?? "";
  let placement: HoverCardPlacement = initial.placement ?? "top";
  let delay = initial.delay ?? TOOLTIP_SHOW_DELAY;
  let panel: HTMLElement | null = null;
  const panelId = `mw-tooltip-${++tooltipSeq}`;
  let showTimer: ReturnType<typeof setTimeout> | null = null;
  let enteredAt: number | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let onMove: (() => void) | null = null;

  function reposition() {
    if (!panel) return;
    const rect = el.getBoundingClientRect();
    if (isRectOutsideViewport(rect, { width: window.innerWidth, height: window.innerHeight })) {
      hide();
      return;
    }
    const pos = computeHoverCardPosition({
      anchor: rect,
      panel: { width: panel.offsetWidth, height: panel.offsetHeight },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      placement,
    });
    panel.style.position = "fixed";
    panel.style.left = `${Math.round(pos.left)}px`;
    panel.style.top = `${Math.round(pos.top)}px`;
    panel.style.zIndex = "var(--z-tooltip)";
  }

  function show() {
    if (panel || !value || typeof document === "undefined") return;
    const node = document.createElement("div");
    node.id = panelId;
    node.className = "mw-hovercard__panel mw-hovercard__panel--static";
    node.setAttribute("role", "tooltip");
    node.textContent = value;
    document.body.appendChild(node);
    panel = node;
    el.setAttribute("aria-describedby", panelId);

    onMove = () => reposition();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(onMove) : null;
    resizeObserver?.observe(el);

    reposition();
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        if (panel) reposition();
      });
    }
  }

  function hide() {
    if (showTimer !== null) {
      clearTimeout(showTimer);
      showTimer = null;
    }
    if (onMove) {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
      onMove = null;
    }
    resizeObserver?.disconnect();
    resizeObserver = null;
    enteredAt = null;
    if (!panel) return;
    panel.remove();
    panel = null;
    el.removeAttribute("aria-describedby");
  }

  function scheduleShow() {
    if (!value || panel || showTimer !== null) return;
    enteredAt = performance.now();
    showTimer = setTimeout(() => {
      showTimer = null;
      show();
    }, delay);
  }

  const handlers: Array<[string, EventListener]> = [
    ["mouseenter", () => scheduleShow()],
    ["focusin", () => scheduleShow()],
    [
      "mousemove",
      () => {
        if (showTimer === null || enteredAt === null) return;
        if (performance.now() - enteredAt < delay) return;
        clearTimeout(showTimer);
        showTimer = null;
        show();
      },
    ],
    ["mouseleave", () => hide()],
    ["focusout", () => hide()],
    ["click", () => hide()],
    [
      "keydown",
      (e) => {
        if ((e as globalThis.KeyboardEvent).key === "Escape") hide();
      },
    ],
  ];

  for (const [type, fn] of handlers) {
    el.addEventListener(type, fn);
  }

  return {
    update(next) {
      value = next.value ?? "";
      placement = next.placement ?? "top";
      delay = next.delay ?? TOOLTIP_SHOW_DELAY;
      if (!panel) return;
      if (!value) {
        hide();
        return;
      }
      panel.textContent = value;
      reposition();
    },
    hide,
    dispose() {
      hide();
      for (const [type, fn] of handlers) {
        el.removeEventListener(type, fn);
      }
    },
  };
}

export interface UseTooltipOptions {
  content?: string | null;
  placement?: HoverCardPlacement;
  delay?: number;
  disabled?: boolean;
}

export interface TooltipTriggerProps<T extends HTMLElement = HTMLElement> {
  ref: RefCallback<T>;
  "aria-describedby"?: string;
  onMouseEnter: MouseEventHandler<T>;
  onMouseMove: MouseEventHandler<T>;
  onMouseLeave: MouseEventHandler<T>;
  onFocus: FocusEventHandler<T>;
  onBlur: FocusEventHandler<T>;
  onClick: MouseEventHandler<T>;
  onKeyDown: KeyboardEventHandler<T>;
}

export interface UseTooltipReturn<T extends HTMLElement = HTMLElement> {
  open: boolean;
  panelId: string;
  triggerRef: RefCallback<T>;
  triggerProps: TooltipTriggerProps<T>;
  portal: ReactPortal | null;
  hide: () => void;
}

export function useTooltipProps<T extends HTMLElement = HTMLElement>({
  content,
  placement = "top",
  delay = TOOLTIP_SHOW_DELAY,
  disabled = false,
}: UseTooltipOptions): UseTooltipReturn<T> {
  const panelIdRef = useRef<string>("");
  if (!panelIdRef.current) {
    panelIdRef.current = `mw-tooltip-${++tooltipSeq}`;
  }
  const panelId = panelIdRef.current;

  const anchorRef = useRef<T | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enteredAtRef = useRef<number | null>(null);

  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({
    position: "fixed",
    left: "0px",
    top: "0px",
    zIndex: "var(--z-tooltip)",
  });

  const activeText = disabled ? "" : (content ?? "");
  const activeTextRef = useRef(activeText);
  activeTextRef.current = activeText;
  const delayRef = useRef(delay);
  delayRef.current = delay;
  const placementRef = useRef(placement);
  placementRef.current = placement;
  const openRef = useRef(open);
  openRef.current = open;

  const clearPendingTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    enteredAtRef.current = null;
  }, []);

  const hide = useCallback(() => {
    clearPendingTimer();
    setOpen(false);
  }, [clearPendingTimer]);

  const reposition = useCallback(() => {
    const anchorEl = anchorRef.current;
    const panelEl = panelRef.current;
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    if (
      typeof window !== "undefined" &&
      isRectOutsideViewport(rect, { width: window.innerWidth, height: window.innerHeight })
    ) {
      hide();
      return;
    }
    const pos = computeHoverCardPosition({
      anchor: rect,
      panel: {
        width: panelEl?.offsetWidth ?? 0,
        height: panelEl?.offsetHeight ?? 0,
      },
      viewport: {
        width: typeof window !== "undefined" ? window.innerWidth : 1024,
        height: typeof window !== "undefined" ? window.innerHeight : 768,
      },
      placement: placementRef.current,
    });
    setPanelStyle({
      position: "fixed",
      left: `${Math.round(pos.left)}px`,
      top: `${Math.round(pos.top)}px`,
      zIndex: "var(--z-tooltip)",
    });
  }, [hide]);

  const showNow = useCallback(() => {
    clearPendingTimer();
    if (!activeTextRef.current) return;
    setOpen(true);
  }, [clearPendingTimer]);

  const scheduleShow = useCallback(() => {
    if (!activeTextRef.current || openRef.current || timerRef.current !== null) return;
    enteredAtRef.current = performance.now();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      showNow();
    }, delayRef.current);
  }, [showNow]);

  useEffect(() => {
    if (!activeText && open) {
      hide();
    } else if (open) {
      reposition();
    }
  }, [activeText, placement, open, hide, reposition]);

  useIsomorphicLayoutEffect(() => {
    if (!open || !activeText) return;
    reposition();
    let rafId: number | null = null;
    if (typeof requestAnimationFrame === "function") {
      rafId = requestAnimationFrame(() => {
        rafId = null;
        reposition();
      });
    }
    const onMove = () => reposition();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    const ro =
      typeof ResizeObserver !== "undefined" && anchorRef.current
        ? new ResizeObserver(onMove)
        : null;
    if (ro && anchorRef.current) {
      ro.observe(anchorRef.current);
    }
    return () => {
      if (rafId !== null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
      ro?.disconnect();
    };
  }, [open, activeText, reposition]);

  useEffect(() => {
    return () => {
      clearPendingTimer();
    };
  }, [clearPendingTimer]);

  const triggerRef = useCallback<RefCallback<T>>((node) => {
    anchorRef.current = node;
  }, []);

  const onMouseEnter = useCallback<MouseEventHandler<T>>(
    () => {
      scheduleShow();
    },
    [scheduleShow],
  );

  const onMouseMove = useCallback<MouseEventHandler<T>>(
    () => {
      if (timerRef.current === null || enteredAtRef.current === null) return;
      if (performance.now() - enteredAtRef.current < delayRef.current) return;
      showNow();
    },
    [showNow],
  );

  const onMouseLeave = useCallback<MouseEventHandler<T>>(() => {
    hide();
  }, [hide]);

  const onFocus = useCallback<FocusEventHandler<T>>(() => {
    scheduleShow();
  }, [scheduleShow]);

  const onBlur = useCallback<FocusEventHandler<T>>(() => {
    hide();
  }, [hide]);

  const onClick = useCallback<MouseEventHandler<T>>(() => {
    hide();
  }, [hide]);

  const onKeyDown = useCallback<KeyboardEventHandler<T>>(
    (e: KeyboardEvent<T>) => {
      if (e.key === "Escape") hide();
    },
    [hide],
  );

  const visible = open && Boolean(activeText);

  const triggerProps = useMemo<TooltipTriggerProps<T>>(
    () => ({
      ref: triggerRef,
      "aria-describedby": visible ? panelId : undefined,
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      onFocus,
      onBlur,
      onClick,
      onKeyDown,
    }),
    [
      triggerRef,
      visible,
      panelId,
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      onFocus,
      onBlur,
      onClick,
      onKeyDown,
    ],
  );

  const portal =
    visible && typeof document !== "undefined"
      ? createPortal(
          <div
            id={panelId}
            ref={panelRef}
            role="tooltip"
            className="mw-hovercard__panel mw-hovercard__panel--static"
            style={panelStyle}
          >
            {activeText}
          </div>,
          document.body,
        )
      : null;

  return {
    open: visible,
    panelId,
    triggerRef,
    triggerProps,
    portal,
    hide,
  };
}

function setMergedRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(node);
  } else {
    (ref as { current: T | null }).current = node;
  }
}

export interface TooltipProps extends UseTooltipOptions {
  children: ReactElement | ReactNode;
}

export function Tooltip({
  content,
  placement = "top",
  delay = TOOLTIP_SHOW_DELAY,
  disabled = false,
  children,
}: TooltipProps): ReactElement {
  const { open, panelId, triggerProps, portal } = useTooltipProps({
    content,
    placement,
    delay,
    disabled,
  });

  if (!isValidElement(children)) {
    return (
      <>
        <span {...triggerProps}>{children}</span>
        {portal}
      </>
    );
  }

  const childProps = children.props as Record<string, unknown>;
  const existingRef =
    (childProps.ref as Ref<HTMLElement> | undefined) ??
    (children as unknown as { ref?: Ref<HTMLElement> }).ref;

  const existingDescribedBy = childProps["aria-describedby"] as string | undefined;
  const mergedDescribedBy = open
    ? existingDescribedBy
      ? `${existingDescribedBy} ${panelId}`
      : panelId
    : existingDescribedBy;

  const cloned = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: (node: HTMLElement | null) => {
      triggerProps.ref(node);
      setMergedRef(existingRef, node);
    },
    "aria-describedby": mergedDescribedBy,
    onMouseEnter: (e: MouseEvent<HTMLElement>) => {
      (childProps.onMouseEnter as MouseEventHandler<HTMLElement> | undefined)?.(e);
      triggerProps.onMouseEnter(e);
    },
    onMouseMove: (e: MouseEvent<HTMLElement>) => {
      (childProps.onMouseMove as MouseEventHandler<HTMLElement> | undefined)?.(e);
      triggerProps.onMouseMove(e);
    },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => {
      (childProps.onMouseLeave as MouseEventHandler<HTMLElement> | undefined)?.(e);
      triggerProps.onMouseLeave(e);
    },
    onFocus: (e: FocusEvent<HTMLElement>) => {
      (childProps.onFocus as FocusEventHandler<HTMLElement> | undefined)?.(e);
      triggerProps.onFocus(e);
    },
    onBlur: (e: FocusEvent<HTMLElement>) => {
      (childProps.onBlur as FocusEventHandler<HTMLElement> | undefined)?.(e);
      triggerProps.onBlur(e);
    },
    onClick: (e: MouseEvent<HTMLElement>) => {
      (childProps.onClick as MouseEventHandler<HTMLElement> | undefined)?.(e);
      triggerProps.onClick(e);
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      (childProps.onKeyDown as KeyboardEventHandler<HTMLElement> | undefined)?.(e);
      triggerProps.onKeyDown(e);
    },
  });

  return (
    <>
      {cloned}
      {portal}
    </>
  );
}
