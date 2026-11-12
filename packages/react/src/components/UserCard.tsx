import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Mail } from "lucide-react";
import Avatar from "./Avatar";
import Tag from "./Tag";

export interface UserProfile {
  id?: string | null;
  handle?: string | null;
  name: string;
  avatar?: string | null;
  email?: string | null;
  badge?: string | null;
  role?: string | null;
  description?: string | null;
}

export interface UserCardProps extends HTMLAttributes<HTMLDivElement> {
  user: UserProfile;
  size?: "medium" | "large";
  nameActions?: ReactNode;
  idActions?: ReactNode;
  card?: ReactNode | ((props: { user: UserProfile }) => ReactNode);
  children?: ReactNode;
}

export const UserCard = forwardRef<HTMLDivElement, UserCardProps>(
  function MwUserCard(
    {
      user,
      size = "medium",
      nameActions,
      idActions,
      card,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const displayName = user.name.trim();
    const initials = displayName.slice(0, 1).toUpperCase();
    const displayedId = user.handle ?? user.id ?? null;

    const classes = [
      "mw-user-card",
      size === "large" ? "mw-user-card--large" : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const extraCard =
      typeof card === "function" ? card({ user }) : card !== undefined ? card : children;

    return (
      <div ref={ref} {...rest} className={classes}>
        <div className="mw-user-card__head">
          <Avatar
            image={user.avatar || undefined}
            label={user.avatar ? undefined : initials}
            shape="circle"
            size={size === "large" ? "xlarge" : "lg"}
            className="mw-user-card__avatar"
          />
          <div className="mw-user-card__identity">
            <div className="mw-user-card__name-line">
              <strong className="mw-user-card__name">{displayName}</strong>
              {user.badge ? (
                <Tag
                  severity="primary"
                  rounded
                  className="mw-user-card__badge-tag mw-size-xs"
                >
                  {user.badge}
                </Tag>
              ) : null}
              {nameActions}
            </div>
            {displayedId ? (
              <div className="mw-user-card__id-line">
                <span className="mw-user-card__id">{displayedId}</span>
                {idActions}
              </div>
            ) : null}
          </div>
        </div>

        {user.role ? <div className="mw-user-card__role">{user.role}</div> : null}
        {user.email ? (
          <div className="mw-user-card__detail">
            <Mail className="mw-user-card__detail-icon" aria-hidden="true" />
            <span className="mw-user-card__email">{user.email}</span>
          </div>
        ) : null}
        {user.description ? (
          <p className="mw-user-card__description">{user.description}</p>
        ) : null}
        {extraCard}
      </div>
    );
  },
);

UserCard.displayName = "MwUserCard";

export default UserCard;
