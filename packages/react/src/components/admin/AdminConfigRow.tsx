import { forwardRef } from "react";
import { Tooltip } from "../../lib/tooltip";
import { hasSlotContent, type AdminConfigRowProps } from "./admin-defs";

export type {
  AdminConfigRowProps,
  AdminConfigRowStatusTone,
  ConfigRowProps,
  ConfigRowStatusTone,
} from "./admin-defs";

export const AdminConfigRow = forwardRef<HTMLDivElement, AdminConfigRowProps>(
  function MwAdminConfigRow(
    {
      label,
      keyHint,
      hint,
      status,
      statusTone = "muted",
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const classes = ["admin-config-row", className].filter(Boolean).join(" ");

    return (
      <div {...rest} ref={ref} className={classes}>
        <Tooltip content={keyHint ?? ""} disabled={!keyHint}>
          <span className="admin-config-row__label" title={keyHint}>
            {label}
          </span>
        </Tooltip>
        <div className="admin-config-row__control">{children}</div>
        {hasSlotContent(hint) && <p className="admin-config-row__hint">{hint}</p>}
        {hasSlotContent(status) && (
          <p className="admin-config-row__status" data-tone={statusTone}>
            {status}
          </p>
        )}
      </div>
    );
  },
);

AdminConfigRow.displayName = "MwAdminConfigRow";

export const ConfigRow = AdminConfigRow;

export default AdminConfigRow;
