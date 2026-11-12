import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Maximize, RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { useOverlayZIndex } from "../lib/overlay-layer";
import { useUiLocale } from "../locale";

const MIN_SCALE = 0.2;
const MAX_SCALE = 8;

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

function LightboxLifecycle({
  onMount,
  onUnmountLayout,
  onUnmountPassive,
}: {
  onMount: () => void;
  onUnmountLayout: () => void;
  onUnmountPassive: () => void;
}) {
  const onMountRef = useRef(onMount);
  onMountRef.current = onMount;
  const onUnmountLayoutRef = useRef(onUnmountLayout);
  onUnmountLayoutRef.current = onUnmountLayout;
  const onUnmountPassiveRef = useRef(onUnmountPassive);
  onUnmountPassiveRef.current = onUnmountPassive;

  useIsomorphicLayoutEffect(() => {
    onMountRef.current();
    return () => {
      onUnmountLayoutRef.current();
    };
  }, []);

  useEffect(() => {
    return () => {
      onUnmountPassiveRef.current();
    };
  }, []);

  return null;
}

export interface ImageLightboxProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 受控显示状态（对标 Vue `visible`） */
  visible?: boolean;
  /** 受控显示状态别名 */
  open?: boolean;
  /** 非受控初始显示状态 */
  defaultOpen?: boolean;
  /** 显示状态变更回调（对标 Vue `update:visible`） */
  onVisibleChange?: (visible: boolean) => void;
  /** 显示状态变更回调别名 */
  onOpenChange?: (open: boolean) => void;
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 底部图注 */
  caption?: ReactNode | null;
  /** 挂载目标容器（传 `'self'` 时禁用 Portal 原地挂载，默认 `'body'`） */
  appendTo?: "self" | "body" | (string & {}) | HTMLElement | null;
}

