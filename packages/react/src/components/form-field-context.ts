import { createContext, useContext } from "react";

export interface FormFieldContextValue {
  inputId?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  describedBy?: string;
}

export interface FormFieldSlotProps {
  inputId: string;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  describedBy?: string;
}

const DEFAULT_FORM_FIELD_CONTEXT: FormFieldContextValue = Object.freeze({
  inputId: undefined,
  invalid: undefined,
  disabled: undefined,
  required: undefined,
  describedBy: undefined,
});

export const FormFieldContext = createContext<FormFieldContextValue>(DEFAULT_FORM_FIELD_CONTEXT);

export function useFormFieldContext(): FormFieldContextValue {
  return useContext(FormFieldContext);
}

export function mergeDescribedBy(
  ...values: Array<string | undefined | null | false>
): string | undefined {
  const seen = new Set<string>();
  for (const raw of values) {
    if (!raw) continue;
    for (const token of raw.split(/\s+/)) {
      if (token) seen.add(token);
    }
  }
  return seen.size > 0 ? Array.from(seen).join(" ") : undefined;
}
