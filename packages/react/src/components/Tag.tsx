import {
  createElement,
  forwardRef,
  isValidElement,
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export type TagSeverity =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warn"
  | "warning"
  | "danger"
  | "contrast";

export type TagIconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export type TagIcon = TagIconComponent | ReactNode;

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  value?: string | number | null;
  severity?: TagSeverity | (string & {});
  rounded?: boolean;
  icon?: TagIcon;
  iconSlot?: ReactNode;
  children?: ReactNode;
}

function isIconComponent(icon: TagIcon): icon is TagIconComponent {
  if (!icon || isValidElement(icon)) return false;
  return (
    typeof icon === "function" ||
    (typeof icon === "object" && "$$typeof" in (icon as object))
  );
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function MwTag(
  {
    value,
    severity = "primary",
    rounded = false,
    icon,
    iconSlot,
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [
    "mw-tag",
    `mw-tag--${severity}`,
    rounded ? "mw-tag--rounded" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderedIcon =
    iconSlot !== undefined
      ? iconSlot
      : isIconComponent(icon)
        ? createElement(icon, { className: "mw-tag__icon", "aria-hidden": true })
        : icon;

  const hasChildren = children !== undefined && children !== null && children !== false;

  return (
    <span ref={ref} {...rest} className={classes} data-severity={severity}>
      {renderedIcon}
      {hasChildren ? (
        children
      ) : value !== undefined && value !== null ? (
        <span className="mw-tag__label">{value}</span>
      ) : null}
    </span>
  );
});

Tag.displayName = "MwTag";

export default Tag;
