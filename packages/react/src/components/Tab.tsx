import { forwardRef, useContext, useRef, type MouseEvent } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { MwTabsContext, type TabProps } from "./tabs-defs";

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function MwTab(
  {
    value,
    disabled = false,
    badge,
    className,
    onMouseDown,
    onClick,
    children,
    ...rest
  },
  ref,
) {
  const tabsCtx = useContext(MwTabsContext);
  const encodedValue = tabsCtx ? tabsCtx.registerValue(value) : String(value);
  const orientation = tabsCtx?.orientation ?? "horizontal";
  const handledByMouseDownRef = useRef(false);

  const classes = ["mw-tab", className].filter(Boolean).join(" ");

  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    if (!disabled && event.button === 0 && !event.ctrlKey) {
      handledByMouseDownRef.current = true;
    }
    onMouseDown?.(event);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (handledByMouseDownRef.current) {
      handledByMouseDownRef.current = false;
      return;
    }
    if (!disabled && !event.defaultPrevented && tabsCtx && tabsCtx.activeValue !== value) {
      tabsCtx.selectValue(value);
    }
  };

  return (
    <TabsPrimitive.Trigger
      {...rest}
      ref={ref}
      className={classes}
      value={encodedValue}
      disabled={disabled}
      data-orientation={orientation}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {children}
      {badge !== undefined && <span className="mw-tab__badge">{badge}</span>}
    </TabsPrimitive.Trigger>
  );
});

Tab.displayName = "MwTab";

export default Tab;
