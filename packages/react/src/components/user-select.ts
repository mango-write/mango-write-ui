import type { HTMLAttributes } from "react";
import type { SearchableMultiSelectSize } from "./SearchableMultiSelect";

export interface UserSelectOption extends Record<string, unknown> {
  id: string;
  name: string;
  avatar?: string | null;
  email?: string | null;
}

export interface UserSelectProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: string[];
  modelValue?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  onChange?: (value: string[]) => void;
  users: readonly UserSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  inputId?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  size?: SearchableMultiSelectSize;
  emptyMessage?: string;
}
