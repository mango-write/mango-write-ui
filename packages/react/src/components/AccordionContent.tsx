import { forwardRef, useContext } from "react";
import {
  AccordionPanelContext,
  type AccordionContentProps,
} from "./accordion-defs";

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function MwAccordionContent({ className, style, children, ...rest }, ref) {
    const panel = useContext(AccordionPanelContext);
    const isOpen = panel?.isOpen ?? false;

    const classes = ["mw-accordion__content", className].filter(Boolean).join(" ");
    const mergedStyle = isOpen ? style : { ...style, display: "none" };

    return (
      <div
        {...rest}
        ref={ref}
        id={panel?.contentId}
        className={classes}
        style={mergedStyle}
        hidden={!isOpen ? true : undefined}
        role="region"
        aria-labelledby={panel?.headerId}
        data-state={isOpen ? "open" : "closed"}
      >
        <div className="mw-accordion__content-inner">{children}</div>
      </div>
    );
  },
);

AccordionContent.displayName = "MwAccordionContent";

export default AccordionContent;
