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
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";
import { useOverlayZIndex } from "../lib/overlay-layer";
import { Tooltip } from "../lib/tooltip";
import type {
  ActionMenuCommandEvent,
  ActionMenuEventLike,
  ActionMenuHandle,
  ActionMenuIcon,
  ActionMenuItem,
  ActionMenuPoint,
  ActionMenuProps,
  ActionMenuTriggerRenderProps,
} from "./action-menu";

export type {
  ActionMenuCommandEvent,
  ActionMenuEventLike,
  ActionMenuHandle,
  ActionMenuIcon,
  ActionMenuItem,
  ActionMenuPoint,
  ActionMenuProps,
  ActionMenuTriggerRenderProps,
};

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

function isItemVisible(item: ActionMenuItem): boolean {
  if (item.visible === undefined) return true;
  return typeof item.visible === "function" ? Boolean(item.visible()) : Boolean(item.visible);
}

function isItemDisabled(item: ActionMenuItem): boolean {
  return typeof item.disabled === "function"
    ? Boolean(item.disabled())
    : Boolean(item.disabled);
}

function resolveLabel(item: ActionMenuItem): string {
  if (typeof item.label === "function") return item.label();
  return item.label ?? "";
}

function getSubItems(item: ActionMenuItem): ActionMenuItem[] {
  const raw = item.children ?? item.items;
  if (!Array.isArray(raw)) return [];
  return raw.filter(isItemVisible);
}

function hasSubmenu(item: ActionMenuItem): boolean {
  return !isItemDisabled(item) && getSubItems(item).length > 0;
}

function pathKey(path: readonly number[]): string {
  return path.join(".");
}

function isPathPrefix(prefix: readonly number[], full: readonly number[]): boolean {
  if (prefix.length > full.length) return false;
  for (let i = 0; i < prefix.length; i += 1) {
    if (prefix[i] !== full[i]) return false;
  }
  return true;
}

function isSamePath(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && isPathPrefix(a, b);
}

function getListAtParentPath(
  rootItems: ActionMenuItem[],
  parentPath: readonly number[],
): ActionMenuItem[] {
  let list = rootItems;
  for (const idx of parentPath) {
    const parent = list[idx];
    if (!parent) return [];
    list = getSubItems(parent);
  }
  return list;
}

function getItemAtPath(
  rootItems: ActionMenuItem[],
  path: readonly number[],
): ActionMenuItem | undefined {
  if (path.length === 0) return undefined;
  const parentList = getListAtParentPath(rootItems, path.slice(0, -1));
  return parentList[path[path.length - 1]!];
}

function getNavigableIndices(list: ActionMenuItem[]): number[] {
  const indices: number[] = [];
  for (let i = 0; i < list.length; i += 1) {
    const entry = list[i]!;
    if (!entry.separator && !isItemDisabled(entry)) {
      indices.push(i);
    }
  }
  if (indices.length > 0) return indices;
  for (let i = 0; i < list.length; i += 1) {
    if (!list[i]!.separator) {
      indices.push(i);
    }
  }
  return indices;
}

function findMovedIndex(
  list: ActionMenuItem[],
  current: number,
  direction: "next" | "prev" | "first" | "last",
): number {
  const indices = getNavigableIndices(list);
  if (indices.length === 0) return -1;
  if (direction === "first") return indices[0]!;
  if (direction === "last") return indices[indices.length - 1]!;

  const pos = indices.indexOf(current);
  if (direction === "next") {
    if (pos === -1) return indices[0]!;
    return indices[(pos + 1) % indices.length]!;
  }
  if (pos === -1) return indices[indices.length - 1]!;
  return indices[(pos - 1 + indices.length) % indices.length]!;
}

