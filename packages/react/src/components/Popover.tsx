import {
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
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import * as RadixPopover from "@radix-ui/react-popover";
import { useOverlayZIndex } from "../lib/overlay-layer";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";

export type PopoverAnchorInput =
  | Event
  | {
      currentTarget?: EventTarget | null;
      target?: EventTarget | null;
      nativeEvent?: Event;
    }
  | HTMLElement
  | null
  | undefined;

export interface PopoverHandle {
  show: (event?: PopoverAnchorInput, target?: HTMLElement | EventTarget | null) => void;
  hide: () => void;
  toggle: (event?: PopoverAnchorInput, target?: HTMLElement | EventTarget | null) => void;
  readonly open: boolean;
}

export interface PopoverTriggerRenderProps {
  open: boolean;
  show: PopoverHandle["show"];
  hide: () => void;
  toggle: PopoverHandle["toggle"];
}

export interface PopoverContentRenderProps {
  open: boolean;
  close: () => void;
  hide: () => void;
}

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 受控打开状态 */
  open?: boolean;
  /** 非受控初始打开状态 */
  defaultOpen?: boolean;
  /** 打开状态变更回调 */
  onOpenChange?: (open: boolean) => void;
  /** 是否为模态浮层（默认 false） */
  modal?: boolean;
  /** 优先弹出方向（默认 'bottom'） */
  side?: PopoverSide;
  /** 与锚点的主轴间距（默认 6） */
  sideOffset?: number;
  /** 交叉轴对齐方式（默认 'start'） */
  align?: PopoverAlign;
  /** 交叉轴偏移量（默认 0） */
  alignOffset?: number;
  /** 视口边缘碰撞自动翻转（默认 true） */
  avoidCollisions?: boolean;
  /** 点击外部是否自动关闭（默认 true） */
  dismissable?: boolean;
  /** 按下 Escape 是否可关闭（默认 true） */
  closeOnEscape?: boolean;
  /** 挂载目标容器（传 `'self'` 时禁用 Portal 原地挂载，默认 `'body'`） */
  appendTo?: "self" | "body" | (string & {}) | HTMLElement | null;
  /** 浮层无障碍标签 */
  ariaLabel?: string;
  /** 声明式触发器 */
  trigger?: ReactNode | ((props: PopoverTriggerRenderProps) => ReactNode);
  /** 面板 DOM 引用 */
  contentRef?: Ref<HTMLDivElement>;
  /** 打开回调 */
  onShow?: () => void;
  /** 关闭回调 */
  onHide?: () => void;
  /** 浮层内容（支持渲染函数接收 `{ open, close, hide }`） */
  children?: ReactNode | ((props: PopoverContentRenderProps) => ReactNode);
}

function resolveAnchorElement(
  eventOrEl?: PopoverAnchorInput,
  target?: HTMLElement | EventTarget | null,
): HTMLElement | null {
  if (target && target instanceof HTMLElement) {
    return target;
  }
  if (eventOrEl && eventOrEl instanceof HTMLElement) {
    return eventOrEl;
  }
  if (eventOrEl && typeof eventOrEl === "object") {
    const candidate = eventOrEl.currentTarget ?? eventOrEl.target;
    if (candidate && candidate instanceof HTMLElement) {
      return candidate;
    }
  }
  return null;
}

function resolvePortalContainer(
  appendTo?: "self" | "body" | (string & {}) | HTMLElement | null,
): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  if (!appendTo || appendTo === "body" || appendTo === "self") {
    return document.body;
  }
  if (typeof appendTo === "string") {
    return (document.querySelector(appendTo) as HTMLElement | null) ?? document.body;
  }
  return appendTo;
}

function extractOriginalTarget(event: Event): Node | null {
  const custom = event as CustomEvent<{ originalEvent?: Event }>;
  const target = custom.detail?.originalEvent?.target ?? event.target;
  return target instanceof Node ? target : null;
}

