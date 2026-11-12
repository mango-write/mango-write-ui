import {
  cloneElement,
  createElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentType,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { useOverlayZIndex } from "../lib/overlay-layer";
import type {
  MenuEventLike,
  MenuHandle,
  MenuIcon,
  MenuItem,
  MenuItemSlotProps,
  MenuProps,
} from "./menu-defs";

export type {
  MenuCommandEvent,
  MenuEventLike,
  MenuHandle,
  MenuIcon,
  MenuItem,
  MenuItemCommandEvent,
  MenuItemSlotProps,
  MenuProps,
  MenuTriggerRenderProps,
} from "./menu-defs";

const VIEWPORT_PADDING = 8;
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function hasHigherOverlayInDom(mySlot: number): boolean {
  if (typeof document === "undefined" || mySlot <= 0) return false;
  const nodes = document.querySelectorAll<HTMLElement>('[style*="--z-overlay"]');
  for (const el of nodes) {
    const m = el.style.zIndex.match(/\+\s*(\d+)\)/);
    if (m && Number(m[1]) > mySlot) return true;
  }
  return false;
}

function isItemVisible(item: MenuItem): boolean {
  if (item.visible === undefined) return true;
  return typeof item.visible === "function" ? Boolean(item.visible()) : Boolean(item.visible);
}

function isItemDisabled(item: MenuItem): boolean {
  return typeof item.disabled === "function"
    ? Boolean(item.disabled())
    : Boolean(item.disabled);
}

function resolveLabel(item: MenuItem): string {
  if (typeof item.label === "function") return item.label();
  return item.label ?? "";
}

function renderMenuIcon(icon: MenuIcon | undefined): ReactNode {
  if (icon === undefined || icon === null || icon === false) return null;
  if (isValidElement(icon)) {
    const prev = (icon.props as { className?: string }).className;
    return cloneElement(icon as ReactElement<{ className?: string; "aria-hidden"?: "true" }>, {
      className: ["mw-menu__item-icon", prev].filter(Boolean).join(" "),
      "aria-hidden": "true",
    });
  }
  if (typeof icon === "string" || typeof icon === "number") {
    return (
      <span className="mw-menu__item-icon" aria-hidden="true">
        {icon}
      </span>
    );
  }
  if (
    typeof icon === "function" ||
    (typeof icon === "object" && "$$typeof" in (icon as object))
  ) {
    return createElement(
      icon as ComponentType<{ className?: string; "aria-hidden"?: "true" }>,
      {
        className: "mw-menu__item-icon",
        "aria-hidden": "true",
      },
    );
  }
  return null;
}

type FlatMenuEntry =
  | { kind: "separator"; key: string; item: MenuItem }
  | { kind: "submenulabel"; key: string; item: MenuItem }
  | { kind: "item"; key: string; item: MenuItem; navIndex: number };

function clampToViewport(
  x: number,
  y: number,
  el?: HTMLElement | null,
): { x: number; y: number } {
  const vw =
    typeof window !== "undefined" && window.innerWidth > 0 ? window.innerWidth : 1024;
  const vh =
    typeof window !== "undefined" && window.innerHeight > 0 ? window.innerHeight : 768;
  const rect = el?.getBoundingClientRect();
  const width =
    el && el.offsetWidth > 0
      ? el.offsetWidth
      : rect && rect.width > 0
        ? rect.width
        : 200;
  const height =
    el && el.offsetHeight > 0
      ? el.offsetHeight
      : rect && rect.height > 0
        ? rect.height
        : 0;
  const maxX = Math.max(VIEWPORT_PADDING, vw - width - VIEWPORT_PADDING);
  const maxY = Math.max(VIEWPORT_PADDING, vh - height - VIEWPORT_PADDING);
  return {
    x: Math.min(Math.max(VIEWPORT_PADDING, x), maxX),
    y: Math.min(Math.max(VIEWPORT_PADDING, y), maxY),
  };
}