function clampToViewport(
  x: number,
  y: number,
  menuEl?: HTMLElement | null,
): ActionMenuPoint {
  const vw =
    typeof window !== "undefined" && window.innerWidth > 0 ? window.innerWidth : 1024;
  const vh =
    typeof window !== "undefined" && window.innerHeight > 0 ? window.innerHeight : 768;
  const rect = menuEl?.getBoundingClientRect();
  const width =
    menuEl && menuEl.offsetWidth > 0
      ? menuEl.offsetWidth
      : rect && rect.width > 0
        ? rect.width
        : 200;
  const height =
    menuEl && menuEl.offsetHeight > 0
      ? menuEl.offsetHeight
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

function isPlainPoint(input: unknown): input is ActionMenuPoint {
  if (!input || typeof input !== "object") return false;
  if (typeof Event !== "undefined" && input instanceof Event) return false;
  if (typeof HTMLElement !== "undefined" && input instanceof HTMLElement) return false;
  if ("nativeEvent" in input) return false;
  const candidate = input as Record<string, unknown>;
  return typeof candidate.x === "number" && typeof candidate.y === "number";
}

function extractNativeEvent(input?: ActionMenuEventLike | null): Event | null {
  if (!input || typeof input !== "object") return null;
  if (typeof Event !== "undefined" && input instanceof Event) return input;
  if ("nativeEvent" in input && input.nativeEvent instanceof Event) {
    return input.nativeEvent;
  }
  return null;
}

function resolveAnchorElement(
  input?: ActionMenuEventLike | null,
  target?: HTMLElement | null,
): HTMLElement | null {
  if (target instanceof HTMLElement) return target;
  if (input instanceof HTMLElement) return input;
  if (input && typeof input === "object" && !isPlainPoint(input)) {
    const ct = "currentTarget" in input ? input.currentTarget : null;
    if (ct instanceof HTMLElement) return ct;
    const t = "target" in input ? input.target : null;
    if (t instanceof HTMLElement) return t;
  }
  if (
    typeof document !== "undefined" &&
    document.activeElement instanceof HTMLElement &&
    document.activeElement !== document.body
  ) {
    return document.activeElement;
  }
  return null;
}

function computeCoordinates(
  input?: ActionMenuEventLike | null,
  target?: HTMLElement | null,
  menuEl?: HTMLElement | null,
): ActionMenuPoint {
  if (isPlainPoint(input)) {
    return clampToViewport(input.x, input.y, menuEl);
  }

  const native = extractNativeEvent(input);
  const evType =
    native?.type ??
    (input && typeof input === "object" && "type" in input && typeof input.type === "string"
      ? input.type
      : undefined);
  const clientX =
    native instanceof MouseEvent
      ? native.clientX
      : input && typeof input === "object" && "clientX" in input && typeof input.clientX === "number"
        ? input.clientX
        : undefined;
  const clientY =
    native instanceof MouseEvent
      ? native.clientY
      : input && typeof input === "object" && "clientY" in input && typeof input.clientY === "number"
        ? input.clientY
        : undefined;

  if (
    !target &&
    typeof clientX === "number" &&
    typeof clientY === "number" &&
    (evType === "contextmenu" || clientX > 0 || clientY > 0)
  ) {
    const hasExplicitTrigger =
      evType !== "contextmenu" &&
      input &&
      typeof input === "object" &&
      "currentTarget" in input &&
      input.currentTarget instanceof HTMLElement;
    if (!hasExplicitTrigger) {
      return clampToViewport(clientX, clientY, menuEl);
    }
  }

  const directAnchor =
    target instanceof HTMLElement
      ? target
      : input instanceof HTMLElement
        ? input
        : input && typeof input === "object" && "currentTarget" in input && input.currentTarget instanceof HTMLElement
          ? input.currentTarget
          : input && typeof input === "object" && "target" in input && input.target instanceof HTMLElement
            ? input.target
            : null;

  if (directAnchor) {
    const rect = directAnchor.getBoundingClientRect();
    return clampToViewport(rect.left, rect.bottom + 4, menuEl);
  }

  if (typeof clientX === "number" && typeof clientY === "number") {
    return clampToViewport(clientX, clientY, menuEl);
  }

  return clampToViewport(VIEWPORT_PADDING, VIEWPORT_PADDING, menuEl);
}

function renderActionIcon(
  icon: ActionMenuIcon | undefined,
  customRenderer: ((props: { item: ActionMenuItem }) => ReactNode) | undefined,
  item: ActionMenuItem,
): ReactNode {
  if (customRenderer) {
    return customRenderer({ item });
  }
  if (icon === undefined || icon === null || icon === false) return null;
  if (isValidElement(icon)) {
    const prev = (icon.props as { className?: string }).className;
    return cloneElement(icon as ReactElement<{ className?: string; "aria-hidden"?: "true" }>, {
      className: ["mw-action-menu__icon", prev].filter(Boolean).join(" "),
      "aria-hidden": "true",
    });
  }
  if (typeof icon === "string" || typeof icon === "number") {
    return (
      <span className="mw-action-menu__icon" aria-hidden="true">
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
        className: "mw-action-menu__icon",
        "aria-hidden": "true",
      },
    );
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

export const ActionMenu = forwardRef<ActionMenuHandle, ActionMenuProps>(
  function MwActionMenu(
    {
      items = [],
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      position: positionProp,
      anchorEl: anchorElProp,
      trigger,
      contextMenu = false,
      appendTo = "body",
      renderIcon,
      icon: iconRendererAlias,
      onShow,
      onHide,
      className,
      style,
      onKeyDown,
      ...rest
    },
    forwardedRef,
  ) {
    const isControlled = openProp !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
    const isOpen = isControlled ? Boolean(openProp) : uncontrolledOpen;

    const isOpenRef = useRef(isOpen);
    isOpenRef.current = isOpen;
    const isControlledRef = useRef(isControlled);
    isControlledRef.current = isControlled;
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const onShowRef = useRef(onShow);
    onShowRef.current = onShow;
    const onHideRef = useRef(onHide);
    onHideRef.current = onHide;

    const { slot, layerZ } = useOverlayZIndex(isOpen);
    const slotRef = useRef(slot);
    slotRef.current = slot;

    const menuRef = useRef<HTMLDivElement | null>(null);
    const triggerElRef = useRef<HTMLElement | null>(anchorElProp ?? null);
    const openingEventRef = useRef<Event | null>(null);
    const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const pendingFocusKeyRef = useRef<string | null>(null);

    const [coords, setCoords] = useState<ActionMenuPoint>(() =>
      positionProp
        ? clampToViewport(positionProp.x, positionProp.y, null)
        : { x: VIEWPORT_PADDING, y: VIEWPORT_PADDING },
    );
    const [focusPath, setFocusPath] = useState<number[]>([]);
    const [expandedPath, setExpandedPath] = useState<number[]>([]);

    const focusPathRef = useRef(focusPath);
    focusPathRef.current = focusPath;
    const expandedPathRef = useRef(expandedPath);
    expandedPathRef.current = expandedPath;

    const visibleItems = useMemo(
      () => (Array.isArray(items) ? items.filter(isItemVisible) : []),
      [items],
    );
    const visibleItemsRef = useRef(visibleItems);
    visibleItemsRef.current = visibleItems;

    const resetMenuState = useCallback(() => {
      setFocusPath([]);
      setExpandedPath([]);
      focusPathRef.current = [];
      expandedPathRef.current = [];
      pendingFocusKeyRef.current = null;
      buttonRefs.current.clear();
    }, []);

    const setOpenState = useCallback((next: boolean) => {
      const prev = isOpenRef.current;
      if (!isControlledRef.current) {
        setUncontrolledOpen(next);
        isOpenRef.current = next;
      }
      if (next !== prev) {
        onOpenChangeRef.current?.(next);
      }
    }, []);

    const hide = useCallback(() => {
      if (!isOpenRef.current && !isControlledRef.current) {
        return;
      }
      openingEventRef.current = null;
      setOpenState(false);
    }, [setOpenState]);

    const show = useCallback<ActionMenuHandle["show"]>(
      (event, target) => {
        openingEventRef.current = extractNativeEvent(event);
        triggerElRef.current = resolveAnchorElement(event, target ?? anchorElProp ?? null);
        const nextCoords = computeCoordinates(
          event,
          target ?? anchorElProp ?? null,
          menuRef.current,
        );
        setCoords(nextCoords);
        setFocusPath([]);
        setExpandedPath([]);
        focusPathRef.current = [];
        expandedPathRef.current = [];

        if (isOpenRef.current) {
          queueMicrotask(() => {
            setCoords((prev) => clampToViewport(prev.x, prev.y, menuRef.current));
            menuRef.current?.focus();
          });
          return;
        }

        setOpenState(true);
      },
      [anchorElProp, setOpenState],
    );

    const toggle = useCallback<ActionMenuHandle["toggle"]>(
      (event, target) => {
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
        show,
        hide,
        toggle,
        get open() {
          return isOpenRef.current;
        },
      }),
      [show, hide, toggle],
    );

    useIsomorphicLayoutEffect(() => {
      if (positionProp) {
        setCoords(clampToViewport(positionProp.x, positionProp.y, menuRef.current));
      } else if (anchorElProp && isOpen) {
        triggerElRef.current = anchorElProp;
        setCoords(computeCoordinates(null, anchorElProp, menuRef.current));
      }
    }, [positionProp?.x, positionProp?.y, anchorElProp, isOpen]);

    useIsomorphicLayoutEffect(() => {
      const key = pendingFocusKeyRef.current;
      if (key !== null) {
        pendingFocusKeyRef.current = null;
        buttonRefs.current.get(key)?.focus();
      }
    });

    const activateLeafItem = useCallback(
      (event: Event, item: ActionMenuItem) => {
        item.command?.({ originalEvent: event, item });
        if (typeof item.url === "string" && item.url && typeof window !== "undefined") {
          window.open(
            item.url,
            typeof item.target === "string" ? item.target : "_self",
            item.target === "_blank" ? "noopener,noreferrer" : undefined,
          );
        }
        hide();
      },
      [hide],
    );

    const focusAtPath = useCallback((nextFocus: number[], nextExpanded: number[]) => {
      focusPathRef.current = nextFocus;
      expandedPathRef.current = nextExpanded;
      const key = pathKey(nextFocus);
      const immediateBtn = buttonRefs.current.get(key);
      if (immediateBtn) {
        pendingFocusKeyRef.current = null;
        setExpandedPath(nextExpanded);
        setFocusPath(nextFocus);
        immediateBtn.focus();
      } else {
        pendingFocusKeyRef.current = key;
        setExpandedPath(nextExpanded);
        setFocusPath(nextFocus);
      }
    }, []);

    const processKeyNavigation = useCallback(
      (event: globalThis.KeyboardEvent) => {
        if (!isOpenRef.current) return;

        const rootList = visibleItemsRef.current;
        const curFocus = focusPathRef.current;
        const curExpanded = expandedPathRef.current;

        if (event.key === "Escape") {
          if (hasHigherOverlayInDom(slotRef.current)) return;
          event.preventDefault();
          event.stopPropagation();
          const restoreTarget = triggerElRef.current;
          hide();
          if (
            restoreTarget &&
            typeof restoreTarget.focus === "function" &&
            typeof document !== "undefined" &&
            document.contains(restoreTarget)
          ) {
            restoreTarget.focus();
          }
          return;
        }

        if (
          event.key === "ArrowDown" ||
          event.key === "ArrowUp" ||
          event.key === "Home" ||
          event.key === "End"
        ) {
          event.preventDefault();
          event.stopPropagation();
          const direction =
            event.key === "ArrowDown"
              ? "next"
              : event.key === "ArrowUp"
                ? "prev"
                : event.key === "Home"
                  ? "first"
                  : "last";

          const parentPath = curFocus.length > 0 ? curFocus.slice(0, -1) : [];
          const currentIdx = curFocus.length > 0 ? curFocus[curFocus.length - 1]! : -1;
          const list = getListAtParentPath(rootList, parentPath);
          const nextIdx = findMovedIndex(list, currentIdx, direction);
          if (nextIdx >= 0) {
            focusAtPath([...parentPath, nextIdx], parentPath);
          }
          return;
        }

        if (event.key === "ArrowRight") {
          const candidatePath =
            curFocus.length > 0
              ? curFocus
              : (() => {
                  const first = findMovedIndex(rootList, -1, "first");
                  return first >= 0 ? [first] : [];
                })();
          const currentItem = getItemAtPath(rootList, candidatePath);
          if (currentItem && hasSubmenu(currentItem)) {
            event.preventDefault();
            event.stopPropagation();
            const subItems = getSubItems(currentItem);
            const firstSub = findMovedIndex(subItems, -1, "first");
            if (firstSub >= 0) {
              focusAtPath([...candidatePath, firstSub], candidatePath);
            } else {
              focusAtPath(candidatePath, candidatePath);
            }
          }
          return;
        }

        if (event.key === "ArrowLeft") {
          if (curFocus.length > 1) {
            event.preventDefault();
            event.stopPropagation();
            const parentFocus = curFocus.slice(0, -1);
            focusAtPath(parentFocus, parentFocus.slice(0, -1));
            return;
          }
          if (curExpanded.length > 0) {
            event.preventDefault();
            event.stopPropagation();
            const closedTarget = curExpanded;
            focusAtPath(closedTarget, curExpanded.slice(0, -1));
          }
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          const activeItem = getItemAtPath(rootList, curFocus);
          if (!activeItem || activeItem.separator) return;
          event.preventDefault();
          event.stopPropagation();
          if (isItemDisabled(activeItem)) return;

          const subItems = getSubItems(activeItem);
          if (subItems.length > 0) {
            const firstSub = findMovedIndex(subItems, -1, "first");
            if (firstSub >= 0) {
              focusAtPath([...curFocus, firstSub], curFocus);
            } else {
              focusAtPath(curFocus, curFocus);
            }
            return;
          }

          activateLeafItem(event, activeItem);
        }
      },
      [activateLeafItem, focusAtPath, hide],
    );

    const wasOpenRef = useRef(false);
    useIsomorphicLayoutEffect(() => {
      if (isOpen && !wasOpenRef.current) {
        wasOpenRef.current = true;
        onShowRef.current?.();
      } else if (!isOpen && wasOpenRef.current) {
        wasOpenRef.current = false;
        resetMenuState();
        onHideRef.current?.();
      }
    }, [isOpen, resetMenuState]);

    useIsomorphicLayoutEffect(() => {
      if (!isOpen) return;

      setCoords((prev) => clampToViewport(prev.x, prev.y, menuRef.current));
      menuRef.current?.focus();

      queueMicrotask(() => {
        openingEventRef.current = null;
      });

      const onOutsidePointer = (event: Event) => {
        if (event === openingEventRef.current) return;
        const target = event.target as Node | null;
        if (target && menuRef.current?.contains(target)) return;
        hide();
      };

      const onWindowKeyCapture = (event: globalThis.KeyboardEvent) => {
        if (event.key !== "Escape") return;
        if (hasHigherOverlayInDom(slotRef.current)) return;
        event.preventDefault();
        event.stopPropagation();
        const restoreTarget = triggerElRef.current;
        hide();
        if (
          restoreTarget &&
          typeof restoreTarget.focus === "function" &&
          document.contains(restoreTarget)
        ) {
          restoreTarget.focus();
        }
      };

      const onDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
        if (!isOpenRef.current) return;
        if (
          menuRef.current &&
          event.target instanceof Node &&
          menuRef.current.contains(event.target)
        ) {
          return;
        }
        processKeyNavigation(event);
      };

      const onScroll = (event: Event) => {
        const target = event.target as Node | null;
        if (target && menuRef.current?.contains(target)) return;
        hide();
      };

      const onResize = () => {
        hide();
      };

      document.addEventListener("pointerdown", onOutsidePointer, true);
      document.addEventListener("mousedown", onOutsidePointer, true);
      window.addEventListener("keydown", onWindowKeyCapture, true);
      document.addEventListener("keydown", onDocumentKeyDown);
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);

      return () => {
        document.removeEventListener("pointerdown", onOutsidePointer, true);
        document.removeEventListener("mousedown", onOutsidePointer, true);
        window.removeEventListener("keydown", onWindowKeyCapture, true);
        document.removeEventListener("keydown", onDocumentKeyDown);
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onResize);
      };
    }, [isOpen, hide, processKeyNavigation]);

    useEffect(() => {
      return () => {
        buttonRefs.current.clear();
        triggerElRef.current = null;
      };
    }, []);

    const handleRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      processKeyNavigation(event.nativeEvent);
    };

    const customIconRenderer = renderIcon ?? iconRendererAlias;

    const renderMenuRows = (
      list: ActionMenuItem[],
      parentPath: readonly number[],
    ): ReactNode => {
      return list.map((item, index) => {
        const itemKey = item.key ?? `${pathKey(parentPath)}-${index}`;
        if (item.separator) {
          return (
            <div
              key={itemKey}
              role="separator"
              className="mw-action-menu__separator"
            />
          );
        }

        const currentPath = [...parentPath, index];
        const keyStr = pathKey(currentPath);
        const disabled = isItemDisabled(item);
        const subItems = getSubItems(item);
        const isExpanded = !disabled && subItems.length > 0 && isPathPrefix(currentPath, expandedPath);
        const isHighlighted = isSamePath(currentPath, focusPath);
        const rowClass = [
          "mw-action-menu__row",
          disabled ? "mw-action-menu__row--disabled" : undefined,
          isExpanded ? "mw-action-menu__row--expanded" : undefined,
          item.className ?? item.class,
        ]
          .filter(Boolean)
          .join(" ");

        const buttonClass = [
          "mw-action-menu__item",
          item.danger ? "mw-action-menu__item--danger" : undefined,
          disabled ? "mw-action-menu__item--disabled" : undefined,
        ]
          .filter(Boolean)
          .join(" ");

        const tooltipText =
          (disabled ? item.disabledReason : undefined) ?? item.tooltip;

        const buttonNode = (
          <button
            ref={(el) => {
              if (el) {
                buttonRefs.current.set(keyStr, el);
              } else {
                buttonRefs.current.delete(keyStr);
              }
            }}
            type="button"
            role="menuitem"
            className={buttonClass}
            aria-disabled={disabled || undefined}
            aria-haspopup={subItems.length > 0 ? "menu" : undefined}
            aria-expanded={
              subItems.length > 0 && !disabled ? isExpanded : undefined
            }
            data-disabled={disabled ? "" : undefined}
            data-danger={item.danger ? "" : undefined}
            data-highlighted={isHighlighted ? "" : undefined}
            tabIndex={isHighlighted ? 0 : -1}
            onFocus={() => {
              focusPathRef.current = currentPath;
              setFocusPath(currentPath);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) {
                e.preventDefault();
                return;
              }
              if (subItems.length > 0) {
                expandedPathRef.current = currentPath;
                setExpandedPath(currentPath);
                return;
              }
              activateLeafItem(e.nativeEvent, item);
            }}
          >
            {renderActionIcon(item.icon, customIconRenderer, item)}
            <span className="mw-action-menu__label">{resolveLabel(item)}</span>
            {item.shortcut ? (
              <span className="mw-action-menu__shortcut">{item.shortcut}</span>
            ) : null}
            {subItems.length > 0 ? (
              <span className="mw-action-menu__submenu-caret" aria-hidden="true">
                <ChevronRight aria-hidden="true" />
              </span>
            ) : null}
          </button>
        );

        return (
          <div
            key={itemKey}
            className={rowClass}
            style={item.style}
            onMouseEnter={(e) => {
              const originMenu = (e.target as HTMLElement | null)?.closest(
                '[role="menu"]',
              );
              const ownMenu = e.currentTarget.closest('[role="menu"]');
              if (originMenu && ownMenu && originMenu !== ownMenu) {
                return;
              }
              focusPathRef.current = currentPath;
              setFocusPath(currentPath);
              const nextExp = hasSubmenu(item) ? currentPath : [...parentPath];
              expandedPathRef.current = nextExp;
              setExpandedPath(nextExp);
            }}
          >
            {tooltipText ? (
              <Tooltip content={tooltipText} placement="top">
                {buttonNode}
              </Tooltip>
            ) : (
              buttonNode
            )}

            {isExpanded ? (
              <div
                role="menu"
                className="mw-action-menu mw-action-menu__submenu mw-frost"
                tabIndex={-1}
              >
                {renderMenuRows(subItems, currentPath)}
              </div>
            ) : null}
          </div>
        );
      });
    };

    const resolvedTrigger =
      typeof trigger === "function"
        ? trigger({ open: isOpen, show, hide, toggle })
        : trigger;

    const triggerNode = useMemo(() => {
      if (resolvedTrigger === undefined || resolvedTrigger === null) {
        return null;
      }
      if (isValidElement(resolvedTrigger)) {
        const prevProps = resolvedTrigger.props as {
          onClick?: (e: ReactMouseEvent<HTMLElement>) => void;
          onContextMenu?: (e: ReactMouseEvent<HTMLElement>) => void;
        };
        if (contextMenu) {
          return cloneElement(
            resolvedTrigger as ReactElement<{
              onContextMenu?: (e: ReactMouseEvent<HTMLElement>) => void;
            }>,
            {
              onContextMenu: (e: ReactMouseEvent<HTMLElement>) => {
                prevProps.onContextMenu?.(e);
                if (!e.defaultPrevented) {
                  e.preventDefault();
                  show(e);
                }
              },
            },
          );
        }
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
              prevProps.onClick?.(e);
              if (!e.defaultPrevented) {
                toggle(e, e.currentTarget);
              }
            },
          },
        );
      }
      return (
        <button
          type="button"
          aria-haspopup={contextMenu ? undefined : "menu"}
          aria-expanded={contextMenu ? undefined : isOpen}
          onClick={contextMenu ? undefined : (e) => toggle(e, e.currentTarget)}
          onContextMenu={
            contextMenu
              ? (e) => {
                  e.preventDefault();
                  show(e);
                }
              : undefined
          }
        >
          {resolvedTrigger}
        </button>
      );
    }, [resolvedTrigger, contextMenu, isOpen, show, toggle]);

    const rootClasses = ["mw-action-menu", "mw-frost", className]
      .filter(Boolean)
      .join(" ");

    const floatingStyle = useMemo<CSSProperties>(() => {
      const base: CSSProperties = {
        left: `${coords.x}px`,
        top: `${coords.y}px`,
      };
      if (layerZ) {
        base.zIndex = layerZ;
      }
      return style ? { ...base, ...style } : base;
    }, [coords.x, coords.y, layerZ, style]);

    const menuNode = isOpen ? (
      <div
        {...rest}
        ref={menuRef}
        className={rootClasses}
        style={floatingStyle}
        role="menu"
        data-state="open"
        tabIndex={-1}
        onKeyDown={handleRootKeyDown}
      >
        {renderMenuRows(visibleItems, [])}
      </div>
    ) : null;

    const portalTarget = resolvePortalContainer(appendTo);

    return (
      <>
        {triggerNode}
        {menuNode
          ? portalTarget
            ? createPortal(menuNode, portalTarget)
            : menuNode
          : null}
      </>
    );
  },
);

ActionMenu.displayName = "MwActionMenu";

export default ActionMenu;
