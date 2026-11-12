import { forwardRef } from "react";
import { createPortal } from "react-dom";
import {
  hasSlotContent,
  useAdminPortalTarget,
  type AdminListPageProps,
} from "./admin-defs";

export type { AdminListPageProps } from "./admin-defs";

export const AdminListPage = forwardRef<HTMLDivElement, AdminListPageProps>(
  function MwAdminListPage(
    {
      title,
      teleport = true,
      actionsTarget = "#admin-header-actions",
      actions,
      summary,
      filters,
      pagination,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const classes = ["admin-panel", "admin-list-page", className]
      .filter(Boolean)
      .join(" ");

    const hasActions = hasSlotContent(actions);
    const portalTarget = useAdminPortalTarget(actionsTarget, teleport && hasActions);

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
        {hasSlotContent(summary) ? (
          <div className="admin-list-page__summary">{summary}</div>
        ) : null}
        {hasSlotContent(filters) ? (
          <div className="admin-list-page__filters">{filters}</div>
        ) : null}
        <div className="admin-list-page__body">{children}</div>
        {hasSlotContent(pagination) ? (
          <div className="admin-list-page__pagination">{pagination}</div>
        ) : null}
      </div>
    );
  },
);

AdminListPage.displayName = "MwAdminListPage";

export default AdminListPage;
