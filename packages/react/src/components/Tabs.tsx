import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { MwTabsContext, type TabsProps, type TabValue } from "./tabs-defs";

export type {
  TabListProps,
  TabPanelProps,
  TabPanelsProps,
  TabProps,
  TabsEmits,
  TabsProps,
  TabValue,
} from "./tabs-defs";

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function MwTabs(
  {
    value,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    activationMode = "automatic",
    unmountOnHide = true,
    className,
    children,
    ...rest
  },
  ref,
) {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<TabValue | undefined>(
    defaultValue,
  );
  const activeValue = isControlled ? value : uncontrolledValue;

  const valueMapRef = useRef<Map<string, TabValue>>(new Map());
  if (value !== undefined) {
    valueMapRef.current.set(String(value), value);
  }
  if (defaultValue !== undefined) {
    valueMapRef.current.set(String(defaultValue), defaultValue);
  }

  const registerValue = useCallback((raw: TabValue): string => {
    const encoded = String(raw);
    valueMapRef.current.set(encoded, raw);
    return encoded;
  }, []);

  const activeValueRef = useRef<TabValue | undefined>(activeValue);
  activeValueRef.current = activeValue;
  const pendingEmitRef = useRef<string | undefined>(undefined);

  const selectValue = useCallback(
    (raw: TabValue) => {
      const encoded = String(raw);
      if (
        (activeValueRef.current !== undefined &&
          String(activeValueRef.current) === encoded) ||
        pendingEmitRef.current === encoded
      ) {
        return;
      }
      pendingEmitRef.current = encoded;
      queueMicrotask(() => {
        if (pendingEmitRef.current === encoded) {
          pendingEmitRef.current = undefined;
        }
      });
      if (!isControlled) {
        setUncontrolledValue(raw);
      }
      onValueChange?.(raw);
    },
    [isControlled, onValueChange],
  );

  const handleRadixValueChange = useCallback(
    (encoded: string) => {
      const decoded = valueMapRef.current.has(encoded)
        ? valueMapRef.current.get(encoded)!
        : encoded;
      selectValue(decoded);
    },
    [selectValue],
  );

  const ctxValue = useMemo(
    () => ({
      activeValue,
      orientation,
      unmountOnHide,
      registerValue,
      selectValue,
    }),
    [activeValue, orientation, unmountOnHide, registerValue, selectValue],
  );

  const classes = ["mw-tabs", `mw-tabs--${orientation}`, className]
    .filter(Boolean)
    .join(" ");

  const resolvedChildren =
    typeof children === "function" ? children({ value: activeValue }) : children;

  return (
    <MwTabsContext.Provider value={ctxValue}>
      <TabsPrimitive.Root
        {...rest}
        ref={ref}
        className={classes}
        value={activeValue !== undefined ? String(activeValue) : undefined}
        defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
        orientation={orientation}
        activationMode={activationMode}
        onValueChange={handleRadixValueChange}
      >
        {resolvedChildren}
      </TabsPrimitive.Root>
    </MwTabsContext.Provider>
  );
});

Tabs.displayName = "MwTabs";

export default Tabs;
