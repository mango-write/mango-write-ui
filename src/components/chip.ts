import type { Component } from "vue";

export interface ChipProps {
  label?: string;
  icon?: Component;
  image?: string;
  removable?: boolean;
}
