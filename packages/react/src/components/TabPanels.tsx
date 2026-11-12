import { forwardRef } from "react";
import type { TabPanelsProps } from "./tabs-defs";

export const TabPanels = forwardRef<HTMLDivElement, TabPanelsProps>(function MwTabPanels(
  { className, children, ...rest },
  ref,
) {
  const classes = ["mw-tab-panels", className].filter(Boolean).join(" ");

  return (
    <div {...rest} ref={ref} className={classes}>
      {children}
    </div>
  );
});

TabPanels.displayName = "MwTabPanels";

export default TabPanels;