function hasHigherOverlayInDom(mySlot: number): boolean {
  if (typeof document === "undefined" || mySlot <= 0) return false;
  const nodes = document.querySelectorAll<HTMLElement>('[style*="--z-overlay"]');
  for (const el of nodes) {
    const m = el.style.zIndex.match(/\+\s*(\d+)\)/);
    if (m && Number(m[1]) > mySlot) return true;
  }
  return false;
}

export const Popover = forwardRef<PopoverHandle, PopoverProps>(function MwPopover(
  {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    modal = false,
    side = "bottom",
    sideOffset = 6,
    align = "start",
    alignOffset = 0,
    avoidCollisions = true,
    dismissable = true,
    closeOnEscape = true,
    appendTo,
    ariaLabel,
    trigger,
    contentRef,
    onShow,
    onHide,
    className,
    style,
    onKeyDown,
    children,
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

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [anchorRevision, setAnchorRevision] = useState(0);
  const virtualAnchorRef = useRef<HTMLElement | null>(null);
  virtualAnchorRef.current = anchorEl;

  const interactedOutsideRef = useRef(false);
  const panelNodeRef = useRef<HTMLDivElement | null>(null);

  const { slot, layerZ } = useOverlayZIndex(isOpen);
  const slotRef = useRef(slot);
  slotRef.current = slot;

  const setOpen = useCallback((next: boolean) => {
    const current = isOpenRef.current;
    if (!isControlledRef.current) {
      setUncontrolledOpen(next);
      isOpenRef.current = next;
    }
    if (next !== current || !isControlledRef.current) {
      if (next !== current) {
        onOpenChangeRef.current?.(next);
      }
    }
  }, []);

  const prevOpenRef = useRef<boolean>(false);
  useIsomorphicLayoutEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      prevOpenRef.current = true;
      interactedOutsideRef.current = false;
      onShowRef.current?.();
    } else if (!isOpen && prevOpenRef.current) {
      prevOpenRef.current = false;
      onHideRef.current?.();
    }
  }, [isOpen]);

  useIsomorphicLayoutEffect(() => {
    const node = panelNodeRef.current;
    if (!node || !layerZ) return;
    const wrapper = node.parentElement;
    if (wrapper?.hasAttribute("data-radix-popper-content-wrapper")) {
      wrapper.style.zIndex = layerZ;
    }
  }, [isOpen, layerZ]);

  const show = useCallback<PopoverHandle["show"]>(
    (event, target) => {
      const resolved = resolveAnchorElement(event, target);
      if (resolved) {
        virtualAnchorRef.current = resolved;
        setAnchorEl(resolved);
        setAnchorRevision((r) => r + 1);
      }
      setOpen(true);
    },
    [setOpen],
  );

  const hide = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const toggle = useCallback<PopoverHandle["toggle"]>(
    (event, target) => {
      const resolved = resolveAnchorElement(event, target);
      if (resolved) {
        if (
          isOpenRef.current &&
          virtualAnchorRef.current &&
          virtualAnchorRef.current !== resolved
        ) {
          virtualAnchorRef.current = resolved;
          setAnchorEl(resolved);
          setAnchorRevision((r) => r + 1);
          return;
        }
        virtualAnchorRef.current = resolved;
        setAnchorEl(resolved);
        setAnchorRevision((r) => r + 1);
      }
      setOpen(!isOpenRef.current);
    },
    [setOpen],
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

  useEffect(() => {
    return () => {
      virtualAnchorRef.current = null;
    };
  }, []);

  const setMergedContentRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelNodeRef.current = node;
      if (node && layerZ) {
        const wrapper = node.parentElement;
        if (wrapper?.hasAttribute("data-radix-popper-content-wrapper")) {
          wrapper.style.zIndex = layerZ;
        }
      }
      if (typeof contentRef === "function") {
        contentRef(node);
      } else if (contentRef) {
        (contentRef as { current: HTMLDivElement | null }).current = node;
      }
    },
    [contentRef, layerZ],
  );

  const handleEscapeKeyDown = (event: globalThis.KeyboardEvent) => {
    if (!closeOnEscape) {
      event.preventDefault();
    }
  };

  const handleContentKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.key !== "Escape" || event.defaultPrevented) return;
    if (!closeOnEscape) {
      event.preventDefault();
      return;
    }
    const target = event.currentTarget;
    if (!event.bubbles || (target && !document.body.contains(target))) {
      event.stopPropagation();
      setOpen(false);
      const anchor = virtualAnchorRef.current;
      if (anchor && document.contains(anchor)) {
        anchor.focus();
      }
    }
  };

  const handlePointerDownOutside = (event: Event) => {
    if (!dismissable || hasHigherOverlayInDom(slotRef.current)) {
      event.preventDefault();
      return;
    }
    const target = extractOriginalTarget(event);
    if (target && virtualAnchorRef.current?.contains(target)) {
      event.preventDefault();
      return;
    }
    interactedOutsideRef.current = true;
  };

  const handleInteractOutside = (event: Event) => {
    if (!dismissable || hasHigherOverlayInDom(slotRef.current)) {
      event.preventDefault();
      return;
    }
    const target = extractOriginalTarget(event);
    if (target && virtualAnchorRef.current?.contains(target)) {
      event.preventDefault();
      return;
    }
    interactedOutsideRef.current = true;
  };

  const handleCloseAutoFocus = (event: Event) => {
    const anchor = virtualAnchorRef.current;
    if (!interactedOutsideRef.current && anchor && document.contains(anchor)) {
      event.preventDefault();
      anchor.focus();
    }
    interactedOutsideRef.current = false;
  };

  const contentClasses = ["mw-popover", "mw-frost", className].filter(Boolean).join(" ");
  const contentInlineStyle = useMemo<CSSProperties>(() => {
    const base: CSSProperties = {};
    if (layerZ) {
      base.zIndex = layerZ;
    }
    return style ? { ...base, ...style } : base;
  }, [layerZ, style]);

  const resolvedTrigger =
    typeof trigger === "function"
      ? trigger({ open: isOpen, show, hide, toggle })
      : trigger;

  const contentNode = (
    <RadixPopover.Content
      {...rest}
      ref={setMergedContentRef}
      className={contentClasses}
      style={contentInlineStyle}
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      avoidCollisions={avoidCollisions}
      aria-label={ariaLabel || (rest["aria-label"] as string | undefined)}
      onEscapeKeyDown={handleEscapeKeyDown}
      onPointerDownOutside={handlePointerDownOutside}
      onInteractOutside={handleInteractOutside}
      onCloseAutoFocus={handleCloseAutoFocus}
      onKeyDown={handleContentKeyDown}
    >
      {typeof children === "function"
        ? children({ open: isOpen, close: hide, hide })
        : children}
    </RadixPopover.Content>
  );

  return (
    <RadixPopover.Root open={isOpen} modal={modal} onOpenChange={setOpen}>
      {resolvedTrigger !== undefined && resolvedTrigger !== null ? (
        isValidElement(resolvedTrigger) ? (
          <RadixPopover.Trigger asChild>{resolvedTrigger}</RadixPopover.Trigger>
        ) : (
          <RadixPopover.Trigger>{resolvedTrigger}</RadixPopover.Trigger>
        )
      ) : null}

      {anchorEl || resolvedTrigger === undefined || resolvedTrigger === null ? (
        <RadixPopover.Anchor
          key={anchorRevision}
          virtualRef={anchorEl ? virtualAnchorRef : undefined}
        />
      ) : null}

      {appendTo === "self" ? (
        contentNode
      ) : (
        <RadixPopover.Portal container={resolvePortalContainer(appendTo)}>
          {contentNode}
        </RadixPopover.Portal>
      )}
    </RadixPopover.Root>
  );
});

Popover.displayName = "MwPopover";

export default Popover;
