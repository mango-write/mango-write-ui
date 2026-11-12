import type {
  ComponentType,
  ElementType,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";

export type ButtonSeverity =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warn"
  | "warning"
  | "danger"
  | "contrast"
  | "help";

export type ButtonVariant = "filled" | "tinted" | "outlined" | "text" | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "small" | "large";

export type ButtonIconPosition = "left" | "right";

export type NativeButtonType = "button" | "submit" | "reset";

export type ButtonIconComponent = ComponentType<{
  className?: string;
  size?: number | string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export type ButtonIconProp = ButtonIconComponent | ReactNode;

export interface ButtonProps extends Omit<HTMLAttributes<HTMLElement>, "onClick"> {
  label?: string;
  icon?: ButtonIconProp;
  iconPos?: ButtonIconPosition;
  loading?: boolean;
  disabled?: boolean;
  severity?: ButtonSeverity;
  variant?: ButtonVariant;
  outlined?: boolean;
  text?: boolean;
  raised?: boolean;
  rounded?: boolean;
  fluid?: boolean;
  size?: ButtonSize;
  badge?: string | number;
  badgeClass?: string;
  badgeSeverity?: string;
  href?: string;
  target?: string;
  rel?: string;
  as?: ElementType;
  type?: NativeButtonType;
  name?: string;
  value?: string | number | readonly string[];
  form?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  children?: ReactNode;
}
