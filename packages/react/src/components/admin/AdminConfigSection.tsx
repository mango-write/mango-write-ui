import { forwardRef } from "react";
import { hasSlotContent, type AdminConfigSectionProps } from "./admin-defs";

export type { AdminConfigSectionProps, ConfigSectionProps } from "./admin-defs";

export const AdminConfigSection = forwardRef<HTMLElement, AdminConfigSectionProps>(
  function MwAdminConfigSection({ title, className, children, ...rest }, ref) {
    const classes = ["admin-config-section", className].filter(Boolean).join(" ");

    return (
      <section {...rest} ref={ref} className={classes}>
        {hasSlotContent(title) && (
          <h3 className="admin-config-section__title">{title}</h3>
        )}
        {children}
      </section>
    );
  },
);

AdminConfigSection.displayName = "MwAdminConfigSection";

export const ConfigSection = AdminConfigSection;

export default AdminConfigSection;
