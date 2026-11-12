import {
  forwardRef,
  useId,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  FormFieldContext,
  type FormFieldContextValue,
  type FormFieldSlotProps,
} from "./form-field-context";

export {
  FormFieldContext,
  useFormFieldContext,
  type FormFieldContextValue,
  type FormFieldSlotProps,
} from "./form-field-context";

export interface FormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  inputId?: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  children?: ReactNode | ((slotProps: FormFieldSlotProps) => ReactNode);
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function MwFormField(
  props,
  ref,
) {
  const {
    inputId,
    label,
    hint,
    error,
    invalid,
    disabled = false,
    required = false,
    className,
    children,
    ...restAttrs
  } = props;

  const fallbackId = useId();
  const resolvedInputId = inputId ?? fallbackId;
  const hasHint = hint !== undefined && hint !== null && hint !== false && hint !== "";
  const hasError = error !== undefined && error !== null && error !== false && error !== "";
  const resolvedInvalid = Boolean(invalid ?? hasError);

  const hintId = `${resolvedInputId}-hint`;
  const errorId = `${resolvedInputId}-error`;
  const describedBy =
    [hasHint ? hintId : null, hasError ? errorId : null].filter(Boolean).join(" ") || undefined;

  const contextValue = useMemo<FormFieldContextValue>(
    () => ({
      inputId: resolvedInputId,
      invalid: resolvedInvalid,
      disabled,
      required,
      describedBy,
    }),
    [resolvedInputId, resolvedInvalid, disabled, required, describedBy],
  );

  const slotProps: FormFieldSlotProps = {
    inputId: resolvedInputId,
    invalid: resolvedInvalid,
    disabled,
    required,
    describedBy,
  };

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div
        {...restAttrs}
        ref={ref}
        className={["mw-form-field", className].filter(Boolean).join(" ")}
        data-disabled={disabled ? "" : undefined}
        data-invalid={resolvedInvalid ? "" : undefined}
      >
        {label !== undefined && label !== null ? (
          <label className="mw-form-field__label" htmlFor={resolvedInputId}>
            <span>{label}</span>
            {required ? (
              <span className="mw-form-field__required" aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
        ) : null}
        <div className="mw-form-field__control">
          {typeof children === "function" ? children(slotProps) : children}
        </div>
        {hasHint ? (
          <p id={hintId} className="mw-form-field__message">
            {hint}
          </p>
        ) : null}
        {hasError ? (
          <p id={errorId} className="mw-form-field__message mw-form-field__message--error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </FormFieldContext.Provider>
  );
});

FormField.displayName = "MwFormField";

export default FormField;
