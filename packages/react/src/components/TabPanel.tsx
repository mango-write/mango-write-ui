import { forwardRef, useContext } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { MwTabsContext, type TabPanelProps } from "./tabs-defs";

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function MwTabPanel(
  { value, forceMount = false, className, hidden, children, ...rest },
  ref,
) {
  const tabsCtx = useContext(MwTabsContext);
  const encodedValue = tabsCtx ? tabsCtx.registerValue(value) : String(value);
  const shouldForceMount = Boolean(forceMount || (tabsCtx && !tabsCtx.unmountOnHide));
  const isSelected =
    tabsCtx?.activeValue !== undefined && String(tabsCtx.activeValue) === encodedValue;

  const classes = ["mw-tab-panel", className].filter(Boolean).join(" ");
  const hiddenProp =
    hidden !== undefined
      ? { hidden }
      : shouldForceMount && !isSelected
        ? { hidden: true }
        : {};

  return (
    <TabsPrimitive.Content
      {...rest}
      {...hiddenProp}
      ref={ref}
      className={classes}
      value={encodedValue}
      forceMount={shouldForceMount ? true : undefined}
    >
      {children}
    </TabsPrimitive.Content>
  );
});

TabPanel.displayName = "MwTabPanel";

export default TabPanel;
