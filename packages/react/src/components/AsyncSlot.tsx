import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { CircleAlert, Inbox, RotateCw } from "lucide-react";
import { areaDurationMs } from "../lib/area-transition";
import { useUiLocale } from "../locale";
import { Button } from "./Button";

export type AsyncSlotStatus = "loading" | "empty" | "error" | "ready";
export type AsyncSlotSkeleton = "list" | "rows" | "card" | "text" | "none";

export interface AsyncSlotProps extends HTMLAttributes<HTMLDivElement> {
  status: AsyncSlotStatus;
  /** 骨架占位形状；none = 仅占位读屏反馈 */
  skeleton?: AsyncSlotSkeleton;
  /** 状态文案走 i18n key 或文案字符串 */
  loadingLabel?: string;
  emptyTitle?: string;
  emptyHint?: string;
  errorTitle?: string;
  errorHint?: string;
  onRetry?: () => void;
  /** 自定义加载态内容（对应 Vue #loading） */
  loading?: ReactNode;
  /** 整块覆盖空态（对应 Vue #empty） */
  empty?: ReactNode;
  /** 空态动作按钮区（对应 Vue #empty-action） */
  emptyAction?: ReactNode;
  /** 整块覆盖错误态（对应 Vue #error） */
  error?: ReactNode;
  /** 错误态动作区（对应 Vue #error-action） */
  errorAction?: ReactNode;
  children?: ReactNode;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface TransitionState {
  entering: boolean;
  enterFrom: boolean;
  leavingStatus: AsyncSlotStatus | null;
  leaveTo: boolean;
}

function hasNode(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

export const AsyncSlot = forwardRef<HTMLDivElement, AsyncSlotProps>(
  function MwAsyncSlot(
    {
      status,
      skeleton = "list",
      loadingLabel,
      emptyTitle,
      emptyHint,
      errorTitle,
      errorHint,
      onRetry,
      loading: loadingSlot,
      empty: emptySlot,
      emptyAction,
      error: errorSlot,
      errorAction,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const { t } = useUiLocale();

    useEffect(() => {
      if (import.meta.env?.DEV) {
        if (status === "empty" && !emptyTitle && !hasNode(emptySlot)) {
          console.warn(
            "[AsyncSlot] empty state needs emptyTitle (i18n key) or an empty override — an empty state is an invitation, not a tombstone.", // i18n-allow: dev-only console diagnostic, not UI copy
          );
        }
      }
    }, [status, emptyTitle, emptySlot]);

    const isInitialMountRef = useRef(true);
    const prevStatusRef = useRef<AsyncSlotStatus>(status);
    const [anim, setAnim] = useState<TransitionState>({
      entering: false,
      enterFrom: false,
      leavingStatus: null,
      leaveTo: false,
    });

    useIsomorphicLayoutEffect(() => {
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false;
        prevStatusRef.current = status;
        return;
      }
      const prev = prevStatusRef.current;
      if (prev === status) return;
      prevStatusRef.current = status;

      setAnim({
        entering: true,
        enterFrom: true,
        leavingStatus: prev,
        leaveTo: false,
      });

      let raf1: number | null = null;
      let raf2: number | null = null;
      let timer: ReturnType<typeof setTimeout> | null = null;
      let cancelled = false;

      const scheduleEnd = () => {
        if (cancelled) return;
        setAnim((curr) => ({
          ...curr,
          enterFrom: false,
          leaveTo: true,
        }));
        timer = setTimeout(() => {
          if (cancelled) return;
          setAnim({
            entering: false,
            enterFrom: false,
            leavingStatus: null,
            leaveTo: false,
          });
        }, areaDurationMs());
      };

      if (typeof requestAnimationFrame === "function") {
        raf1 = requestAnimationFrame(() => {
          raf1 = null;
          if (cancelled) return;
          raf2 = requestAnimationFrame(() => {
            raf2 = null;
            scheduleEnd();
          });
        });
      } else {
        scheduleEnd();
      }

      return () => {
        cancelled = true;
        if (raf1 !== null && typeof cancelAnimationFrame === "function") {
          cancelAnimationFrame(raf1);
        }
        if (raf2 !== null && typeof cancelAnimationFrame === "function") {
          cancelAnimationFrame(raf2);
        }
        if (timer !== null) {
          clearTimeout(timer);
        }
      };
    }, [status]);

    const skeletonRows = skeleton === "text" ? 3 : 5;

    function renderBranch(branchStatus: AsyncSlotStatus, extraClass?: string) {
      if (branchStatus === "loading") {
        const cls = ["mw-async", "mw-async--loading", extraClass]
          .filter(Boolean)
          .join(" ");
        return (
          <div key="loading" className={cls}>
            <span className="mw-async-sr-only" role="status">
              {loadingLabel ? t(loadingLabel) : t("common.async.loading")}
            </span>
            {hasNode(loadingSlot) ? (
              loadingSlot
            ) : skeleton === "card" ? (
              <div className="mw-async-skeleton mw-async-skeleton--card" />
            ) : skeleton !== "none" ? (
              Array.from({ length: skeletonRows }, (_, idx) => {
                const isLast = idx === skeletonRows - 1;
                const skelClass = [
                  "mw-async-skeleton",
                  skeleton === "text"
                    ? "mw-async-skeleton--line"
                    : "mw-async-skeleton--row",
                ].join(" ");
                return (
                  <div
                    key={idx + 1}
                    className={skelClass}
                    style={isLast ? { width: "62%" } : undefined}
                  />
                );
              })
            ) : null}
          </div>
        );
      }

      if (branchStatus === "empty") {
        const cls = ["mw-async", "mw-async--empty", extraClass]
          .filter(Boolean)
          .join(" ");
        return (
          <div key="empty" className={cls}>
            {hasNode(emptySlot) ? (
              emptySlot
            ) : (
              <>
                <span className="mw-async-empty-icon">
                  <Inbox className="mw-async-slot__icon" aria-hidden="true" />
                </span>
                <p className="mw-async-title">{emptyTitle ? t(emptyTitle) : ""}</p>
                {emptyHint ? <p className="mw-async-hint">{t(emptyHint)}</p> : null}
                {hasNode(emptyAction) ? (
                  <div className="mw-async-action">{emptyAction}</div>
                ) : null}
              </>
            )}
          </div>
        );
      }

      if (branchStatus === "error") {
        const cls = ["mw-async", "mw-async--error", extraClass]
          .filter(Boolean)
          .join(" ");
        return (
          <div key="error" className={cls} role="alert">
            {hasNode(errorSlot) ? (
              errorSlot
            ) : (
              <>
                <span className="mw-async-empty-icon">
                  <CircleAlert
                    className="mw-async-slot__icon mw-async-slot__icon--danger"
                    aria-hidden="true"
                  />
                </span>
                <p className="mw-async-title">
                  {errorTitle ? t(errorTitle) : t("common.async.errorTitle")}
                </p>
                {errorHint ? <p className="mw-async-hint">{t(errorHint)}</p> : null}
                <div className="mw-async-action">
                  {hasNode(errorAction) ? (
                    errorAction
                  ) : (
                    <Button
                      label={t("common.async.retry")}
                      icon={RotateCw}
                      severity="secondary"
                      variant="outlined"
                      onClick={() => onRetry?.()}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        );
      }

      const cls = ["mw-async", "mw-async--ready", extraClass]
        .filter(Boolean)
        .join(" ");
      return (
        <div key="ready" className={cls}>
          {children}
        </div>
      );
    }

    const enterClass = anim.entering
      ? [
          "mw-async-enter-active",
          anim.enterFrom ? "mw-async-enter-from" : undefined,
        ]
          .filter(Boolean)
          .join(" ")
      : undefined;

    const leaveClass = anim.leavingStatus
      ? [
          "mw-async-leave-active",
          anim.leaveTo ? "mw-async-leave-to" : undefined,
        ]
          .filter(Boolean)
          .join(" ")
      : undefined;

    const hostClasses = ["mw-async-host", className].filter(Boolean).join(" ");

    return (
      <div
        {...rest}
        ref={ref}
        className={hostClasses}
        aria-busy={status === "loading"}
      >
        {anim.leavingStatus && anim.leavingStatus !== status
          ? renderBranch(anim.leavingStatus, leaveClass)
          : null}
        {renderBranch(status, enterClass)}
      </div>
    );
  },
);

AsyncSlot.displayName = "MwAsyncSlot";

export default AsyncSlot;
