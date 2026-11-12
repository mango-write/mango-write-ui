import { forwardRef } from "react";
import type { AdminStatBarProps } from "./admin-defs";

export type { AdminStatBarProps, AdminStatItem, AdminStatTone, StatBarProps, StatItem, StatTone } from "./admin-defs";

export const AdminStatBar = forwardRef<HTMLDivElement, AdminStatBarProps>(
  function MwAdminStatBar({ items, className, ...rest }, ref) {
    const classes = ["admin-stats", className].filter(Boolean).join(" ");

    return (
      <div {...rest} ref={ref} className={classes}>
        {items.map((item, idx) => (
          <div
            key={item.key ?? idx}
            className="admin-stats__item"
            data-tone={item.tone ?? "default"}
          >
            <span className="admin-stats__label">{item.label}</span>
            <span className="admin-stats__num">{item.value}</span>
            {item.sub ? <span className="admin-stats__sub">{item.sub}</span> : null}
          </div>
        ))}
      </div>
    );
  },
);

AdminStatBar.displayName = "MwAdminStatBar";

export const StatBar = AdminStatBar;

export default AdminStatBar;
