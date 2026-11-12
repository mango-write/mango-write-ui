import { forwardRef } from "react";
import { createPortal } from "react-dom";
import { useScrollFade } from "../../lib/scroll-fade";
import {
  hasSlotContent,
  useAdminPortalTarget,
  type AdminBoardPageProps,
} from "./admin-defs";

export type { AdminBoardPageProps } from "./admin-defs";

export const AdminBoardPage = forwardRef<HTMLDivElement, AdminBoardPageProps>(
  function MwAdminBoardPage(
    {
      title,
      teleport = true,
      actionsTarget = "#admin-header-actions",
      actions,
      toolbar,
      stats,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const classes = ["admin-panel", "admin-board-page", className]
      .filter(Boolean)
      .join(" ");

    const hasActions = hasSlotContent(actions);
    const portalTarget = useAdminPortalTarget(actionsTarget, teleport && hasActions);
    const scrollRef = useScrollFade<HTMLDivElement>();

    return (
      <div {...rest} ref={ref} className={classes}>
        {teleport && hasActions && portalTarget
          ? createPortal(actions, portalTarget)
          : null}
        {!teleport && (title || hasActions) ? (
          <header className="mw-admin-shell-header">
            {title ? <h2 className="mw-admin-shell-header__title">{title}</h2> : null}
            {hasActions ? (
              <div className="mw-admin-shell-header__actions">{actions}</div>
            ) : null}
          </header>
        ) : null}
        {hasSlotContent(toolbar) ? (
          <div className="admin-board-page__toolbar">{toolbar}</div>
        ) : null}
        <div
          ref={scrollRef}
          className="admin-board-page__body admin-panel--scrollable"
        >
          {hasSlotContent(stats) ? (
            <div className="admin-stats">{stats}</div>
          ) : null}
          {children}
        </div>
      </div>
    );
  },
);

AdminBoardPage.displayName = "MwAdminBoardPage";

export default AdminBoardPage;
