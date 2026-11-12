import type { HTMLAttributes, ReactNode } from "react";
import type { AsyncSearchOption } from "@mango-write/ui-core/defs";

export type { AsyncSearchOption };

export interface AsyncSearchSelectOptionSlotProps {
  option: AsyncSearchOption;
  selected: boolean;
  index: number;
}

export interface AsyncSearchSelectProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange" | "onSelect"
  > {
  value?: string | null;
  modelValue?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  onChange?: (value: string | null) => void;
  onSelect?: (option: AsyncSearchOption | null) => void;
  search: (query: string) => Promise<AsyncSearchOption[]>;
  inputId?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  placeholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  retryLabel?: string;
  showClear?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  fluid?: boolean;
  debounceMs?: number;
  excludeValues?: readonly string[];
  initialOption?: AsyncSearchOption | null;
  renderOption?: (props: AsyncSearchSelectOptionSlotProps) => ReactNode;
}
