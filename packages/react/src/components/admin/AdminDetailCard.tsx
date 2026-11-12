import { forwardRef } from "react";
import { Button } from "../Button";
import { hasSlotContent, type AdminDetailCardProps } from "./admin-defs";

export type {
  AdminDetailCardEmits,
  AdminDetailCardProps,
  StatCardEmits,
  StatCardProps,
} from "./admin-defs";

export const AdminDetailCard = forwardRef<HTMLDivElement, AdminDetailCardProps>(
  function MwAdminDetailCard(
    {
      label,
      value,
      sub,
      tone = "default",
      actionLabel,
      actionDisabled = false,
      onAction,
      head,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const classes = ["admin-detail-card", className].filter(Boolean).join(" ");

    return (
      <div {...rest} ref={ref} className={classes} data-tone={tone}>
        <div className="admin-detail-card__head">
          {hasSlotContent(head) ? (
            head
          ) : (
            <>
              <span>{label}</span>
              {actionLabel ? (
                <Button
                  text
                  size="xs"
                  className="admin-detail-card__action"
                  label={actionLabel}
                  disabled={actionDisabled}
                  onClick={() => onAction?.()}
                />
              ) : null}
            </>
          )}
        </div>
        {hasSlotContent(value) ? (
          <div className="admin-detail-card__value">{value}</div>
        ) : null}
        {hasSlotContent(sub) ? (
          <div className="admin-detail-card__sub">{sub}</div>
        ) : null}
        {children}
      </div>
    );
  },
);

AdminDetailCard.displayName = "MwAdminDetailCard";

export const StatCard = AdminDetailCard;

export default AdminDetailCard;
