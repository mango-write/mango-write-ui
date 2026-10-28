import type { MenuItem } from "primevue/menuitem";

export interface ActionMenuItem extends MenuItem {
  shortcut?: string;
  tooltip?: string;
  danger?: boolean;
}
