import {
  createElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { AlertTriangle, HelpCircle } from "lucide-react";
import {
  useConfirmQueue,
  useConfirmStore,
  type ConfirmIcon,
  type ConfirmRequest,
  type ConfirmStore,
} from "../lib/confirm";
import { useOverlayZIndex } from "../lib/overlay-layer";
import { useUiLocale } from "../locale";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ConfirmHostRenderProps {
  request: ConfirmRequest;
  accept: () => void;
  reject: () => void;
}

export interface ConfirmHostMessageRenderProps {
  message: ConfirmRequest;
}

export interface ConfirmHostProps {
  group?: string;
  store?: ConfirmStore;
  renderMessage?: (props: ConfirmHostMessageRenderProps) => ReactNode;
  message?: (props: ConfirmHostMessageRenderProps) => ReactNode;
  children?: ReactNode | ((props: ConfirmHostRenderProps) => ReactNode);
}

const FALLBACK_REQUEST: ConfirmRequest = {
  id: "",
  message: "",
  danger: false,
  acceptSeverity: "primary",
  defaultFocus: "accept",
  closeOnEscape: true,
  dismissableMask: false,
  blockScroll: true,
};

function ConfirmPresenceLifecycle({
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

function renderConfirmIcon(icon: ConfirmIcon | undefined, danger: boolean): ReactNode {
  if (icon !== undefined && icon !== null && icon !== false) {
    if (isValidElement(icon) || typeof icon === "string" || typeof icon === "number") {
      return icon;
    }
    if (
      typeof icon === "function" ||
      (typeof icon === "object" && "$$typeof" in (icon as object))
    ) {
      return createElement(icon as ComponentType<{ size?: number }>, { size: 18 });
    }
  }
  return danger ? <AlertTriangle size={18} /> : <HelpCircle size={18} />;
}

export function ConfirmHost({
  group,
  store,
  renderMessage,
  message: messageSlot,
  children,
}: ConfirmHostProps) {
  const { messages, t } = useUiLocale();
  const defaultTitle = t("common.confirm.title", undefined, messages.common.confirm.title);
  const defaultAcceptLabel = t(
    "common.confirm.accept",
    undefined,
    messages.common.confirm.accept,
  );
  const defaultRejectLabel = t(
    "common.confirm.reject",
    undefined,
    messages.common.confirm.reject,
  );

  const confirmStore = useConfirmStore(store);
  const queue = useConfirmQueue(store, group);
  const activeRequest = queue[0]?.request ?? null;
  const isOpen = activeRequest !== null;

  const [contentPresent, setContentPresent] = useState(isOpen);
  const { layerZ, scrimZ } = useOverlayZIndex(isOpen || contentPresent);

  const lastRequestRef = useRef<ConfirmRequest>(FALLBACK_REQUEST);
  if (activeRequest) {
    lastRequestRef.current = activeRequest;
  }
  const renderRequest = activeRequest ?? lastRequestRef.current;

  const activeRequestRef = useRef<ConfirmRequest | null>(activeRequest);
  activeRequestRef.current = activeRequest;
  const confirmStoreRef = useRef(confirmStore);
  confirmStoreRef.current = confirmStore;
  const groupRef = useRef(group);
  groupRef.current = group;

  const rejectBtnRef = useRef<HTMLButtonElement | null>(null);
  const acceptBtnRef = useRef<HTMLButtonElement | null>(null);
  const openReadyForIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  const applyInitialFocus = useCallback((req: ConfirmRequest | null) => {
    if (!req) return;
    if (req.danger || req.defaultFocus === "reject") {
      rejectBtnRef.current?.focus();
    } else if (req.defaultFocus === "accept") {
      acceptBtnRef.current?.focus();
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    openReadyForIdRef.current = null;
    if (!activeRequest) return;
    applyInitialFocus(activeRequest);
    const id = activeRequest.id;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled && activeRequestRef.current?.id === id) {
        openReadyForIdRef.current = id;
        applyInitialFocus(activeRequestRef.current);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeRequest, applyInitialFocus]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      queueMicrotask(() => {
        if (!mountedRef.current) {
          confirmStoreRef.current.closeGroup(groupRef.current);
        }
      });
    };
  }, []);

  const onAccept = useCallback(() => {
    const req = activeRequestRef.current;
    if (!req) return;
    confirmStoreRef.current.accept(req.id);
  }, []);

  const onReject = useCallback(() => {
    const req = activeRequestRef.current;
    if (!req) return;
    confirmStoreRef.current.reject(req.id);
  }, []);

  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault();
    applyInitialFocus(activeRequestRef.current);
  };

  const handleEscapeKeyDown = (event: globalThis.KeyboardEvent) => {
    const req = activeRequestRef.current;
    if (!req) return;
    if (!req.closeOnEscape) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    onReject();
  };

  const handlePointerDownOutside = (event: Event) => {
    const req = activeRequestRef.current;
    if (!req || !req.dismissableMask) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    onReject();
  };

  const handleInteractOutside = (event: Event) => {
    const req = activeRequestRef.current;
    if (!req || !req.dismissableMask) {
      event.preventDefault();
    }
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const req = activeRequestRef.current;
    if (req?.dismissableMask) {
      onReject();
    }
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const req = activeRequestRef.current;
    if (!req) return;

    if (event.key === "Escape") {
      if (!req.closeOnEscape) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      onReject();
      return;
    }

    if (event.key === "Enter") {
      if (event.repeat || openReadyForIdRef.current !== req.id) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target === rejectBtnRef.current) {
        event.preventDefault();
        onReject();
        return;
      }
      if (target === acceptBtnRef.current) {
        event.preventDefault();
        onAccept();
        return;
      }
      if (req.danger) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && activeRequestRef.current) {
      onReject();
    }
  };

  const customMessageRenderer = renderMessage ?? messageSlot;

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className="mw-confirm-overlay"
          data-confirm-overlay=""
          style={scrimZ ? { zIndex: scrimZ } : undefined}
          onClick={handleOverlayClick}
        />
        <RadixDialog.Content
          className={[
            "mw-confirm",
            "mw-frost",
            "mw-frost--thick",
            renderRequest.danger ? "mw-confirm--danger" : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
          style={layerZ ? { zIndex: layerZ } : undefined}
          data-danger={renderRequest.danger ? "true" : undefined}
          data-group={group}
          onOpenAutoFocus={handleOpenAutoFocus}
          onEscapeKeyDown={handleEscapeKeyDown}
          onPointerDownOutside={handlePointerDownOutside}
          onInteractOutside={handleInteractOutside}
          onKeyDown={handleDialogKeyDown}
        >
          <ConfirmPresenceLifecycle onPresentChange={setContentPresent} />

          {typeof children === "function" ? (
            <>
              <RadixDialog.Title className="mw-dialog__sr-only">
                {renderRequest.title || renderRequest.header || defaultTitle}
              </RadixDialog.Title>
              <RadixDialog.Description className="mw-dialog__sr-only">
                {renderRequest.message}
              </RadixDialog.Description>
              {children({
                request: renderRequest,
                accept: onAccept,
                reject: onReject,
              })}
            </>
          ) : children !== undefined ? (
            children
          ) : (
            <>
              <div className="mw-confirm__header">
                <span
                  className={[
                    "mw-confirm__icon",
                    renderRequest.danger ? "mw-confirm__icon--danger" : undefined,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden="true"
                >
                  {renderConfirmIcon(renderRequest.icon, renderRequest.danger)}
                </span>
                <RadixDialog.Title className="mw-confirm__title">
                  {renderRequest.title || renderRequest.header || defaultTitle}
                </RadixDialog.Title>
              </div>

              <RadixDialog.Description asChild>
                <div className="mw-confirm__body">
                  {customMessageRenderer ? (
                    customMessageRenderer({ message: renderRequest })
                  ) : (
                    <>
                      <p className="mw-confirm__message">{renderRequest.message}</p>
                      {renderRequest.description ? (
                        <p className="mw-confirm__description">{renderRequest.description}</p>
                      ) : null}
                    </>
                  )}
                </div>
              </RadixDialog.Description>

              <div className="mw-confirm__footer mw-size-md">
                <button
                  ref={rejectBtnRef}
                  type="button"
                  className="mw-confirm__btn mw-confirm__btn--reject"
                  data-confirm-reject=""
                  onClick={onReject}
                >
                  {renderRequest.rejectLabel || defaultRejectLabel}
                </button>
                <button
                  ref={acceptBtnRef}
                  type="button"
                  className={`mw-confirm__btn mw-confirm__btn--accept mw-confirm__btn--${renderRequest.acceptSeverity}`}
                  data-confirm-accept=""
                  onClick={onAccept}
                >
                  {renderRequest.acceptLabel || defaultAcceptLabel}
                </button>
              </div>
            </>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

ConfirmHost.displayName = "MwConfirmHost";

export default ConfirmHost;
