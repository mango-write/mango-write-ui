import { forwardRef } from "react";
import { hasSlotContent, type AdminBoardSectionProps } from "./admin-defs";

export type { AdminBoardSectionProps } from "./admin-defs";

export const AdminBoardSection = forwardRef<HTMLElement, AdminBoardSectionProps>(
  function MwAdminBoardSection({ title, drill, className, children, ...rest }, ref) {
    const classes = ["admin-board-section", className].filter(Boolean).join(" ");
    const hasTitle = hasSlotContent(title);
    const hasDrill = hasSlotContent(drill);

    return (
      <section {...rest} ref={ref} className={classes}>
        {(hasTitle || hasDrill) && (
          <header className="admin-board-section__head">
            {hasTitle && <h3 className="admin-board-section__title">{title}</h3>}
            {hasDrill && <div className="admin-board-section__drills">{drill}</div>}
          </header>
        )}
        {children}
      </section>
    );
  },
);

AdminBoardSection.displayName = "MwAdminBoardSection";

export default AdminBoardSection;
