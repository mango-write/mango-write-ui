import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type FocusEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import {
  useNotify,
  useNotifyMessages,
  type NotifyStore,
  type ToastMessage,
  type ToastSeverity,
} from "../lib/notify";
import { useUiLocale } from "../locale";

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export interface ToastHostMessageRenderProps {
  message: ToastMessage;
  close: () => void;
}

export interface ToastHostProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  group?: string;
  position?: ToastPosition;
  store?: NotifyStore;
  renderMessage?: (props: ToastHostMessageRenderProps) => ReactNode;
  message?: (props: ToastHostMessageRenderProps) => ReactNode;
}

interface TimerState {
  timer: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startedAt: number;
  paused: boolean;
  updatedAt: number;
}

const SEVERITY_ICON_MAP: Record<ToastSeverity, typeof Info> = {
  success: CheckCircle2,
  info: Info,
  warn: AlertTriangle,
  error: AlertCircle,
};

export const ToastHost = forwardRef<HTMLDivElement, ToastHostProps>(function MwToastHost(
  {
    group,
    position = "top-right",
    store,
    renderMessage,
    message: messageSlot,
    className,
    ...rest
  },
  forwardedRef,
) {
  const { messages: localeMessages, t } = useUiLocale();
  const closeLabel = t(
    "common.action.close",
    undefined,
    localeMessages.common.action.close,
  );

  const notifyStore = useNotify(store);
  const groupMessages = useNotifyMessages(store, group);

  const notifyStoreRef = useRef(notifyStore);
  notifyStoreRef.current = notifyStore;
  const timersRef = useRef<Map<string, TimerState>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const state = timersRef.current.get(id);
    if (!state) return;
    if (state.timer !== null) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    timersRef.current.delete(id);
  }, []);

  const pauseTimer = useCallback((id: string) => {
    const state = timersRef.current.get(id);
    if (!state || state.paused) return;
    if (state.timer !== null) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    const elapsed = Math.max(0, Date.now() - state.startedAt);
    state.remaining = Math.max(0, state.remaining - elapsed);
    state.paused = true;
  }, []);

  const resumeTimer = useCallback((id: string) => {
    const state = timersRef.current.get(id);
    if (!state || !state.paused) return;
    state.paused = false;
    state.startedAt = Date.now();
    if (state.remaining <= 0) {
      timersRef.current.delete(id);
      notifyStoreRef.current.remove(id);
      return;
    }
    state.timer = setTimeout(() => {
      timersRef.current.delete(id);
      notifyStoreRef.current.remove(id);
    }, state.remaining);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    const activeIds = new Set(groupMessages.map((m) => m.id));
    for (const id of [...timers.keys()]) {
      if (!activeIds.has(id)) {
        clearTimer(id);
      }
    }

    for (const msg of groupMessages) {
      if (!msg.life || msg.life <= 0) {
        clearTimer(msg.id);
        continue;
      }

      const existing = timers.get(msg.id);
      if (existing && existing.updatedAt === msg.updatedAt) {
        continue;
      }

      const wasPaused = existing?.paused ?? false;
      if (existing?.timer !== null && existing?.timer !== undefined) {
        clearTimeout(existing.timer);
      }

      const nextState: TimerState = {
        timer: null,
        remaining: msg.life,
        startedAt: Date.now(),
        paused: wasPaused,
        updatedAt: msg.updatedAt,
      };

      if (!wasPaused) {
        nextState.timer = setTimeout(() => {
          timers.delete(msg.id);
          notifyStoreRef.current.remove(msg.id);
        }, nextState.remaining);
      }

      timers.set(msg.id, nextState);
    }
  }, [groupMessages, clearTimer]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const state of timers.values()) {
        if (state.timer !== null) {
          clearTimeout(state.timer);
        }
      }
      timers.clear();
    };
  }, []);

  const closeToast = useCallback(
    (id: string) => {
      clearTimer(id);
      notifyStoreRef.current.remove(id);
    },
    [clearTimer],
  );

  const handleFocusOut = (id: string, event: FocusEvent<HTMLDivElement>) => {
    const current = event.currentTarget;
    const related = event.relatedTarget as Node | null;
    if (related && current.contains(related)) {
      return;
    }
    resumeTimer(id);
  };

  const customRenderer = renderMessage ?? messageSlot;
  const hostClassName = ["mw-toast-host", `mw-toast-host--${position}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...rest}
      ref={forwardedRef}
      className={hostClassName}
      data-position={position}
      data-group={group}
    >
      {groupMessages.map((msg) => {
        const SeverityIcon = SEVERITY_ICON_MAP[msg.severity];
        return (
          <div
            key={msg.announceKey}
            className={`mw-toast mw-frost mw-toast--${msg.severity}`}
            data-toast-id={msg.id}
            data-announce-key={msg.announceKey}
            data-severity={msg.severity}
            role={msg.severity === "error" ? "alert" : "status"}
            aria-live={msg.severity === "error" ? "assertive" : "polite"}
            aria-atomic="true"
            onMouseEnter={() => pauseTimer(msg.id)}
            onMouseLeave={() => resumeTimer(msg.id)}
            onFocus={() => pauseTimer(msg.id)}
            onBlur={(e) => handleFocusOut(msg.id, e)}
          >
            {customRenderer ? (
              customRenderer({ message: msg, close: () => closeToast(msg.id) })
            ) : (
              <>
                <span className="mw-toast__icon" aria-hidden="true">
                  <SeverityIcon size={16} />
                </span>
                <div className="mw-toast__body">
                  {msg.summary ? (
                    <div className="mw-toast__summary">{msg.summary}</div>
                  ) : null}
                  {msg.detail ? (
                    <div className="mw-toast__detail">{msg.detail}</div>
                  ) : null}
                  {msg.action ? (
                    <div className="mw-toast__actions">
                      <button
                        type="button"
                        className="mw-toast__action-btn"
                        onClick={() => msg.action?.onClick()}
                      >
                        {msg.action.label}
                      </button>
                    </div>
                  ) : null}
                </div>
                {msg.closable ? (
                  <button
                    type="button"
                    className="mw-toast__close"
                    aria-label={closeLabel}
                    onClick={() => closeToast(msg.id)}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                ) : null}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
});

ToastHost.displayName = "MwToastHost";

export default ToastHost;
