import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { ArrowLeft, Maximize2, Minimize2, X } from "lucide-react";
import { useOverlayZIndex } from "../lib/overlay-layer";
import { useScrollFade } from "../lib/scroll-fade";
import { Tooltip } from "../lib/tooltip";
import { useUiLocale } from "../locale";
import type { DialogProps, DialogSize } from "./dialog-defs";

export type { DialogEmits, DialogProps, DialogSize } from "./dialog-defs";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SIZE_WIDTH_MAP: Record<DialogSize, string> = {
  sm: "min(27.5rem, calc(100vw - var(--space-8)))",
  md: "min(40rem, calc(100vw - var(--space-8)))",
  lg: "min(53.75rem, calc(100vw - var(--space-8)))",
  xl: "min(68.75rem, calc(100vw - var(--space-8)))",
};

function DialogPresenceLifecycle({
  onPresentChange,
}: {
  onPresentChange: (present: boolean) => void;
}) {
  useIsomorphicLayoutEffect(() => {
    onPresentChange(true);
    return () => {
      onPresentChange(false);
    };
  }, [onPresentChange]);
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

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function MwDialog(
  {
    open,
    defaultOpen = false,
    visible,
    onOpenChange,
    onVisibleChange,
    title,
    header,
    headerExtra,
    description,
    size,
    canBack = false,
    backLabel,
    onBack,
    scopeText,
    scope,
    toolbar,
    lead,
    empty,
    footerLeft,
    footer,
    bodyScroll = true,
    modal = true,
    closable = true,
    showHeader = true,
    closeOnEscape = true,
    dismissableMask = false,
    maximizable = false,
    draggable = false,
    blockScroll: _blockScroll = true,
    width,
    contentClass,
    contentClassName,
    contentStyle,
    ariaLabel,
    appendTo,
    closeButtonProps,
    onShow,
    onHide,
    onAfterLeave,
    onMaximize,
    onUnmaximize,
    className,
    style,
    onKeyDown,
    onPointerDown,
    children,
    ...rest
  },
  forwardedRef,
) {
  const { messages, t } = useUiLocale();

  const closeLabel = t("common.action.close", undefined, messages.common.action.close);
  const maximizeLabel = t("common.dialog.maximize", undefined, messages.common.dialog.maximize);
  const restoreLabel = t("common.dialog.restore", undefined, messages.common.dialog.restore);
  const resolvedBackLabel =
    backLabel ?? t("common.admin.back", undefined, messages.common.admin.back);

  const controlledValue = open !== undefined ? open : visible;
  const isControlled = controlledValue !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
  const isOpen = isControlled ? Boolean(controlledValue) : uncontrolledOpen;

  const [maximized, setMaximized] = useState(false);
  const [contentPresent, setContentPresent] = useState(isOpen);

  const { layerZ, scrimZ } = useOverlayZIndex(isOpen || contentPresent);
  const bodyScrollRef = useScrollFade<HTMLDivElement>();

  const pointerDownInsideContentRef = useRef(false);
  const wasOpenRef = useRef(false);
  const leaveEmittedRef = useRef(false);

  const onShowRef = useRef(onShow);
  onShowRef.current = onShow;
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;
  const onAfterLeaveRef = useRef(onAfterLeave);
  onAfterLeaveRef.current = onAfterLeave;

  const requestOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      if (next !== isOpen) {
        onOpenChange?.(next);
        onVisibleChange?.(next);
      }
    },
    [isControlled, isOpen, onOpenChange, onVisibleChange],
  );

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      leaveEmittedRef.current = false;
      onShowRef.current?.();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && !contentPresent && wasOpenRef.current && !leaveEmittedRef.current) {
      leaveEmittedRef.current = true;
      wasOpenRef.current = false;
      setMaximized(false);
      onAfterLeaveRef.current?.();
      onHideRef.current?.();
    }
  }, [isOpen, contentPresent]);

  useEffect(() => {
    return () => {
      pointerDownInsideContentRef.current = false;
    };
  }, []);

  const toggleMaximize = (event: MouseEvent<HTMLButtonElement>) => {
    setMaximized((prev) => {
      const next = !prev;
      if (next) {
        onMaximize?.(event);
      } else {
        onUnmaximize?.(event);
      }
      return next;
    });
  };

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
      requestOpenChange(false);
    }
  };

  const handlePointerDownOutside = (event: Event) => {
    if (!dismissableMask || modal) {
      event.preventDefault();
    }
  };

  const handleInteractOutside = (event: Event) => {
    if (!dismissableMask || modal) {
      event.preventDefault();
    }
  };

  const handleContentPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerDownInsideContentRef.current = true;
    onPointerDown?.(event);
  };

  const handleOverlayPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      pointerDownInsideContentRef.current = false;
    }
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (pointerDownInsideContentRef.current) {
      pointerDownInsideContentRef.current = false;
      return;
    }
    if (dismissableMask && event.target === event.currentTarget) {
      requestOpenChange(false);
    }
  };

  const resolvedTitle = header !== undefined ? header : title;
  const hasTitle =
    resolvedTitle !== undefined && resolvedTitle !== null && resolvedTitle !== "";
  const fallbackAccessibleTitle =
    ariaLabel || (rest["aria-label"] as string | undefined) || closeLabel;
  const hasDescription =
    description !== undefined && description !== null && description !== "";
  const resolvedWidth = width ?? (size ? SIZE_WIDTH_MAP[size] : undefined);

  const dialogClasses = [
    "mw-dialog",
    "mw-frost",
    "mw-frost--thick",
    size ? `mw-dialog--${size}` : undefined,
    maximized ? "mw-dialog--maximized" : undefined,
    !modal ? "mw-dialog--non-modal" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const dialogInlineStyle = useMemo<CSSProperties>(() => {
    const merged: CSSProperties = {};
    if (layerZ) {
      merged.zIndex = layerZ;
    }
    if (resolvedWidth && !maximized) {
      merged.width = resolvedWidth;
    }
    return style ? { ...merged, ...style } : merged;
  }, [layerZ, resolvedWidth, maximized, style]);

  const bodyClasses = [
    "mw-dialog__body",
    bodyScroll ? "mw-scroll" : "mw-dialog__body--locked",
    contentClass,
    contentClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const hasLeadSection = Boolean(scopeText || scope || toolbar || lead);
  const hasFooterSection = Boolean(footerLeft || footer);

  const closeBtnAriaLabel =
    (closeButtonProps?.["aria-label"] as string | undefined) ?? closeLabel;
  const { className: closeBtnClassName, ...restCloseButtonProps } = closeButtonProps ?? {};
  const mergedCloseBtnClassName = [
    "mw-dialog__action-btn",
    "mw-dialog__close",
    closeBtnClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const innerElements = (
    <>
      {modal ? (
        <RadixDialog.Overlay
          className="mw-dialog__overlay"
          style={scrimZ ? { zIndex: scrimZ } : undefined}
          onPointerDown={handleOverlayPointerDown}
          onClick={handleOverlayClick}
        />
      ) : null}
      <RadixDialog.Content
        {...rest}
        ref={forwardedRef}
        className={dialogClasses}
        style={dialogInlineStyle}
        aria-label={ariaLabel || (rest["aria-label"] as string | undefined)}
        data-size={size}
        data-maximized={maximized ? "true" : undefined}
        data-draggable={draggable ? "true" : undefined}
        onEscapeKeyDown={handleEscapeKeyDown}
        onPointerDownOutside={handlePointerDownOutside}
        onInteractOutside={handleInteractOutside}
        onPointerDown={handleContentPointerDown}
        onKeyDown={handleContentKeyDown}
      >
        <DialogPresenceLifecycle onPresentChange={setContentPresent} />

        {showHeader ? (
          <header className="mw-dialog__header">
            <div className="mw-dialog__title-row">
              {canBack ? (
                <Tooltip content={resolvedBackLabel} placement="bottom">
                  <button
                    type="button"
                    className="mw-dialog__action-btn mw-dialog__back"
                    aria-label={resolvedBackLabel}
                    onClick={onBack}
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                  </button>
                </Tooltip>
              ) : null}
              <RadixDialog.Title className="mw-dialog__title">
                {hasTitle ? resolvedTitle : fallbackAccessibleTitle}
              </RadixDialog.Title>
              {headerExtra}
            </div>
            {maximizable || closable ? (
              <div className="mw-dialog__actions">
                {maximizable ? (
                  <button
                    type="button"
                    className="mw-dialog__action-btn mw-dialog__maximize"
                    aria-label={maximized ? restoreLabel : maximizeLabel}
                    aria-pressed={maximized}
                    onClick={toggleMaximize}
                  >
                    {maximized ? (
                      <Minimize2 size={16} aria-hidden="true" />
                    ) : (
                      <Maximize2 size={16} aria-hidden="true" />
                    )}
                  </button>
                ) : null}
                {closable ? (
                  <RadixDialog.Close
                    {...restCloseButtonProps}
                    className={mergedCloseBtnClassName}
                    aria-label={closeBtnAriaLabel}
                  >
                    <X size={16} aria-hidden="true" />
                  </RadixDialog.Close>
                ) : null}
              </div>
            ) : null}
          </header>
        ) : (
          <RadixDialog.Title className="mw-dialog__sr-only">
            {hasTitle ? resolvedTitle : fallbackAccessibleTitle}
          </RadixDialog.Title>
        )}

        {hasDescription ? (
          typeof description === "string" || typeof description === "number" ? (
            <RadixDialog.Description className="mw-dialog__description">
              {description}
            </RadixDialog.Description>
          ) : (
            <RadixDialog.Description asChild>
              <div className="mw-dialog__description">{description}</div>
            </RadixDialog.Description>
          )
        ) : (
          <RadixDialog.Description className="mw-dialog__sr-only">
            {typeof resolvedTitle === "string" || typeof resolvedTitle === "number"
              ? String(resolvedTitle) || fallbackAccessibleTitle
              : fallbackAccessibleTitle}
          </RadixDialog.Description>
        )}

        {hasLeadSection ? (
          <div className="mw-dialog__lead">
            {scopeText || scope ? (
              <div className="mw-dialog__scope">
                {scopeText ? (
                  <span className="mw-dialog__scope-text">{scopeText}</span>
                ) : null}
                {scope}
              </div>
            ) : null}
            {toolbar ? <div className="mw-dialog__toolbar">{toolbar}</div> : null}
            {lead}
          </div>
        ) : null}

        <div ref={bodyScrollRef} className={bodyClasses} style={contentStyle}>
          {children}
          {empty}
        </div>

        {hasFooterSection ? (
          <footer
            className={[
              "mw-dialog__footer",
              "mw-size-md",
              footerLeft ? "mw-dialog__footer--split" : undefined,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {footerLeft ? <div className="mw-dialog__footer-left">{footerLeft}</div> : null}
            {footer ? <div className="mw-dialog__footer-right">{footer}</div> : null}
          </footer>
        ) : null}
      </RadixDialog.Content>
    </>
  );

  return (
    <RadixDialog.Root open={isOpen} modal={modal} onOpenChange={requestOpenChange}>
      {appendTo === "self" ? (
        innerElements
      ) : (
        <RadixDialog.Portal container={resolvePortalContainer(appendTo)}>
          {innerElements}
        </RadixDialog.Portal>
      )}
    </RadixDialog.Root>
  );
});

Dialog.displayName = "MwDialog";

export default Dialog;
