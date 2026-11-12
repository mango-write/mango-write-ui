import { forwardRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useScrollFade } from "../lib/scroll-fade";
import type { TabListProps } from "./tabs-defs";

export const TabList = forwardRef<HTMLDivElement, TabListProps>(function MwTabList(
  { loop = true, hideWhenSingle = false, className, children, ...rest },
  ref,
) {
  const scrollRef = useScrollFade<HTMLDivElement>({ size: "sm" }, ref);

  const classes = [
    "mw-tab-list",
    "mw-scroll-fade",
    "mw-scroll-fade--sm",
    hideWhenSingle ? "mw-tab-list--hide-single" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TabsPrimitive.List {...rest} ref={scrollRef} className={classes} loop={loop}>
      {children}
    </TabsPrimitive.List>
  );
});

TabList.displayName = "MwTabList";

export default TabList;
