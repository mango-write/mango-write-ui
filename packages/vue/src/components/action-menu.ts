import type { Component } from "vue";

export interface ActionMenuCommandEvent {
  originalEvent: Event;
  item: ActionMenuItem;
}

export interface ActionMenuItem {
  key?: string;
  label?: string | (() => string);
  icon?: Component;
  command?: (event: ActionMenuCommandEvent) => void;
  url?: string;
  target?: string;
  disabled?: boolean | (() => boolean);
  visible?: boolean | (() => boolean);
  separator?: boolean;
  items?: ActionMenuItem[];
  children?: ActionMenuItem[];
  shortcut?: string;
  tooltip?: string;
  danger?: boolean;
  class?: string;
  style?: string | Record<string, string>;
  [key: string]: unknown;
}
