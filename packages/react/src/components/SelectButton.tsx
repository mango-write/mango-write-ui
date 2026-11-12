import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
} from "react";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";
import type { SelectButtonProps } from "./select-button";

export type {
  SelectButtonChangeEvent,
  SelectButtonOptionAccessor,
  SelectButtonProps,
  SelectButtonSize,
} from "./select-button";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    (ref as { current: T | null }).current = value;
  }
}

export const SelectButton = forwardRef<HTMLDivElement, SelectButtonProps>(function MwSelectButton(
  props,
  forwardedRef,
) {
  const {
    value,
    defaultValue,
    modelValue,
    onValueChange,
    onChange,
    options = [],
    optionLabel,
    optionValue,
    optionDisabled,
    multiple = false,
    allowEmpty = true,
    unselectable = true,
    disabled,
    readOnly,
    readonly,
    invalid,
    size,
    ariaLabel,
    ariaLabelledby,
    dataKey,
    renderOption,
    className,
    style,
    "aria-label": nativeAriaLabel,
    "aria-labelledby": nativeAriaLabelledby,
    "aria-describedby": nativeAriaDescribedby,
    ...restAttrs
  } = props;

  const fieldContext = useFormFieldContext();
  const groupRef = useRef<HTMLDivElement | null>(null);
  const controlledProp = value !== undefined ? value : modelValue;
  const isControlled = controlledProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<any>(() =>
    defaultValue !== undefined ? defaultValue : multiple ? [] : null,
  );
  const currentValue = isControlled ? controlledProp : uncontrolledValue;

  const resolvedDisabled = Boolean(disabled ?? fieldContext.disabled);
  const resolvedReadOnly = Boolean(readOnly ?? readonly);
  const resolvedInvalid = Boolean(invalid ?? fieldContext.invalid);
  const resolvedDescribedBy = mergeDescribedBy(nativeAriaDescribedby, fieldContext.describedBy);

  const resolvedSize =
    size === "small" || size === "sm"
      ? "sm"
      : size === "large" || size === "lg"
        ? "lg"
        : size === "xs" || size === "md"
          ? size
          : undefined;

  const canEmpty = allowEmpty !== false && unselectable !== false;

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      groupRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef],
  );

  function isSameValue(a: any, b: any): boolean {
    if (Object.is(a, b)) return true;
    if (a !== null && b !== null && typeof a === "object" && typeof b === "object") {
      if (dataKey && dataKey in a && dataKey in b) {
        return Object.is(
          (a as Record<string, unknown>)[dataKey],
          (b as Record<string, unknown>)[dataKey],
        );
      }
      try {
        return JSON.stringify(a) === JSON.stringify(b);
      } catch {
        return false;
      }
    }
    return false;
  }

  function resolveOptionLabel(option: any): string {
    if (option === null || option === undefined) return "";
    if (typeof optionLabel === "function") {
      return String(optionLabel(option) ?? "");
    }
    if (typeof optionLabel === "string" && typeof option === "object") {
      return String((option as Record<string, unknown>)[optionLabel] ?? "");
    }
    if (typeof option === "object" && "label" in option) {
      return String((option as Record<string, unknown>).label ?? "");
    }
    return String(option);
  }

  function resolveOptionValue(option: any): any {
    if (option === null || option === undefined) return option;
    if (typeof optionValue === "function") {
      return optionValue(option);
    }
    if (typeof optionValue === "string" && typeof option === "object") {
      return (option as Record<string, unknown>)[optionValue];
    }
    return option;
  }

  function isOptionDisabled(option: any): boolean {
    if (resolvedDisabled) return true;
    if (option === null || option === undefined) return false;
    if (typeof optionDisabled === "function") {
      return Boolean(optionDisabled(option));
    }
    if (typeof optionDisabled === "string" && typeof option === "object") {
      return Boolean((option as Record<string, unknown>)[optionDisabled]);
    }
    if (optionDisabled === undefined && typeof option === "object" && "disabled" in option) {
      return Boolean((option as Record<string, unknown>).disabled);
    }
    return false;
  }

  function isOptionSelected(option: any): boolean {
    const val = resolveOptionValue(option);
    if (multiple) {
      if (!Array.isArray(currentValue)) return false;
      return currentValue.some((item) => isSameValue(item, val));
    }
    if (currentValue === null || currentValue === undefined) return false;
    return isSameValue(currentValue, val);
  }

  function optionKey(option: any, index: number): string {
    const val = resolveOptionValue(option);
    if (val !== null && typeof val === "object") {
      if (dataKey && dataKey in val) {
        return `key-${String((val as Record<string, unknown>)[dataKey])}-${index}`;
      }
      return `obj-${index}`;
    }
    return `${typeof val}:${String(val)}-${index}`;
  }

  function commitSelection(nextValue: any, originalEvent: Event) {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }
    onValueChange?.(nextValue);
    onChange?.({ originalEvent, value: nextValue });
  }

  function handleOptionClick(option: any, event: MouseEvent<HTMLButtonElement>) {
    if (resolvedDisabled || resolvedReadOnly || isOptionDisabled(option)) return;
    const val = resolveOptionValue(option);
    const selected = isOptionSelected(option);

    if (multiple) {
      const current = Array.isArray(currentValue) ? currentValue : [];
      let nextValue: any[];
      if (selected) {
        if (!canEmpty && current.length <= 1) {
          return;
        }
        nextValue = current.filter((item) => !isSameValue(item, val));
      } else {
        nextValue = [...current, val];
      }
      commitSelection(nextValue, event.nativeEvent);
      return;
    }

    if (selected) {
      if (!canEmpty) {
        return;
      }
      commitSelection(null, event.nativeEvent);
      return;
    }

    commitSelection(val, event.nativeEvent);
  }

  function handleOptionKeyDown(index: number, event: KeyboardEvent<HTMLButtonElement>) {
    if (resolvedDisabled) return;
    const list = options ?? [];
    if (!list.length) return;

    let targetIdx = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      for (let step = 1; step <= list.length; step++) {
        const candidate = (index + step) % list.length;
        if (!isOptionDisabled(list[candidate])) {
          targetIdx = candidate;
          break;
        }
      }
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      for (let step = 1; step <= list.length; step++) {
        const candidate = (index - step + list.length) % list.length;
        if (!isOptionDisabled(list[candidate])) {
          targetIdx = candidate;
          break;
        }
      }
    } else if (event.key === "Home") {
      event.preventDefault();
      targetIdx = list.findIndex((opt) => !isOptionDisabled(opt));
    } else if (event.key === "End") {
      event.preventDefault();
      for (let i = list.length - 1; i >= 0; i--) {
        if (!isOptionDisabled(list[i])) {
          targetIdx = i;
          break;
        }
      }
    }

    if (targetIdx >= 0) {
      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>(
        ".mw-select-button__item",
      );
      buttons?.[targetIdx]?.focus();
    }
  }

  const rootClass = [
    "mw-select-button",
    resolvedSize ? `mw-select-button--${resolvedSize} mw-size-${resolvedSize}` : undefined,
    resolvedDisabled ? "mw-select-button--disabled" : undefined,
    resolvedReadOnly ? "mw-select-button--readonly" : undefined,
    resolvedInvalid ? "mw-select-button--invalid" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...restAttrs}
      ref={setRefs}
      role="group"
      className={rootClass}
      style={style}
      aria-label={ariaLabel ?? nativeAriaLabel}
      aria-labelledby={ariaLabelledby ?? nativeAriaLabelledby}
      aria-describedby={resolvedDescribedBy}
      aria-invalid={resolvedInvalid || undefined}
      data-invalid={resolvedInvalid ? "" : undefined}
      data-disabled={resolvedDisabled ? "" : undefined}
      data-readonly={resolvedReadOnly ? "" : undefined}
      data-size={resolvedSize}
    >
      {options.map((option, index) => {
        const selected = isOptionSelected(option);
        const optDisabled = isOptionDisabled(option);
        const itemClass = [
          "mw-select-button__item",
          selected ? "mw-select-button__item--active" : undefined,
          optDisabled ? "mw-select-button__item--disabled" : undefined,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={optionKey(option, index)}
            type="button"
            className={itemClass}
            disabled={optDisabled}
            aria-pressed={selected ? "true" : "false"}
            data-state={selected ? "checked" : "unchecked"}
            data-disabled={optDisabled ? "" : undefined}
            onClick={(e) => handleOptionClick(option, e)}
            onKeyDown={(e) => handleOptionKeyDown(index, e)}
          >
            <span className="mw-select-button__content">
              {renderOption ? (
                renderOption(option, index)
              ) : (
                <span className="mw-select-button__label">{resolveOptionLabel(option)}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
});

SelectButton.displayName = "MwSelectButton";

export default SelectButton;
