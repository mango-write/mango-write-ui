import type {
  ComponentType,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  SyntheticEvent,
} from "react";

export type ChipIconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export type ChipIcon = ChipIconComponent | ReactNode;

export interface ChipRemoveIconSlotProps {
  removeCallback: (event: SyntheticEvent | Event) => void;
  keydownCallback: (event: ReactKeyboardEvent) => void;
}

export interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  icon?: ChipIcon;
  image?: string;
  removable?: boolean;
  onRemove?: (event: SyntheticEvent | Event) => void;
  removeIcon?: ReactNode | ((props: ChipRemoveIconSlotProps) => ReactNode);
  children?: ReactNode;
}
