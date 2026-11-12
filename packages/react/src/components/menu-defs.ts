import type {
  CSSProperties,
  ComponentType,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  SyntheticEvent,
} from "react";

export type MenuIcon =
  | ReactNode
  | ComponentType<{
      size?: number;
      className?: string;
      "aria-hidden"?: boolean | "true" | "false";
    }>;

export type MenuEventLike =
  | Event
  | {
      currentTarget?: EventTarget | null;
      target?: EventTarget | null;
      clientX?: number;
      clientY?: number;
      nativeEvent?: Event;
    };

export interface MenuCommandEvent {
  originalEvent: Event | SyntheticEvent;
  item: MenuItem;
  [key: string]: unknown;
}

export type MenuItemCommandEvent = MenuCommandEvent;

export interface MenuItem {
  key?: string;
  label?: string | ((...args: unknown[]) => string);
  icon?: MenuIcon;
  command?: (event: MenuCommandEvent) => void;
  url?: string;
  target?: string;
  disabled?: boolean | ((...args: unknown[]) => boolean);
  visible?: boolean | ((...args: unknown[]) => boolean);
  separator?: boolean;
  /** 右侧快捷键提示（纯展示，不注册按键） */
  shortcut?: string;
  /** 危险动作：文字与悬停底改用 danger 语义 */
  danger?: boolean;
  items?: MenuItem[];
  class?: string;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

export interface MenuItemSlotProps {
  action: {
    className: string;
    href?: string;
    target?: string;
    role: "menuitem";
    tabIndex: number;
    "aria-disabled"?: boolean;
    onClick: (event: ReactMouseEvent<HTMLElement>) => void;
  };
  icon: {
    className: string;
    "aria-hidden": "true";
  };
  label: {
    className: string;
  };
}

export interface MenuHandle {
  toggle: (event?: MenuEventLike | null, target?: HTMLElement | null) => void;
  show: (event?: MenuEventLike | null, target?: HTMLElement | null) => void;
  hide: () => void;
  readonly open: boolean;
}

export interface MenuTriggerRenderProps {
  open: boolean;
  toggle: MenuHandle["toggle"];
  show: MenuHandle["show"];
  hide: () => void;
}

export interface MenuProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  model?: MenuItem[];
  popup?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode | ((props: MenuTriggerRenderProps) => ReactNode);
  appendTo?: "self" | "body" | (string & {}) | HTMLElement | null;
  ariaLabel?: string;
  ariaLabelledby?: string;
  start?: ReactNode;
  end?: ReactNode;
  renderSubmenuLabel?: (props: { item: MenuItem; label: string }) => ReactNode;
  submenulabel?: (props: { item: MenuItem; label: string }) => ReactNode;
  renderItem?: (props: {
    item: MenuItem;
    label: string;
    props: MenuItemSlotProps;
  }) => ReactNode;
  item?: (props: {
    item: MenuItem;
    label: string;
    props: MenuItemSlotProps;
  }) => ReactNode;
  onShow?: () => void;
  onHide?: () => void;
}
