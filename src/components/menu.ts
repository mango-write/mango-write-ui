import type { Component } from "vue";

export interface MenuCommandEvent {
  originalEvent: Event;
  item: MenuItem;
  [key: string]: any;
}

export type MenuItemCommandEvent = MenuCommandEvent;

export interface MenuItem {
  key?: string;
  label?: string | ((...args: any[]) => string);
  icon?: Component;
  command?: (event: MenuCommandEvent) => void;
  url?: string;
  target?: string;
  disabled?: boolean | ((...args: any[]) => boolean);
  visible?: boolean | ((...args: any[]) => boolean);
  separator?: boolean;
  /** 右侧快捷键提示（纯展示，不注册按键） */
  shortcut?: string;
  /** 危险动作：文字与悬停底改用 danger 语义 */
  danger?: boolean;
  items?: MenuItem[];
  class?: any;
  style?: string | Record<string, string>;
  [key: string]: any;
}

export interface MenuProps {
  model?: MenuItem[];
  popup?: boolean;
  appendTo?: string | HTMLElement;
  ariaLabel?: string;
  ariaLabelledby?: string;
}

export interface MenuItemSlotProps {
  action: {
    class: string;
    href?: string;
    target?: string;
    role: string;
    tabindex: number;
    "aria-disabled"?: boolean;
    onClick: (event: MouseEvent) => void;
  };
  icon: {
    class: string;
    "aria-hidden": "true";
  };
  label: {
    class: string;
  };
}
