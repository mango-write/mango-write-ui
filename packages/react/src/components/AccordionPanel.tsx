import {
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
} from "react";
import {
  AccordionContext,
  AccordionPanelContext,
  type AccordionPanelProps,
} from "./accordion-defs";

export const AccordionPanel = forwardRef<HTMLDivElement, AccordionPanelProps>(
  function MwAccordionPanel(
    { value, disabled = false, className, children, ...rest },
    ref,
  ) {
    const uid = useId();
    const headerId = `mw-accordion-header-${uid}`;
    const contentId = `mw-accordion-content-${uid}`;

    const accordion = useContext(AccordionContext);
    const isOpen = accordion ? accordion.isPanelOpen(value) : false;
    const isDisabled = Boolean(disabled);

    const toggle = useCallback(() => {
      if (isDisabled) return;
      accordion?.togglePanel(value);
    }, [accordion, isDisabled, value]);

    const panelCtx = useMemo(
      () => ({
        value,
        disabled: isDisabled,
        isOpen,
        headerId,
        contentId,
        toggle,
      }),
      [value, isDisabled, isOpen, headerId, contentId, toggle],
    );

    const classes = [
      "mw-accordion__panel",
      isOpen ? "mw-accordion__panel--active" : undefined,
      isDisabled ? "mw-accordion__panel--disabled" : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const resolvedChildren =
      typeof children === "function" ? children({ active: isOpen }) : children;

    return (
      <AccordionPanelContext.Provider value={panelCtx}>
        <div
          {...rest}
          ref={ref}
          className={classes}
          data-state={isOpen ? "open" : "closed"}
          data-disabled={isDisabled ? "" : undefined}
        >
          {resolvedChildren}
        </div>
      </AccordionPanelContext.Provider>
    );
  },
);

AccordionPanel.displayName = "MwAccordionPanel";

export default AccordionPanel;
