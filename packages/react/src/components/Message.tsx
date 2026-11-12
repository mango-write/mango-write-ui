import {
  createElement,
  forwardRef,
  isValidElement,
  useState,
  type ComponentType,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { useUiLocale } from "../locale";

export type MessageSeverity =
  | "success"
  | "info"
  | "warn"
  | "warning"
  | "error"
  | "secondary"
  | "contrast";

export type MessageIconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export type MessageIcon = MessageIconComponent | ReactNode;

export interface MessageProps extends HTMLAttributes<HTMLDivElement> {
  severity?: MessageSeverity;
  closable?: boolean;
  icon?: MessageIcon;
  iconSlot?: ReactNode;
  onClose?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
}

function isIconComponent(icon: MessageIcon): icon is MessageIconComponent {
  if (!icon || isValidElement(icon)) return false;
  return (
    typeof icon === "function" ||
    (typeof icon === "object" && "$$typeof" in (icon as object))
  );
}

export const Message = forwardRef<HTMLDivElement, MessageProps>(function MwMessage(
  {
    severity = "info",
    closable = false,
    icon,
    iconSlot,
    onClose,
    role,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useUiLocale();

  if (dismissed) return null;

  const closeLabel = t("common.action.close");
  const normalizedSeverity = severity === "warning" ? "warn" : severity;
  const computedRole =
    role ??
    (normalizedSeverity === "error" || normalizedSeverity === "warn" ? "alert" : "status");

  const classes = [
    "mw-message",
    `mw-message--${normalizedSeverity}`,
    severity === "warning" ? "mw-message--warning" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const hasIcon =
    iconSlot !== undefined || (icon !== undefined && icon !== null && icon !== false);
  const renderedIcon =
    iconSlot !== undefined
      ? iconSlot
      : isIconComponent(icon)
        ? createElement(icon, { "aria-hidden": true })
        : icon;

  return (
    <div
      ref={ref}
      {...rest}
      className={classes}
      role={computedRole}
      data-severity={normalizedSeverity}
    >
      {hasIcon ? (
        <span className="mw-message__icon" aria-hidden="true">
          {renderedIcon}
        </span>
      ) : null}
      <div className="mw-message__content">{children}</div>
      {closable ? (
        <button
          type="button"
          className="mw-message__close"
          aria-label={closeLabel}
          onClick={(event) => {
            setDismissed(true);
            onClose?.(event);
          }}
        >
          <X className="mw-message__close-icon" size={14} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});

Message.displayName = "MwMessage";

export default Message;
