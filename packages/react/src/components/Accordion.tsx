import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AccordionContext,
  type AccordionPanelValue,
  type AccordionProps,
  type AccordionValue,
} from "./accordion-defs";

export type {
  AccordionContentProps,
  AccordionContextValue,
  AccordionEmits,
  AccordionHeaderProps,
  AccordionPanelContextValue,
  AccordionPanelProps,
  AccordionPanelValue,
  AccordionProps,
  AccordionValue,
} from "./accordion-defs";

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function MwAccordion(
    {
      value,
      defaultValue,
      onValueChange,
      multiple = false,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<AccordionValue>(() => {
      if (defaultValue !== undefined) return defaultValue;
      return multiple ? [] : null;
    });

    const activeValue = isControlled ? value : uncontrolledValue;
    const activeValueRef = useRef<AccordionValue>(activeValue);
    activeValueRef.current = activeValue;

    const isPanelOpen = useCallback(
      (panelValue: AccordionPanelValue): boolean => {
        if (Array.isArray(activeValue)) {
          return activeValue.includes(panelValue);
        }
        return (
          activeValue !== null &&
          activeValue !== undefined &&
          activeValue === panelValue
        );
      },
      [activeValue],
    );

    const togglePanel = useCallback(
      (panelValue: AccordionPanelValue) => {
        const current = activeValueRef.current;
        let next: AccordionPanelValue | AccordionPanelValue[] | null;

        if (multiple) {
          const list: AccordionPanelValue[] = Array.isArray(current)
            ? [...current]
            : current !== null && current !== undefined
              ? [current]
              : [];
          const idx = list.indexOf(panelValue);
          if (idx >= 0) {
            list.splice(idx, 1);
          } else {
            list.push(panelValue);
          }
          next = list;
        } else {
          const currentlyOpen = Array.isArray(current)
            ? current.includes(panelValue)
            : current !== null && current !== undefined && current === panelValue;
          next = currentlyOpen ? null : panelValue;
        }

        if (!isControlled) {
          setUncontrolledValue(next);
        }
        onValueChange?.(next);
      },
      [isControlled, multiple, onValueChange],
    );

    const headerElsRef = useRef<HTMLButtonElement[]>([]);

    const registerHeader = useCallback((el: HTMLButtonElement) => {
      if (!headerElsRef.current.includes(el)) {
        headerElsRef.current.push(el);
      }
    }, []);

    const unregisterHeader = useCallback((el: HTMLButtonElement) => {
      const idx = headerElsRef.current.indexOf(el);
      if (idx >= 0) {
        headerElsRef.current.splice(idx, 1);
      }
    }, []);

    const moveFocus = useCallback(
      (
        current: HTMLButtonElement,
        direction: "next" | "prev" | "first" | "last",
      ) => {
        const enabled = headerElsRef.current
          .filter((el) => !el.disabled && el.isConnected)
          .sort((a, b) => {
            if (a === b) return 0;
            const pos = a.compareDocumentPosition(b);
            return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
          });
        if (enabled.length === 0) return;

        if (direction === "first") {
          enabled[0]?.focus();
          return;
        }
        if (direction === "last") {
          enabled[enabled.length - 1]?.focus();
          return;
        }

        const pos = enabled.indexOf(current);
        if (pos === -1) {
          enabled[0]?.focus();
          return;
        }

        const nextIdx =
          direction === "next"
            ? (pos + 1) % enabled.length
            : (pos - 1 + enabled.length) % enabled.length;
        enabled[nextIdx]?.focus();
      },
      [],
    );

    const ctxValue = useMemo(
      () => ({
        isPanelOpen,
        togglePanel,
        registerHeader,
        unregisterHeader,
        moveFocus,
      }),
      [isPanelOpen, togglePanel, registerHeader, unregisterHeader, moveFocus],
    );

    const classes = ["mw-accordion", className].filter(Boolean).join(" ");

    return (
      <AccordionContext.Provider value={ctxValue}>
        <div {...rest} ref={ref} className={classes}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  },
);

Accordion.displayName = "MwAccordion";

export default Accordion;