export const ImageLightbox = forwardRef<HTMLDivElement, ImageLightboxProps>(
  function MwImageLightbox(
    {
      visible,
      open,
      defaultOpen = false,
      onVisibleChange,
      onOpenChange,
      src,
      alt,
      caption,
      appendTo,
      className,
      style,
      onClick,
      ...rest
    },
    forwardedRef,
  ) {
    const { messages, t } = useUiLocale();

    const defaultImageAlt = t(
      "common.lightbox.imageAlt",
      undefined,
      messages.common.lightbox.imageAlt,
    );
    const zoomInLabel = t(
      "common.lightbox.zoomIn",
      undefined,
      messages.common.lightbox.zoomIn,
    );
    const zoomOutLabel = t(
      "common.lightbox.zoomOut",
      undefined,
      messages.common.lightbox.zoomOut,
    );
    const rotateLeftLabel = t(
      "common.lightbox.rotateLeft",
      undefined,
      messages.common.lightbox.rotateLeft,
    );
    const rotateRightLabel = t(
      "common.lightbox.rotateRight",
      undefined,
      messages.common.lightbox.rotateRight,
    );
    const resetLabel = t(
      "common.lightbox.reset",
      undefined,
      messages.common.lightbox.reset,
    );
    const closeLabel = t(
      "common.action.close",
      undefined,
      messages.common.action.close,
    );

    const controlledValue = open !== undefined ? open : visible;
    const isControlled = controlledValue !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
    const isOpen = isControlled ? Boolean(controlledValue) : uncontrolledOpen;

    const wasOpenDuringRenderRef = useRef(false);
    const previousActiveRef = useRef<HTMLElement | null>(null);
    if (isOpen && !wasOpenDuringRenderRef.current) {
      wasOpenDuringRenderRef.current = true;
      if (
        typeof document !== "undefined" &&
        document.activeElement instanceof HTMLElement
      ) {
        previousActiveRef.current = document.activeElement;
      }
    } else if (!isOpen && wasOpenDuringRenderRef.current) {
      wasOpenDuringRenderRef.current = false;
    }

    const { slot, layerZ } = useOverlayZIndex(isOpen);
    const slotRef = useRef(slot);
    slotRef.current = slot;

    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const dialogNodeRef = useRef<HTMLDivElement | null>(null);
    const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);
    const dragStartRef = useRef<{
      x: number;
      y: number;
      tx: number;
      ty: number;
    } | null>(null);

    const onVisibleChangeRef = useRef(onVisibleChange);
    onVisibleChangeRef.current = onVisibleChange;
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const isControlledRef = useRef(isControlled);
    isControlledRef.current = isControlled;
    const isOpenRef = useRef(isOpen);
    isOpenRef.current = isOpen;

    const resetTransform = useCallback(() => {
      setScale(1);
      setRotation(0);
      setTranslate({ x: 0, y: 0 });
      dragStartRef.current = null;
    }, []);

    const requestOpenChange = useCallback((next: boolean) => {
      if (!isControlledRef.current) {
        setUncontrolledOpen(next);
        isOpenRef.current = next;
      }
      if (next !== isOpenRef.current || isControlledRef.current) {
        onVisibleChangeRef.current?.(next);
        onOpenChangeRef.current?.(next);
      }
    }, []);

    const close = useCallback(() => {
      requestOpenChange(false);
    }, [requestOpenChange]);

    const zoomBy = useCallback((factor: number) => {
      setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * factor)));
    }, []);

    const rotateBy = useCallback((delta: number) => {
      setRotation((prev) => (prev + delta) % 360);
    }, []);

    const previousOverflowRef = useRef<string>("");
    const scrollLockedRef = useRef<boolean>(false);

    const handleContentMount = useCallback(() => {
      resetTransform();
      if (typeof document !== "undefined") {
        previousOverflowRef.current = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        scrollLockedRef.current = true;
      }
      closeButtonRef.current?.focus();
    }, [resetTransform]);

    const handleContentUnmountLayout = useCallback(() => {
      if (scrollLockedRef.current && typeof document !== "undefined") {
        document.body.style.overflow = previousOverflowRef.current;
        scrollLockedRef.current = false;
      }
      const restoreEl = previousActiveRef.current;
      if (restoreEl && typeof document !== "undefined" && document.contains(restoreEl)) {
        restoreEl.focus();
      }
    }, []);

    const handleContentUnmountPassive = useCallback(() => {
      const restoreEl = previousActiveRef.current;
      previousActiveRef.current = null;
      if (restoreEl && typeof document !== "undefined" && document.contains(restoreEl)) {
        restoreEl.focus();
      }
    }, []);

    useIsomorphicLayoutEffect(() => {
      if (!isOpen || typeof document === "undefined" || typeof window === "undefined") {
        return;
      }

      const onWindowKeyDown = (event: globalThis.KeyboardEvent) => {
        if (hasHigherOverlayInDom(slotRef.current)) return;

        if (event.key === "Tab") {
          const buttons = Array.from(
            dialogNodeRef.current?.querySelectorAll<HTMLButtonElement>(
              "button:not([disabled])",
            ) ?? [],
          );
          const first = buttons[0];
          const last = buttons[buttons.length - 1];
          if (!first || !last) return;
          if (
            event.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === dialogNodeRef.current)
          ) {
            event.preventDefault();
            last.focus();
          } else if (
            !event.shiftKey &&
            (document.activeElement === last ||
              document.activeElement === dialogNodeRef.current)
          ) {
            event.preventDefault();
            first.focus();
          }
          return;
        }

        if (event.key === "Escape") {
          if (!event.defaultPrevented) {
            event.preventDefault();
            close();
          }
          return;
        }

        if (event.key === "+" || event.key === "=") {
          zoomBy(1.2);
        } else if (event.key === "-") {
          zoomBy(1 / 1.2);
        }
      };

      window.addEventListener("keydown", onWindowKeyDown);

      return () => {
        window.removeEventListener("keydown", onWindowKeyDown);
      };
    }, [isOpen, close, zoomBy]);

    useIsomorphicLayoutEffect(() => {
      if (!isOpen || !stageEl) return;

      const onWheel = (event: globalThis.WheelEvent) => {
        event.preventDefault();
        zoomBy(event.deltaY < 0 ? 1.15 : 1 / 1.15);
      };

      stageEl.addEventListener("wheel", onWheel, { passive: false });
      return () => {
        stageEl.removeEventListener("wheel", onWheel);
      };
    }, [isOpen, stageEl, zoomBy]);

    const setMergedDialogRef = useCallback(
      (node: HTMLDivElement | null) => {
        dialogNodeRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as { current: HTMLDivElement | null }).current = node;
        }
      },
      [forwardedRef],
    );

    const handlePointerDown = (event: PointerEvent<HTMLImageElement>) => {
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        tx: translate.x,
        ty: translate.y,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent<HTMLImageElement>) => {
      const start = dragStartRef.current;
      if (!start) return;
      setTranslate({
        x: start.tx + (event.clientX - start.x),
        y: start.ty + (event.clientY - start.y),
      });
    };

    const handlePointerUp = () => {
      dragStartRef.current = null;
    };

    const handleBackdropSelfClick = (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && event.target === event.currentTarget) {
        close();
      }
    };

    const handleStageSelfClick = (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        close();
      }
    };

    const captionText =
      typeof caption === "string" || typeof caption === "number"
        ? String(caption)
        : undefined;
    const resolvedAriaLabel = captionText || alt || defaultImageAlt;

    const lightboxClasses = ["mw-lightbox", className].filter(Boolean).join(" ");
    const lightboxStyle = useMemo<CSSProperties | undefined>(() => {
      if (!layerZ && !style) return undefined;
      const base: CSSProperties = {};
      if (layerZ) {
        base.zIndex = layerZ;
      }
      return style ? { ...base, ...style } : base;
    }, [layerZ, style]);

    const imgTransform = `translate(${translate.x}px, ${translate.y}px) scale(${scale}) rotate(${rotation}deg)`;

    const contentNode = (
      <RadixDialog.Content
        {...rest}
        ref={setMergedDialogRef}
        className={lightboxClasses}
        style={lightboxStyle}
        aria-modal="true"
        aria-label={resolvedAriaLabel}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          closeButtonRef.current?.focus();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onClick={handleBackdropSelfClick}
      >
        <LightboxLifecycle
          onMount={handleContentMount}
          onUnmountLayout={handleContentUnmountLayout}
          onUnmountPassive={handleContentUnmountPassive}
        />
        <RadixDialog.Title className="mw-dialog__sr-only">
          {resolvedAriaLabel}
        </RadixDialog.Title>
        <RadixDialog.Description className="mw-dialog__sr-only">
          {alt ?? defaultImageAlt}
        </RadixDialog.Description>

        <div className="mw-lightbox__toolbar" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label={zoomInLabel}
            onClick={() => zoomBy(1.2)}
          >
            <ZoomIn size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={zoomOutLabel}
            onClick={() => zoomBy(1 / 1.2)}
          >
            <ZoomOut size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={rotateLeftLabel}
            onClick={() => rotateBy(-90)}
          >
            <RotateCcw size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={rotateRightLabel}
            onClick={() => rotateBy(90)}
          >
            <RotateCw size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={resetLabel}
            onClick={resetTransform}
          >
            <Maximize size={18} aria-hidden="true" />
          </button>
          <span className="mw-lightbox__divider" aria-hidden="true" />
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={closeLabel}
            onClick={close}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div
          ref={setStageEl}
          className="mw-lightbox__stage"
          onClick={handleStageSelfClick}
        >
          <img
            className="mw-lightbox__img"
            src={src}
            alt={alt ?? defaultImageAlt}
            style={{ transform: imgTransform }}
            draggable={false}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>

        {caption !== undefined && caption !== null && caption !== "" ? (
          <figcaption
            className="mw-lightbox__caption"
            onClick={(e) => e.stopPropagation()}
          >
            {caption}
          </figcaption>
        ) : null}
      </RadixDialog.Content>
    );

    return (
      <RadixDialog.Root open={isOpen} modal={false} onOpenChange={requestOpenChange}>
        {appendTo === "self" ? (
          contentNode
        ) : (
          <RadixDialog.Portal container={resolvePortalContainer(appendTo)}>
            {contentNode}
          </RadixDialog.Portal>
        )}
      </RadixDialog.Root>
    );
  },
);

ImageLightbox.displayName = "MwImageLightbox";

export default ImageLightbox;
