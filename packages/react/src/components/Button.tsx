import {
  Children,
  Fragment,
  cloneElement,
  forwardRef,
  isValidElement,
  type ComponentType,
  type ElementType,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";
import type { ButtonIconProp, ButtonProps } from "./button-defs";

export type {
  ButtonIconComponent,
  ButtonIconPosition,
  ButtonIconProp,
  ButtonProps,
  ButtonSeverity,
  ButtonSize,
  ButtonVariant,
  NativeButtonType,
} from "./button-defs";

function hasRenderableNode(node: ReactNode): boolean {
  return Children.toArray(node).length > 0;
}

function hasIconValue(icon: ButtonIconProp | undefined): boolean {
  return icon !== undefined && icon !== null && typeof icon !== "boolean" && icon !== "";
}

function renderIconNode(icon: ButtonIconProp | undefined, iconClassName: string): ReactNode {
  if (!hasIconValue(icon)) return null;
  if (isValidElement(icon)) {
    if (icon.type === Fragment) return icon;
    const el = icon as ReactElement<{
      className?: string;
      "aria-hidden"?: boolean | "true" | "false";
    }>;
    return cloneElement(el, {
      className: [iconClassName, el.props.className].filter(Boolean).join(" "),
      "aria-hidden": el.props["aria-hidden"] ?? "true",
    });
  }
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
    const IconComp = icon as ComponentType<{
      className?: string;
      "aria-hidden"?: boolean | "true" | "false";
    }>;
    return <IconComp className={iconClassName} aria-hidden="true" />;
  }
  return (
    <span className={iconClassName} aria-hidden="true">
      {icon}
    </span>
  );
}

export const Button = forwardRef<HTMLElement, ButtonProps>(function MwButton(props, ref) {
  const {
    label,
    icon,
    iconPos = "left",
    loading = false,
    disabled = false,
    severity = "primary",
    variant,
    outlined = false,
    text = false,
    raised = false,
    rounded = false,
    fluid = false,
    size,
    badge,
    badgeClass,
    badgeSeverity,
    href,
    target,
    rel,
    as,
    type = "button",
    className,
    style,
    onClick,
    children,
    ...restAttrs
  } = props;

  const Tag: ElementType = as ?? (href ? "a" : "button");
  const isNativeButton = Tag === "button";
  const isBlocked = Boolean(disabled || loading);

  const resolvedVariant = variant
    ? variant
    : text
      ? "text"
      : outlined
        ? "outlined"
        : "filled";

  // 不传 size = 跟随容器的密度上下文（--control-*），传了才定档。
  const resolvedSize =
    size === "small" || size === "sm"
      ? "sm"
      : size === "large" || size === "lg"
        ? "lg"
        : size === "xs"
          ? "xs"
          : size === "md"
            ? "md"
            : undefined;

  const resolvedSeverity = severity === "warn" ? "warning" : severity;

  const hasDefaultSlot = hasRenderableNode(children);
  const hasIcon = hasIconValue(icon);
  const isIconOnly = hasIcon && !label && !hasDefaultSlot;

  const rootClass = [
    "mw-btn",
    `mw-btn--${resolvedVariant}`,
    `mw-btn--${resolvedSeverity}`,
    resolvedSize ? `mw-btn--${resolvedSize} mw-size-${resolvedSize}` : undefined,
    isIconOnly ? "mw-btn--icon-only" : undefined,
    iconPos === "right" ? "mw-btn--icon-right" : undefined,
    raised ? "mw-btn--raised" : undefined,
    rounded ? "mw-btn--rounded" : undefined,
    fluid ? "mw-btn--fluid" : undefined,
    loading ? "mw-btn--loading" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function handleClick(event: MouseEvent<HTMLElement>) {
    if (isBlocked) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  }

  return (
    <Tag
      {...restAttrs}
      ref={ref}
      type={isNativeButton ? type : undefined}
      href={href}
      target={target}
      rel={rel}
      className={rootClass}
      style={style}
      disabled={isNativeButton ? isBlocked : undefined}
      aria-disabled={isBlocked || undefined}
      aria-busy={loading || undefined}
      data-disabled={isBlocked ? "" : undefined}
      data-loading={loading ? "" : undefined}
      data-severity={resolvedSeverity}
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      onClick={handleClick}
    >
      {loading ? (
        <LoaderCircle className="mw-btn__icon mw-btn__spinner" aria-hidden="true" />
      ) : iconPos === "left" ? (
        renderIconNode(icon, "mw-btn__icon")
      ) : null}

      {hasDefaultSlot ? children : label ? <span className="mw-btn__label">{label}</span> : null}

      {!loading && iconPos === "right" ? renderIconNode(icon, "mw-btn__icon") : null}

      {badge !== undefined && badge !== null && badge !== "" ? (
        <span
          className={["mw-btn__badge", badgeClass].filter(Boolean).join(" ")}
          data-severity={badgeSeverity}
        >
          {badge}
        </span>
      ) : null}
    </Tag>
  );
});

Button.displayName = "MwButton";

export default Button;