function resolveAnchor(
  event?: MenuEventLike | null,
  target?: HTMLElement | null,
): HTMLElement | null {
  if (target instanceof HTMLElement) return target;
  if (event?.currentTarget instanceof HTMLElement) return event.currentTarget;
  if (event?.target instanceof HTMLElement) return event.target;
  return null;
}

function extractNativeEvent(event?: MenuEventLike | null): Event | null {
  if (!event) return null;
  if (event instanceof Event) return event;
  if ("nativeEvent" in event && event.nativeEvent instanceof Event) {
    return event.nativeEvent;
  }
  return null;
}

function resolvePortalContainer(
  appendTo?: "self" | "body" | (string & {}) | HTMLElement | null,
): HTMLElement | null {
  if (typeof document === "undefined") return null;
  if (!appendTo || appendTo === "body") return document.body;
  if (appendTo === "self") return null;
  if (typeof appendTo === "string") {
    return (document.querySelector(appendTo) as HTMLElement | null) ?? document.body;
  }
  return appendTo;
}

export const Menu = forwardRef<MenuHandle, MenuProps>(function MwMenu(
  {
    model = [],
    popup = false,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    trigger,
    appendTo = "body",
    ariaLabel,
    ariaLabelledby,
    start,
    end,
    renderSubmenuLabel,
    submenulabel,
    renderItem,
    item: itemSlot,
    onShow,
    onHide,
    className,
    style,
    onKeyDown,
    ...rest
  },
  forwardedRef,
) {
  const isControlled = popup && openProp !== undefined;
  const [uncontrolledPopupOpen, setUncontrolledPopupOpen] = useState<boolean>(defaultOpen);
  const isOpen = popup
    ? isControlled
      ? Boolean(openProp)
      : uncontrolledPopupOpen
    : true;

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const popupRef = useRef(popup);
  popupRef.current = popup;
  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const onShowRef = useRef(onShow);
  onShowRef.current = onShow;
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  const { slot, layerZ } = useOverlayZIndex(Boolean(popup && isOpen));
  const slotRef = useRef(slot);
  slotRef.current = slot;

  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerElRef = useRef<HTMLElement | null>(null);
  const openingEventRef = useRef<Event | null>(null);
  const lastHandledEventRef = useRef<Event | SyntheticEvent | null>(null);

  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: VIEWPORT_PADDING,
    y: VIEWPORT_PADDING,
  });
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const flatEntries = useMemo<FlatMenuEntry[]>(() => {
    const result: FlatMenuEntry[] = [];
    let navCounter = 0;
    const list = Array.isArray(model) ? model : [];
    list.forEach((entry, idx) => {
      if (!isItemVisible(entry)) return;
      if (entry.separator) {
        result.push({
          kind: "separator",
          key: entry.key ?? `sep-${idx}`,
          item: entry,
        });
        return;
      }
      if (Array.isArray(entry.items)) {
        result.push({
          kind: "submenulabel",
          key: entry.key ?? `group-${idx}`,
          item: entry,
        });
        entry.items.forEach((sub, subIdx) => {
          if (!isItemVisible(sub)) return;
          if (sub.separator) {
            result.push({
              kind: "separator",
              key: sub.key ?? `sep-${idx}-${subIdx}`,
              item: sub,
            });
          } else {
            result.push({
              kind: "item",
              key: sub.key ?? `item-${idx}-${subIdx}`,
              item: sub,
              navIndex: navCounter++,
            });
          }
        });
        return;
      }
      result.push({
        kind: "item",
        key: entry.key ?? `item-${idx}`,
        item: entry,
        navIndex: navCounter++,
      });
    });
    return result;
  }, [model]);

  const navigableItems = useMemo(
    () =>
      flatEntries
        .filter((e): e is Extract<FlatMenuEntry, { kind: "item" }> => e.kind === "item")
        .map((e) => ({ navIndex: e.navIndex, item: e.item })),
    [flatEntries],
  );

  const computePosition = useCallback(
    (event?: MenuEventLike | null, target?: HTMLElement | null): { x: number; y: number } => {
      const anchor = resolveAnchor(event, target);
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        const el = menuRef.current;
        const menuRect = el?.getBoundingClientRect();
        const width =
          el && el.offsetWidth > 0
            ? el.offsetWidth
            : menuRect && menuRect.width > 0
              ? menuRect.width
              : 200;
        const vw =
          typeof window !== "undefined" && window.innerWidth > 0
            ? window.innerWidth
            : 1024;
        const preferredX =
          rect.left + width > vw - VIEWPORT_PADDING ? rect.right - width : rect.left;
        return clampToViewport(preferredX, rect.bottom + 6, el);
      }
      const cx = event && "clientX" in event ? event.clientX : undefined;
      const cy = event && "clientY" in event ? event.clientY : undefined;
      if (typeof cx === "number" && typeof cy === "number" && (cx > 0 || cy > 0)) {
        return clampToViewport(cx, cy, menuRef.current);
      }
      return clampToViewport(VIEWPORT_PADDING, VIEWPORT_PADDING, menuRef.current);
    },
    [],
  );

  const setPopupOpen = useCallback((next: boolean) => {
    const prev = isOpenRef.current;
    if (!isControlledRef.current) {
      setUncontrolledPopupOpen(next);
      isOpenRef.current = next;
    }
    if (next !== prev) {
      onOpenChangeRef.current?.(next);
      if (next) {
        onShowRef.current?.();
      } else {
        onHideRef.current?.();
      }
    }
  }, []);

  const hide = useCallback(() => {
    if (!popupRef.current) return;
    setFocusedIndex(-1);
    openingEventRef.current = null;
    setPopupOpen(false);
  }, [setPopupOpen]);

  const show = useCallback<MenuHandle["show"]>(
    (event, target) => {
      if (!popupRef.current) return;
      openingEventRef.current = extractNativeEvent(event);
      const anchor = resolveAnchor(event, target);
      triggerElRef.current = anchor;
      setPosition(computePosition(event, target));
      const isKeyboard =
        event instanceof globalThis.KeyboardEvent ||
        (event && "nativeEvent" in event && event.nativeEvent instanceof globalThis.KeyboardEvent);
      if (isKeyboard) {
        const first = navigableItems.find((e) => !isItemDisabled(e.item));
        setFocusedIndex(first ? first.navIndex : -1);
      } else {
        setFocusedIndex(-1);
      }
      setPopupOpen(true);
    },
    [computePosition, navigableItems, setPopupOpen],
  );

  const toggle = useCallback<MenuHandle["toggle"]>(
    (event, target) => {
      if (!popupRef.current) return;
      if (isOpenRef.current) {
        hide();
      } else {
        show(event, target);
      }
    },
    [hide, show],
  );

  useImperativeHandle(
    forwardedRef,
    () => ({
      toggle,
      show,
      hide,
      get open() {
        return isOpenRef.current;
      },
    }),
    [toggle, show, hide],
  );

  useIsomorphicLayoutEffect(() => {
    if (!popup || !isOpen) return;
    const anchor = triggerElRef.current;
    if (anchor) {
      setPosition(computePosition(null, anchor));
    }
    menuRef.current?.focus();
    const clearOpening = queueMicrotask(() => {
      openingEventRef.current = null;
    });
    void clearOpening;

    const onOutside = (event: Event) => {
      if (event === openingEventRef.current) return;
      const target = event.target as Node | null;
      if (target && menuRef.current?.contains(target)) return;
      if (target && triggerElRef.current?.contains(target)) return;
      hide();
    };

    const onKeyCapture = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (hasHigherOverlayInDom(slotRef.current)) return;
      event.preventDefault();
      event.stopPropagation();
      const restore = triggerElRef.current;
      hide();
      if (restore && document.contains(restore)) {
        restore.focus();
      }
    };

    const onResize = () => {
      hide();
    };

    document.addEventListener("mousedown", onOutside, true);
    document.addEventListener("click", onOutside, true);
    window.addEventListener("keydown", onKeyCapture, true);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("mousedown", onOutside, true);
      document.removeEventListener("click", onOutside, true);
      window.removeEventListener("keydown", onKeyCapture, true);
      window.removeEventListener("resize", onResize);
    };
  }, [popup, isOpen, computePosition, hide]);

  const moveFocus = (direction: "next" | "prev" | "first" | "last") => {
    const enabled = navigableItems.filter((e) => !isItemDisabled(e.item));
    if (enabled.length === 0) return;

    if (direction === "first") {
      setFocusedIndex(enabled[0]!.navIndex);
      return;
    }
    if (direction === "last") {
      setFocusedIndex(enabled[enabled.length - 1]!.navIndex);
      return;
    }

    const currentPos = enabled.findIndex((e) => e.navIndex === focusedIndex);
    if (currentPos === -1) {
      setFocusedIndex(
        direction === "next"
          ? enabled[0]!.navIndex
          : enabled[enabled.length - 1]!.navIndex,
      );
      return;
    }

    const nextPos =
      direction === "next"
        ? (currentPos + 1) % enabled.length
        : (currentPos - 1 + enabled.length) % enabled.length;
    setFocusedIndex(enabled[nextPos]!.navIndex);
  };

  const handleItemActivate = (event: SyntheticEvent, item: MenuItem) => {
    const native = event.nativeEvent;
    if (lastHandledEventRef.current === native || lastHandledEventRef.current === event) {
      return;
    }
    lastHandledEventRef.current = native;

    if (isItemDisabled(item)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!item.url) {
      event.preventDefault();
    }

    item.command?.({ originalEvent: native, item });

    if (popup) {
      hide();
    }
  };

  const getItemSlotProps = (item: MenuItem): MenuItemSlotProps => {
    const disabled = isItemDisabled(item);
    return {
      action: {
        className: "mw-menu__item-link",
        href: item.url || undefined,
        target: item.target || undefined,
        role: "menuitem",
        tabIndex: -1,
        "aria-disabled": disabled || undefined,
        onClick: (event: ReactMouseEvent<HTMLElement>) => handleItemActivate(event, item),
      },
      icon: {
        className: "mw-menu__item-icon",
        "aria-hidden": "true",
      },
      label: {
        className: "mw-menu__item-label",
      },
    };
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus("next");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus("prev");
    } else if (event.key === "Home") {
      event.preventDefault();
      moveFocus("first");
    } else if (event.key === "End") {
      event.preventDefault();
      moveFocus("last");
    } else if (event.key === "Enter" || event.key === " ") {
      const activeEntry = navigableItems.find((e) => e.navIndex === focusedIndex);
      if (activeEntry && !isItemDisabled(activeEntry.item)) {
        event.preventDefault();
        handleItemActivate(event, activeEntry.item);
      }
    } else if (event.key === "Escape" && popup) {
      event.preventDefault();
      event.stopPropagation();
      const restore = triggerElRef.current;
      hide();
      if (restore && document.contains(restore)) {
        restore.focus();
      }
    }
  };

  const submenuRenderer = renderSubmenuLabel ?? submenulabel;
  const customItemRenderer = renderItem ?? itemSlot;

  const rootClasses = [
    "mw-menu",
    popup ? "mw-menu--popup" : undefined,
    popup ? "mw-frost" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const rootStyle = useMemo<CSSProperties | undefined>(() => {
    if (!popup) return style;
    const base: CSSProperties = {
      position: "fixed",
      left: `${position.x}px`,
      top: `${position.y}px`,
    };
    if (layerZ) {
      base.zIndex = layerZ;
    }
    return style ? { ...base, ...style } : base;
  }, [popup, position.x, position.y, layerZ, style]);

  const resolvedTrigger =
    typeof trigger === "function"
      ? trigger({ open: isOpen, toggle, show, hide })
      : trigger;

  const triggerElement = useMemo(() => {
    if (!popup || resolvedTrigger === undefined || resolvedTrigger === null) {
      return null;
    }
    if (isValidElement(resolvedTrigger)) {
      const prevOnClick = (
        resolvedTrigger.props as { onClick?: (e: ReactMouseEvent<HTMLElement>) => void }
      ).onClick;
      return cloneElement(
        resolvedTrigger as ReactElement<{
          "aria-haspopup"?: "menu";
          "aria-expanded"?: boolean;
          onClick?: (e: ReactMouseEvent<HTMLElement>) => void;
        }>,
        {
          "aria-haspopup": "menu",
          "aria-expanded": isOpen,
          onClick: (e: ReactMouseEvent<HTMLElement>) => {
            prevOnClick?.(e);
            if (!e.defaultPrevented) {
              toggle(e);
            }
          },
        },
      );
    }
    return (
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(e) => toggle(e)}
      >
        {resolvedTrigger}
      </button>
    );
  }, [popup, resolvedTrigger, isOpen, toggle]);

  const menuElement =
    !popup || isOpen ? (
      <div
        {...rest}
        ref={menuRef}
        className={rootClasses}
        style={rootStyle}
        data-state={isOpen ? "open" : "closed"}
        tabIndex={popup ? -1 : 0}
        onKeyDown={handleMenuKeyDown}
      >
        {start ? <div className="mw-menu__start">{start}</div> : null}

        <ul
          className="mw-menu__list"
          role="menu"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          onMouseLeave={() => setFocusedIndex(-1)}
        >
          {flatEntries.map((entry) => {
            const itemClass = entry.item.className ?? entry.item.class;
            if (entry.kind === "separator") {
              return (
                <li
                  key={entry.key}
                  className={["mw-menu__separator", itemClass].filter(Boolean).join(" ")}
                  style={entry.item.style}
                  role="separator"
                />
              );
            }

            if (entry.kind === "submenulabel") {
              const labelText = resolveLabel(entry.item);
              return (
                <li
                  key={entry.key}
                  className={["mw-menu__submenu-label", itemClass].filter(Boolean).join(" ")}
                  style={entry.item.style}
                  role="presentation"
                >
                  {submenuRenderer
                    ? submenuRenderer({ item: entry.item, label: labelText })
                    : labelText}
                </li>
              );
            }

            const disabled = isItemDisabled(entry.item);
            const highlighted = focusedIndex === entry.navIndex;
            const labelText = resolveLabel(entry.item);
            const liClasses = [
              "mw-menu__item",
              disabled ? "mw-menu__item--disabled" : undefined,
              highlighted ? "mw-menu__item--focused" : undefined,
              entry.item.danger ? "mw-menu__item--danger" : undefined,
              itemClass,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li
                key={entry.key}
                className={liClasses}
                style={entry.item.style}
                role="menuitem"
                aria-label={labelText || undefined}
                aria-disabled={disabled || undefined}
                data-disabled={disabled ? "" : undefined}
                data-highlighted={highlighted ? "" : undefined}
                onMouseEnter={() => setFocusedIndex(entry.navIndex)}
              >
                <div
                  className="mw-menu__item-content"
                  onClick={(e) => handleItemActivate(e, entry.item)}
                >
                  {customItemRenderer ? (
                    customItemRenderer({
                      item: entry.item,
                      label: labelText,
                      props: getItemSlotProps(entry.item),
                    })
                  ) : (
                    <a
                      href={entry.item.url || undefined}
                      target={entry.item.target || undefined}
                      className="mw-menu__item-link"
                      tabIndex={-1}
                      aria-disabled={disabled || undefined}
                      onClick={(e) => handleItemActivate(e, entry.item)}
                    >
                      {renderMenuIcon(entry.item.icon)}
                      <span className="mw-menu__item-label">{labelText}</span>
                      {entry.item.shortcut ? (
                        <span className="mw-menu__item-shortcut">
                          {entry.item.shortcut}
                        </span>
                      ) : null}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {end ? <div className="mw-menu__end">{end}</div> : null}
      </div>
    ) : null;

  const portalTarget = popup ? resolvePortalContainer(appendTo) : null;

  return (
    <>
      {triggerElement}
      {popup && portalTarget && menuElement
        ? createPortal(menuElement, portalTarget)
        : menuElement}
    </>
  );
});

Menu.displayName = "MwMenu";

export default Menu;
