import {
  createElement,
  forwardRef,
  isValidElement,
  useState,
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
  type SyntheticEvent,
} from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "normal" | "large" | "xlarge";
export type AvatarShape = "square" | "circle";

export type AvatarIconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export type AvatarIcon = AvatarIconComponent | ReactNode;

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "onError"> {
  label?: string;
  icon?: AvatarIcon;
  iconSlot?: ReactNode;
  image?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  ariaLabel?: string;
  onError?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
  children?: ReactNode;
}

function normalizeAvatarSize(
  size?: AvatarSize,
): "xs" | "sm" | "normal" | "large" | "xlarge" | undefined {
  if (size === "xs" || size === "sm" || size === "xlarge") return size;
  if (size === "lg" || size === "large") return "large";
  if (size === "md" || size === "normal") return "normal";
  return undefined;
}

function resolveAvatarSizeStep(
  normalized?: "xs" | "sm" | "normal" | "large" | "xlarge",
): "xs" | "sm" | "md" | "lg" | undefined {
  if (normalized === "normal") return "md";
  if (normalized === "large") return "lg";
  if (normalized === "xlarge") return undefined;
  return normalized;
}

function isIconComponent(icon: AvatarIcon): icon is AvatarIconComponent {
  if (!icon || isValidElement(icon)) return false;
  return (
    typeof icon === "function" ||
    (typeof icon === "object" && "$$typeof" in (icon as object))
  );
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function MwAvatar(
  {
    label,
    icon,
    iconSlot,
    image,
    size,
    shape = "square",
    ariaLabel,
    onError,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [prevImage, setPrevImage] = useState(image);
  const [imageFailed, setImageFailed] = useState(false);

  if (image !== prevImage) {
    setPrevImage(image);
    setImageFailed(false);
  }

  const showImage = Boolean(image) && !imageFailed;
  const normalizedSize = normalizeAvatarSize(size);
  const sizeStep = resolveAvatarSizeStep(normalizedSize);

  const classes = [
    "mw-avatar",
    `mw-avatar--${shape}`,
    normalizedSize ? `mw-avatar--${normalizedSize}` : undefined,
    size && size !== normalizedSize ? `mw-avatar--${size}` : undefined,
    sizeStep ? `mw-size-${sizeStep}` : undefined,
    showImage ? "mw-avatar--image" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const hasChildren = children !== undefined && children !== null && children !== false;
  const renderedIcon =
    iconSlot !== undefined
      ? iconSlot
      : isIconComponent(icon)
        ? createElement(icon, { className: "mw-avatar__icon", "aria-hidden": true })
        : icon;

  return (
    <span
      ref={ref}
      {...rest}
      className={classes}
      aria-label={rest["aria-label"] ?? ariaLabel}
      data-shape={shape}
      data-size={normalizedSize}
    >
      {showImage ? (
        <img
          src={image}
          alt={ariaLabel ?? label ?? ""}
          className="mw-avatar__image"
          onError={(event) => {
            setImageFailed(true);
            onError?.(event);
          }}
        />
      ) : hasChildren ? (
        children
      ) : label ? (
        <span className="mw-avatar__label">{label}</span>
      ) : (
        renderedIcon
      )}
    </span>
  );
});

Avatar.displayName = "MwAvatar";

export default Avatar;
