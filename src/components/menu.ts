export interface MenuCommandEvent {
  originalEvent: Event;
  item: MenuItem;
  [key: string]: any;
}

export type MenuItemCommandEvent = MenuCommandEvent;

export interface MenuItem {
  key?: string;
  label?: string | ((...args: any[]) => string);
  icon?: string;
  command?: (event: MenuCommandEvent) => void;
  url?: string;
  target?: string;
  disabled?: boolean | ((...args: any[]) => boolean);
  visible?: boolean | ((...args: any[]) => boolean);
  separator?: boolean;
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
