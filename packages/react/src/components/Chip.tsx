import {
  createElement,
  forwardRef,
  isValidElement,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type SyntheticEvent,
} from "react";
import { X } from "lucide-react";
import type {
  ChipIcon,
  ChipIconComponent,
  ChipProps,
  ChipRemoveIconSlotProps,
} from "./chip-defs";

export type { ChipIcon, ChipIconComponent, ChipProps, ChipRemoveIconSlotProps };

function isIconComponent(icon: ChipIcon): icon is ChipIconComponent {
  if (!icon || isValidElement(icon)) return false;
  return (
    typeof icon === "function" ||
    (typeof icon === "object" && "$$typeof" in (icon as object))
  );
}

export const Chip = forwardRef<HTMLDivElement, ChipProps>(function MwChip(
  {
    label,
    icon,
    image,
    removable = false,
    onRemove,
    removeIcon,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const removeCallback = (event: SyntheticEvent | Event): void => {
    setVisible(false);
    onRemove?.(event);
  };

  const keydownCallback = (event: ReactKeyboardEvent): void => {
    if (event.key === "Enter" || event.key === "Backspace" || event.key === " ") {
      event.preventDefault();
      removeCallback(event);
    }
  };

  const classes = ["mw-chip", className].filter(Boolean).join(" ");
  const hasChildren = children !== undefined && children !== null && children !== false;

  const renderedIcon = isIconComponent(icon)
    ? createElement(icon, { className: "mw-chip__icon", "aria-hidden": true })
    : icon;

  return (
    <div
      ref={ref}
      {...rest}
      className={classes}
      aria-label={rest["aria-label"] ?? label}
    >
      {hasChildren ? (
        children
      ) : (
        <>
          {image ? (
            <img src={image} className="mw-chip__image" alt="" />
          ) : (
            renderedIcon
          )}
          {label ? <span className="mw-chip__label">{label}</span> : null}
        </>
      )}
      {removable
        ? typeof removeIcon === "function"
          ? removeIcon({ removeCallback, keydownCallback })
          : removeIcon !== undefined
            ? removeIcon
            : (
                <button
                  type="button"
                  className="mw-chip__remove"
                  aria-label="Remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCallback(e);
                  }}
                  onKeyDown={keydownCallback}
                >
                  <X className="mw-chip__remove-icon" aria-hidden="true" />
                </button>
              )
        : null}
    </div>
  );
});

Chip.displayName = "MwChip";

export default Chip;
