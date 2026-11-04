import type { Component } from "vue";

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

export type ButtonVariant = "filled" | "outlined" | "text" | "link";

export type ButtonSize = "sm" | "md" | "lg" | "small" | "large";

export type ButtonIconPosition = "left" | "right";

export type NativeButtonType = "button" | "submit" | "reset";

export interface ButtonProps {
  label?: string;
  icon?: string | Component;
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
  as?: string | Component;
  type?: NativeButtonType;
}
