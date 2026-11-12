import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import Avatar from "./Avatar";
import HoverCard from "./HoverCard";
import Tag from "./Tag";
import UserCard, { type UserProfile } from "./UserCard";

export type UserChipVariant = "text" | "tag" | "avatar" | "person";
export type UserChipSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "small"
  | "medium"
  | "large";

export interface UserChipProps
  extends Omit<
    HTMLAttributes<HTMLElement> & AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  > {
  user: UserProfile;
  variant?: UserChipVariant;
  size?: UserChipSize;
  showCard?: boolean;
  href?: string | null;
  idActions?: ReactNode;
  card?: ReactNode | ((props: { user: UserProfile }) => ReactNode);
}

function resolveUserChipSize(
  size?: UserChipSize,
): "xs" | "sm" | "md" | "lg" | undefined {
  if (size === "small" || size === "sm") return "sm";
  if (size === "medium" || size === "md") return "md";
  if (size === "large" || size === "lg") return "lg";
  if (size === "xs") return "xs";
  return undefined;
}

export const UserChip = forwardRef<HTMLElement, UserChipProps>(
  function MwUserChip(
    {
      user,
      variant = "text",
      size,
      showCard = true,
      href = null,
      idActions,
      card,
      className,
      tabIndex,
      ...rest
    },
    ref,
  ) {
    const displayName = user.name.trim();
    const initials = displayName.slice(0, 1).toUpperCase();
    const isLink = Boolean(href);
    const resolvedSize = resolveUserChipSize(size);

    const classes = [
      "mw-user-chip",
      `mw-user-chip--${variant}`,
      showCard || isLink ? "mw-user-chip--interactive" : undefined,
      variant !== "text" && size ? `mw-user-chip--size-${size}` : undefined,
      variant !== "text" && resolvedSize ? `mw-size-${resolvedSize}` : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const computedTabIndex =
      tabIndex ?? (!isLink && showCard ? 0 : undefined);
    const computedAriaLabel =
      rest["aria-label"] ?? (variant === "avatar" ? user.name : undefined);

    const body =
      variant === "text" ? (
        <span className="mw-user-chip__text">@{displayName}</span>
      ) : variant === "avatar" ? (
        <Avatar
          image={user.avatar || undefined}
          label={user.avatar ? undefined : initials}
          shape="circle"
          className="mw-user-chip__avatar-only"
        />
      ) : variant === "person" ? (
        <span className="mw-user-chip__person">
          <Avatar
            image={user.avatar || undefined}
            label={user.avatar ? undefined : initials}
            shape="circle"
            className="mw-user-chip__person-avatar"
          />
          <span className="mw-user-chip__person-name">{displayName}</span>
        </span>
      ) : (
        <Tag severity="primary" rounded className="mw-user-chip__tag">
          <Avatar
            image={user.avatar || undefined}
            label={user.avatar ? undefined : initials}
            shape="circle"
            className="mw-user-chip__avatar"
          />
          <span>{displayName}</span>
        </Tag>
      );

    return (
      <HoverCard
        disabled={!showCard}
        label={user.name}
        focusable={false}
        content={<UserCard user={user} idActions={idActions} card={card} />}
      >
        {isLink ? (
          <a
            {...rest}
            ref={ref as Ref<HTMLAnchorElement>}
            href={href || undefined}
            className={classes}
            tabIndex={computedTabIndex}
            aria-label={computedAriaLabel}
          >
            {body}
          </a>
        ) : (
          <span
            {...rest}
            ref={ref as Ref<HTMLSpanElement>}
            className={classes}
            tabIndex={computedTabIndex}
            aria-label={computedAriaLabel}
          >
            {body}
          </span>
        )}
      </HoverCard>
    );
  },
);

UserChip.displayName = "MwUserChip";

export default UserChip;
