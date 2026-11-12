import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  computeHoverCardPosition,
  isRectOutsideViewport,
  type HoverCardPlacement,
} from "../lib/hover-card";

export type { HoverCardPlacement };

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface HoverCardProps extends Omit<HTMLAttributes<HTMLSpanElement>, "content"> {
  placement?: HoverCardPlacement;
  showDelay?: number;
  hideDelay?: number;
  interactive?: boolean;
  label?: string;
  disabled?: boolean;
  block?: boolean;
  focusable?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onShow?: () => void;
  onHide?: () => void;
  content?: ReactNode;
  panelClassName?: string;
  panelStyle?: CSSProperties;
  children?: ReactNode;
}

export const HoverCard = forwardRef<HTMLSpanElement, HoverCardProps>(function MwHoverCard(
  {
    placement = "top",
    showDelay = 150,
    hideDelay = 150,
    interactive = true,
    label = "Details",
    disabled = false,
    block = false,
    focusable = true,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onShow,
    onHide,
    content,
    panelClassName,
    panelStyle: externalPanelStyle,
    className,
    tabIndex,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onFocus,
    onBlur,
    onKeyDown,
    onClick,
    children,
    ...rest
  },
  forwardedRef,
) {
  const reactId = useId();
  const panelId = `mw-hovercard-${reactId.replace(/:/g, "")}`;

  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enteredAtRef = useRef<number | null>(null);

  const isControlled = openProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
  const isOpen = !disabled && (isControlled ? Boolean(openProp) : uncontrolledOpen);

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const showDelayRef = useRef(showDelay);
  showDelayRef.current = showDelay;
  const hideDelayRef = useRef(hideDelay);
  hideDelayRef.current = hideDelay;
  const placementRef = useRef(placement);
  placementRef.current = placement;
  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const onShowRef = useRef(onShow);
  onShowRef.current = onShow;
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  const [side, setSide] = useState<HoverCardPlacement>(placement);
  const [coordsStyle, setCoordsStyle] = useState<CSSProperties>({
    position: "fixed",
    left: "0px",
    top: "0px",
    zIndex: "var(--z-tooltip)",
  });

  const clearTimers = useCallback(() => {
    if (showTimerRef.current !== null) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    enteredAtRef.current = null;
  }, []);

  const requestOpen = useCallback(
    (next: boolean) => {
      if (next && disabledRef.current) return;
      clearTimers();
      const prev = isOpenRef.current;
      if (!isControlledRef.current) {
        setUncontrolledOpen(next);
      }
      if (next !== prev) {
        onOpenChangeRef.current?.(next);
      }
    },
    [clearTimers],
  );

  const showNow = useCallback(() => {
    if (isOpenRef.current || disabledRef.current) return;
    requestOpen(true);
  }, [requestOpen]);

  const hideNow = useCallback(() => {
    clearTimers();
    if (!isOpenRef.current) return;
    requestOpen(false);
  }, [clearTimers, requestOpen]);

  const hideAndRefocus = useCallback(() => {
    hideNow();
    anchorRef.current?.focus();
  }, [hideNow]);

  const reposition = useCallback(() => {
    const anchorEl = anchorRef.current;
    const panelEl = panelRef.current;
    if (!anchorEl || !isOpenRef.current) return;
    const rect = anchorEl.getBoundingClientRect();
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight : 768;
    if (typeof window !== "undefined" && isRectOutsideViewport(rect, { width: vw, height: vh })) {
      hideNow();
      return;
    }
    const pos = computeHoverCardPosition({
      anchor: rect,
      panel: {
        width: panelEl?.offsetWidth ?? 0,
        height: panelEl?.offsetHeight ?? 0,
      },
      viewport: { width: vw, height: vh },
      placement: placementRef.current,
    });
    setSide(pos.side);
    setCoordsStyle({
      position: "fixed",
      left: `${Math.round(pos.left)}px`,
      top: `${Math.round(pos.top)}px`,
      zIndex: "var(--z-tooltip)",
    });
  }, [hideNow]);

  const scheduleShow = useCallback(() => {
    if (disabledRef.current) return;
    clearTimers();
    if (isOpenRef.current) return;
    enteredAtRef.current = performance.now();
    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null;
      showNow();
    }, showDelayRef.current);
  }, [clearTimers, showNow]);

  const scheduleHide = useCallback(() => {
    clearTimers();
    if (!isOpenRef.current) return;
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      hideNow();
    }, hideDelayRef.current);
  }, [clearTimers, hideNow]);

  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      prevOpenRef.current = true;
      onShowRef.current?.();
    } else if (!isOpen && prevOpenRef.current) {
      prevOpenRef.current = false;
      onHideRef.current?.();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!disabled) return;
    clearTimers();
    if (!isControlled && uncontrolledOpen) {
      setUncontrolledOpen(false);
      onOpenChangeRef.current?.(false);
    } else if (isControlled && openProp) {
      onOpenChangeRef.current?.(false);
    }
  }, [disabled, isControlled, openProp, uncontrolledOpen, clearTimers]);

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) return;
    reposition();
    let rafId: number | null = null;
    if (typeof requestAnimationFrame === "function") {
      rafId = requestAnimationFrame(() => {
        rafId = null;
        reposition();
      });
    }

    const onScrollOrResize = () => reposition();
    const onDocKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        hideAndRefocus();
      }
    };

    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("keydown", onDocKeyDown, true);

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(onScrollOrResize) : null;
    if (ro) {
      if (anchorRef.current) ro.observe(anchorRef.current);
      if (panelRef.current) ro.observe(panelRef.current);
    }

    return () => {
      if (rafId !== null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("keydown", onDocKeyDown, true);
      ro?.disconnect();
    };
  }, [isOpen, placement, reposition, hideAndRefocus]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const setAnchorNode = useCallback(
    (node: HTMLSpanElement | null) => {
      anchorRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  const getPanelFocusables = (): HTMLElement[] =>
    Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);

  const handleAnchorMouseEnter = (event: MouseEvent<HTMLSpanElement>) => {
    onMouseEnter?.(event);
    scheduleShow();
  };

  const handleAnchorMouseMove = (event: MouseEvent<HTMLSpanElement>) => {
    onMouseMove?.(event);
    if (showTimerRef.current === null || enteredAtRef.current === null) return;
    if (performance.now() - enteredAtRef.current < showDelayRef.current) return;
    showNow();
  };

  const handleAnchorMouseLeave = (event: MouseEvent<HTMLSpanElement>) => {
    onMouseLeave?.(event);
    scheduleHide();
  };

  const handleAnchorFocus = (event: FocusEvent<HTMLSpanElement>) => {
    onFocus?.(event);
    scheduleShow();
  };

  const handleAnchorBlur = (event: FocusEvent<HTMLSpanElement>) => {
    onBlur?.(event);
    const next = event.relatedTarget as Node | null;
    if (next && (panelRef.current?.contains(next) || anchorRef.current?.contains(next))) {
      return;
    }
    scheduleHide();
  };

  const handleAnchorKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key !== "Tab" || event.shiftKey || !isOpen || !interactive) return;
    const first = getPanelFocusables()[0];
    if (!first) return;
    event.preventDefault();
    first.focus();
  };

  const handleAnchorClick = (event: MouseEvent<HTMLSpanElement>) => {
    onClick?.(event);
    hideNow();
  };

  const handlePanelBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && (panelRef.current?.contains(next) || anchorRef.current?.contains(next))) {
      return;
    }
    scheduleHide();
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !interactive) return;
    const focusables = getPanelFocusables();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    if (
      (event.shiftKey && document.activeElement === first) ||
      (!event.shiftKey && document.activeElement === last)
    ) {
      event.preventDefault();
      hideAndRefocus();
    }
  };

  const anchorClasses = [
    "mw-hovercard",
    block ? "mw-hovercard--block" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const panelClasses = [
    "mw-hovercard__panel",
    "mw-hovercard__panel--card",
    "mw-frost",
    "mw-frost--thick",
    `mw-hovercard__panel--${side}`,
    !interactive ? "mw-hovercard__panel--static" : undefined,
    panelClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <span
        {...rest}
        ref={setAnchorNode}
        className={anchorClasses}
        tabIndex={focusable && !disabled ? (tabIndex ?? 0) : tabIndex}
        data-state={isOpen ? "open" : "closed"}
        aria-describedby={isOpen && !interactive ? panelId : undefined}
        aria-expanded={interactive ? isOpen : undefined}
        aria-controls={interactive && isOpen ? panelId : undefined}
        aria-haspopup={interactive ? "dialog" : undefined}
        onMouseEnter={handleAnchorMouseEnter}
        onMouseMove={handleAnchorMouseMove}
        onMouseLeave={handleAnchorMouseLeave}
        onFocus={handleAnchorFocus}
        onBlur={handleAnchorBlur}
        onKeyDown={handleAnchorKeyDown}
        onClick={handleAnchorClick}
      >
        {children}
      </span>
      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              id={panelId}
              ref={panelRef}
              role={interactive ? "dialog" : "tooltip"}
              aria-label={interactive ? label : undefined}
              data-state="open"
              data-side={side}
              className={panelClasses}
              style={externalPanelStyle ? { ...coordsStyle, ...externalPanelStyle } : coordsStyle}
              onMouseEnter={clearTimers}
              onMouseLeave={scheduleHide}
              onFocus={clearTimers}
              onBlur={handlePanelBlur}
              onKeyDown={handlePanelKeyDown}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
});

HoverCard.displayName = "MwHoverCard";

export default HoverCard;
