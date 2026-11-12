import { ArrowLeft } from "lucide-react";
import { forwardRef, useContext, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useScrollFade } from "../../lib/scroll-fade";
import { Tooltip } from "../../lib/tooltip";
import { useUiLocale } from "../../locale";
import { Button } from "../Button";
import {
  ADMIN_HEADER_LEAD_TAKEN,
  hasSlotContent,
  useAdminPortalTarget,
  type AdminDetailPageProps,
  type AdminHeaderLeadTakenHolder,
} from "./admin-defs";

export type { AdminDetailPageEmits, AdminDetailPageProps } from "./admin-defs";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function writeLeadTaken(holder: AdminHeaderLeadTakenHolder, taken: boolean) {
  if (!holder) return;
  if (typeof holder === "function") {
    holder(taken);
    return;
  }
  if ("current" in holder) {
    holder.current = taken;
  }
  if ("value" in holder) {
    holder.value = taken;
  }
  holder.setTaken?.(taken);
}

export const AdminDetailPage = forwardRef<HTMLDivElement, AdminDetailPageProps>(
  function MwAdminDetailPage(
    {
      backTo,
      showBack,
      backLabel,
      teleport = true,
      leadTarget = "#admin-header-lead",
      actionsTarget = "#admin-header-actions",
      onBack,
      title,
      actions,
      cards,
      tabs,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const { t } = useUiLocale();
    const leadTakenHolder = useContext(ADMIN_HEADER_LEAD_TAKEN);
    const scrollRef = useScrollFade<HTMLDivElement>();

    const hasBack = Boolean(backTo || showBack);
    const hasTitle = hasSlotContent(title);
    const hasActions = hasSlotContent(actions);
    const hasLead = hasBack || hasTitle;

    const resolvedBackLabel = backLabel ?? t("common.admin.back");

    useIsomorphicLayoutEffect(() => {
      if (!leadTakenHolder) return;
      if (teleport) {
        writeLeadTaken(leadTakenHolder, hasLead);
      } else {
        writeLeadTaken(leadTakenHolder, false);
      }
      return () => {
        writeLeadTaken(leadTakenHolder, false);
      };
    }, [leadTakenHolder, teleport, hasLead]);

    function handleBack() {
      onBack?.();
      if (typeof backTo === "function") {
        (backTo as () => void)();
      }
    }

    const leadPortalTarget = useAdminPortalTarget(leadTarget, teleport && hasLead);
    const actionsPortalTarget = useAdminPortalTarget(
      actionsTarget,
      teleport && hasActions,
    );

    const classes = ["admin-panel", "admin-detail-page", className]
      .filter(Boolean)
      .join(" ");

    const leadControls = (
      <>
        {hasBack ? (
          <Tooltip content={resolvedBackLabel} placement="bottom">
            <Button
              icon={ArrowLeft}
              text
              severity="secondary"
              aria-label={resolvedBackLabel}
              onClick={handleBack}
            />
          </Tooltip>
        ) : null}
        {hasTitle ? <div className="admin-detail-title">{title}</div> : null}
      </>
    );

    return (
      <div {...rest} ref={ref} className={classes}>
        {teleport && hasLead && leadPortalTarget
          ? createPortal(leadControls, leadPortalTarget)
          : null}
        {teleport && hasActions && actionsPortalTarget
          ? createPortal(actions, actionsPortalTarget)
          : null}

        {!teleport && (hasLead || hasActions) ? (
          <header className="mw-admin-shell-header">
            <div className="mw-admin-shell-header__lead">{leadControls}</div>
            {hasActions ? (
              <div className="mw-admin-shell-header__actions">{actions}</div>
            ) : null}
          </header>
        ) : null}

        {hasSlotContent(cards) ? (
          <div className="admin-detail-cards">{cards}</div>
        ) : null}

        {hasSlotContent(tabs) ? (
          <div className="admin-detail-tabs">{tabs}</div>
        ) : null}

        <div
          ref={scrollRef}
          className="admin-detail-page__body admin-panel--scrollable"
        >
          {children}
        </div>
      </div>
    );
  },
);

AdminDetailPage.displayName = "MwAdminDetailPage";

export default AdminDetailPage;
