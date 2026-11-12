import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { ChevronDown } from "lucide-react";
import {
  AccordionContext,
  AccordionPanelContext,
  type AccordionHeaderProps,
} from "./accordion-defs";

export const AccordionHeader = forwardRef<HTMLButtonElement, AccordionHeaderProps>(
  function MwAccordionHeader(
    { disabled = false, className, onClick, onKeyDown, children, ...rest },
    forwardedRef,
  ) {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const accordion = useContext(AccordionContext);
    const panel = useContext(AccordionPanelContext);

    const isOpen = panel?.isOpen ?? false;
    const isDisabled = Boolean(disabled) || Boolean(panel?.disabled);

    useEffect(() => {
      const el = buttonRef.current;
      if (!el || !accordion) return;
      accordion.registerHeader(el);
      return () => {
        accordion.unregisterHeader(el);
      };
    }, [accordion]);

    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || isDisabled) return;
      panel?.toggle();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !buttonRef.current || !accordion) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        accordion.moveFocus(buttonRef.current, "next");
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        accordion.moveFocus(buttonRef.current, "prev");
      } else if (event.key === "Home") {
        event.preventDefault();
        accordion.moveFocus(buttonRef.current, "first");
      } else if (event.key === "End") {
        event.preventDefault();
        accordion.moveFocus(buttonRef.current, "last");
      }
    };

    const classes = [
      "mw-accordion__header",
      isOpen ? "mw-accordion__header--active" : undefined,
      isDisabled ? "mw-accordion__header--disabled" : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const resolvedChildren =
      typeof children === "function" ? children({ active: isOpen }) : children;

    return (
      <button
        {...rest}
        ref={setRefs}
        type="button"
        id={panel?.headerId}
        className={classes}
        aria-expanded={isOpen}
        aria-controls={panel?.contentId}
        disabled={isDisabled}
        data-state={isOpen ? "open" : "closed"}
        data-disabled={isDisabled ? "" : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {resolvedChildren}
        <ChevronDown className="mw-accordion__chevron" aria-hidden="true" />
      </button>
    );
  },
);

AccordionHeader.displayName = "MwAccordionHeader";

export default AccordionHeader;
