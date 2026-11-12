import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronDown, LoaderCircle, X } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type Ref,
} from "react";
import {
  isSameValue,
  resolveOptionDisabled,
  resolveOptionLabel as coreResolveOptionLabel,
  resolveOptionValue,
} from "@mango-write/ui-core/headless/option-accessor";
import { useScrollFade } from "../lib/scroll-fade";
import { measureMaxTextWidth } from "../lib/text-fit";
import { useUiLocale } from "../locale";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";
import type {
  SelectChangeEvent,
  SelectFilterEvent,
  SelectOptionAccessor,
  SelectOptionSlotProps,
  SelectProps,
  SelectSize,
  SelectValueSlotProps,
} from "./select-defs";

export type {
  SelectChangeEvent,
  SelectFilterEvent,
  SelectOptionAccessor,
  SelectOptionSlotProps,
  SelectProps,
  SelectSize,
  SelectValueSlotProps,
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function isNullishValue(val: unknown): boolean {
  return val === null || val === undefined;
}

function setMergedRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    (ref as { current: T | null }).current = value;
  }
}

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function resolveSelectOptionLabel(
  option: any,
  optionLabel?: SelectOptionAccessor<any, string>,
): string {
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
  return coreResolveOptionLabel(option, optionLabel);
}

const SelectBase = forwardRef<HTMLDivElement, SelectProps<any>>(function MwSelect(
  props,
  forwardedRef,
) {
  const {
    value: valueProp,
    modelValue,
    defaultValue = null,
    onValueChange,
    onChange,
    onFilter,
    onBeforeShow,
    onClick,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    options = [],
    optionLabel,
    optionValue,
    optionDisabled,
    placeholder,
    filter = false,
    filterPlaceholder,
    showClear = false,
    allowEmpty = true,
    editable = false,
    loading = false,
    disabled: disabledProp,
    readonly: readonlyProp = false,
    readOnly = false,
    invalid: invalidProp,
    required: requiredProp,
    fluid = false,
    size,
    inputId,
    id,
    name,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    emptyMessage,
    scrollHeight = "16rem",
    overlayStyle,
    appendTo = "body",
    header,
    empty,
    renderValue,
    renderOption,
    className,
    style,
    onKeyDown,
    ...restAttrs
  } = props;

  const formField = useFormFieldContext();
  const disabled = Boolean(disabledProp ?? formField.disabled ?? false);
  const invalid = Boolean(invalidProp ?? formField.invalid ?? false);
  const required = Boolean(requiredProp ?? formField.required ?? false);
  const resolvedInputId = inputId ?? formField.inputId;
  const isReadonly = Boolean(readonlyProp || readOnly);
  const { t } = useUiLocale();

  const isControlled = valueProp !== undefined || modelValue !== undefined;
  const controlledValue = valueProp !== undefined ? valueProp : modelValue;
  const [uncontrolledValue, setUncontrolledValue] = useState<any>(() => defaultValue);
  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const isOpenControlled = openProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
  const isOpen = isOpenControlled ? Boolean(openProp) : uncontrolledOpen;

  const [filterQuery, setFilterQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fitTextWidth, setFitTextWidth] = useState(0);

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const editableInputRef = useRef<HTMLInputElement | null>(null);
  const filterInputRef = useRef<HTMLInputElement | null>(null);
  const listboxNodeRef = useRef<HTMLUListElement | null>(null);
  const listboxScrollRef = useScrollFade<HTMLUListElement>(
    { size: "sm" },
    listboxNodeRef,
  );

  const generatedId = useId();
  const baseId = resolvedInputId ?? id ?? `mw-select-${generatedId}`;
  const triggerId = editable ? (id ?? `mw-select-${generatedId}`) : baseId;
  const editableInputId = resolvedInputId ?? `${triggerId}-input`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const effectiveAriaLabel = ariaLabel ?? restAttrs["aria-label"];
  const effectiveAriaLabelledby = ariaLabelledby ?? restAttrs["aria-labelledby"];
  const effectiveAriaDescribedby = mergeDescribedBy(
    formField.describedBy,
    ariaDescribedby,
    restAttrs["aria-describedby"],
  );

  const resolvedSize = useMemo(() => {
    if (size === "sm" || size === "small") return "sm";
    if (size === "lg" || size === "large") return "lg";
    if (size === "xs" || size === "md") return size;
    return undefined;
  }, [size]);

  const getOptionLabel = useCallback(
    (opt: any) => resolveSelectOptionLabel(opt, optionLabel),
    [optionLabel],
  );
  const getOptionValue = useCallback(
    (opt: any) => resolveOptionValue(opt, optionValue),
    [optionValue],
  );
  const isOptionDisabled = useCallback(
    (opt: any) => resolveOptionDisabled(opt, optionDisabled),
    [optionDisabled],
  );
  const isOptionSelected = useCallback(
    (opt: any) => {
      if (isNullishValue(currentValue)) return false;
      return isSameValue(getOptionValue(opt), currentValue);
    },
    [currentValue, getOptionValue],
  );

  const selectedOption = useMemo(() => {
    if (isNullishValue(currentValue)) return undefined;
    return options.find((opt) => isSameValue(getOptionValue(opt), currentValue));
  }, [currentValue, options, getOptionValue]);

  const hasValue = !isNullishValue(currentValue);
  const hasSelectedDisplay = useMemo(() => {
    if (!hasValue) return false;
    if (selectedOption !== undefined) return true;
    return currentValue !== "";
  }, [hasValue, selectedOption, currentValue]);

  const displayLabel = useMemo(() => {
    if (selectedOption !== undefined) {
      return getOptionLabel(selectedOption);
    }
    if (isNullishValue(currentValue)) {
      return "";
    }
    return String(currentValue);
  }, [selectedOption, currentValue, getOptionLabel]);

  const showClearButton =
    showClear &&
    allowEmpty !== false &&
    hasValue &&
    !disabled &&
    !isReadonly &&
    !loading;

  const measureFitWidth = useCallback(() => {
    const texts = options
      .filter((opt) => !isOptionDisabled(opt))
      .map((opt) => getOptionLabel(opt));
    const measured = measureMaxTextWidth(triggerRef.current, texts);
    setFitTextWidth((prev) => (prev === measured ? prev : measured));
  }, [options, isOptionDisabled, getOptionLabel]);

  useIsomorphicLayoutEffect(() => {
    measureFitWidth();
  }, [measureFitWidth]);

  useEffect(() => {
    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          if (!cancelled) measureFitWidth();
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [measureFitWidth]);

  const filteredOptions = useMemo(() => {
    if (!filter) return options;
    const q = filterQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => getOptionLabel(opt).toLowerCase().includes(q));
  }, [options, filter, filterQuery, getOptionLabel]);

  const emptyText = useMemo(() => {
    if (emptyMessage) return emptyMessage;
    return filterQuery.trim()
      ? t("common.select.noMatch")
      : t("common.select.empty");
  }, [emptyMessage, filterQuery, t]);

  const findInitialActiveIndex = useCallback(
    (list: readonly any[]) => {
      if (!list.length) return -1;
      const selectedIdx = list.findIndex(
        (opt) => isOptionSelected(opt) && !isOptionDisabled(opt),
      );
      if (selectedIdx >= 0) return selectedIdx;
      return list.findIndex((opt) => !isOptionDisabled(opt));
    },
    [isOptionSelected, isOptionDisabled],
  );

  const findEdgeEnabledIndex = useCallback(
    (list: readonly any[], edge: "first" | "last") => {
      if (!list.length) return -1;
      if (edge === "first") {
        return list.findIndex((opt) => !isOptionDisabled(opt));
      }
      for (let i = list.length - 1; i >= 0; i -= 1) {
        if (!isOptionDisabled(list[i])) return i;
      }
      return -1;
    },
    [isOptionDisabled],
  );

  const findNextEnabledIndex = useCallback(
    (list: readonly any[], current: number, step: 1 | -1) => {
      const len = list.length;
      if (!len) return -1;
      let idx = current;
      for (let count = 0; count < len; count += 1) {
        idx += step;
        if (idx < 0 || idx >= len) {
          return current;
        }
        if (!isOptionDisabled(list[idx])) {
          return idx;
        }
      }
      return current;
    },
    [isOptionDisabled],
  );

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const item =
      listboxNodeRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[
        activeIndex
      ];
    item?.scrollIntoView?.({ block: "nearest" });
  }, [isOpen, activeIndex]);

  const setOpenState = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const openPanel = useCallback(() => {
    if (disabled || isReadonly || loading) return;
    if (isOpen) return;
    onBeforeShow?.();
    setFilterQuery("");
    setActiveIndex(findInitialActiveIndex(options));
    setOpenState(true);
  }, [
    disabled,
    isReadonly,
    loading,
    isOpen,
    onBeforeShow,
    findInitialActiveIndex,
    options,
    setOpenState,
  ]);

  const closePanel = useCallback(
    (restoreFocus = false) => {
      if (!isOpen) return;
      setOpenState(false);
      setFilterQuery("");
      setActiveIndex(-1);
      if (restoreFocus) {
        queueMicrotask(() => {
          if (editable) {
            editableInputRef.current?.focus();
          } else {
            triggerRef.current?.focus();
          }
        });
      }
    },
    [isOpen, setOpenState, editable],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        openPanel();
      } else {
        closePanel(false);
      }
    },
    [openPanel, closePanel],
  );

  const commitValue = useCallback(
    (nextVal: any, originalEvent?: Event) => {
      if (!isControlled) {
        setUncontrolledValue(nextVal);
      }
      onValueChange?.(nextVal);
      onChange?.({ value: nextVal, originalEvent });
    },
    [isControlled, onValueChange, onChange],
  );

  const selectOption = useCallback(
    (option: any, originalEvent?: Event) => {
      if (disabled || isReadonly || isOptionDisabled(option)) return;
      const nextVal = getOptionValue(option);
      commitValue(nextVal, originalEvent);
      closePanel(true);
    },
    [disabled, isReadonly, isOptionDisabled, getOptionValue, commitValue, closePanel],
  );

  const handleClear = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (disabled || isReadonly || allowEmpty === false) return;
    commitValue(null, event.nativeEvent);
    closePanel(true);
  };

  const handleEditableChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled || isReadonly) return;
    commitValue(event.target.value, event.nativeEvent);
  };

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.target.value;
    setFilterQuery(nextQuery);
    onFilter?.({ value: nextQuery, originalEvent: event.nativeEvent });
    const nextList = !filter || !nextQuery.trim()
      ? options
      : options.filter((opt) =>
          getOptionLabel(opt).toLowerCase().includes(nextQuery.trim().toLowerCase()),
        );
    setActiveIndex(findEdgeEnabledIndex(nextList, "first"));
  };

  const handleNavigationKeydown = (
    event: ReactKeyboardEvent<HTMLElement>,
    fromInput = false,
  ) => {
    if (disabled || isReadonly || loading) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        openPanel();
        return;
      }
      setActiveIndex((prev) =>
        prev < 0
          ? findEdgeEnabledIndex(filteredOptions, "first")
          : findNextEnabledIndex(filteredOptions, prev, 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openPanel();
        return;
      }
      setActiveIndex((prev) =>
        prev < 0
          ? findEdgeEnabledIndex(filteredOptions, "last")
          : findNextEnabledIndex(filteredOptions, prev, -1),
      );
    } else if (event.key === "Home") {
      if (isOpen) {
        event.preventDefault();
        setActiveIndex(findEdgeEnabledIndex(filteredOptions, "first"));
      }
    } else if (event.key === "End") {
      if (isOpen) {
        event.preventDefault();
        setActiveIndex(findEdgeEnabledIndex(filteredOptions, "last"));
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (!isOpen) {
        openPanel();
        return;
      }
      const option = filteredOptions[activeIndex];
      if (option !== undefined && !isOptionDisabled(option)) {
        selectOption(option, event.nativeEvent);
      }
    } else if (event.key === " " && !fromInput) {
      event.preventDefault();
      if (!isOpen) {
        openPanel();
        return;
      }
      const option = filteredOptions[activeIndex];
      if (option !== undefined && !isOptionDisabled(option)) {
        selectOption(option, event.nativeEvent);
      }
    } else if (event.key === "Escape") {
      if (isOpen) {
        event.preventDefault();
        event.stopPropagation();
        closePanel(true);
      }
    }
  };

  const handleTriggerClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (isReadonly || loading) return;
    if (isOpen) {
      closePanel(false);
    } else {
      openPanel();
    }
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const isInputTarget =
      (event.target as HTMLElement | null)?.tagName === "INPUT";
    handleNavigationKeydown(event, isInputTarget);
  };

  const rootClassName = cx(
    "mw-select",
    "mw-control",
    resolvedSize && `mw-select--${resolvedSize}`,
    resolvedSize && `mw-size-${resolvedSize}`,
    fluid && "mw-select--fluid",
    disabled && "mw-select--disabled",
    isReadonly && "mw-select--readonly",
    invalid && "mw-select--invalid",
    loading && "mw-select--loading",
    isOpen && "mw-select--open",
    editable && "mw-select--editable",
    showClear && allowEmpty !== false && "mw-select--clearable",
    className,
  );

  const rootStyle: CSSProperties = {
    ...style,
    "--mw-select-fit-text": `${fitTextWidth}px`,
  } as CSSProperties;

  const optionKey = (option: any, index: number): string => {
    const val = getOptionValue(option);
    if (val !== null && typeof val === "object") {
      return `obj-${index}`;
    }
    return `${typeof val}:${String(val)}-${index}`;
  };

  const portalContainer =
    appendTo && appendTo !== "body" && appendTo !== "self"
      ? appendTo
      : undefined;

  const panelContent = (
    <PopoverPrimitive.Content
      className="mw-select__panel mw-frost mw-scroll-scope"
      style={overlayStyle}
      sideOffset={4}
      align="start"
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        if (filter) {
          queueMicrotask(() => {
            filterInputRef.current?.focus();
          });
        }
      }}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
      }}
      onInteractOutside={(event) => {
        if (triggerRef.current?.contains(event.target as Node)) {
          event.preventDefault();
        }
      }}
      onEscapeKeyDown={(event) => {
        event.stopPropagation();
        closePanel(true);
      }}
      onKeyDown={(event) => {
        if (event.defaultPrevented) return;
        const isInputTarget =
          (event.target as HTMLElement | null)?.tagName === "INPUT";
        handleNavigationKeydown(event, isInputTarget);
      }}
    >
      {header !== undefined && header !== null && (
        <div className="mw-select__header">{header}</div>
      )}

      {filter && (
        <div className="mw-select__filter-wrap">
          <input
            ref={filterInputRef}
            type="text"
            className="mw-select__filter-input mw-control mw-input"
            value={filterQuery}
            placeholder={filterPlaceholder}
            aria-label={filterPlaceholder || effectiveAriaLabel}
            aria-controls={listboxId}
            aria-activedescendant={
              activeIndex >= 0 ? optionId(activeIndex) : undefined
            }
            autoComplete="off"
            spellCheck={false}
            onChange={handleFilterChange}
            onKeyDown={(event) => {
              event.stopPropagation();
              handleNavigationKeydown(event, true);
            }}
          />
        </div>
      )}

      <ul
        id={listboxId}
        ref={listboxScrollRef}
        role="listbox"
        className="mw-select__list mw-scroll"
        style={{ maxHeight: scrollHeight }}
        aria-label={effectiveAriaLabel}
        aria-labelledby={effectiveAriaLabelledby}
      >
        {filteredOptions.map((option, index) => {
          const selected = isOptionSelected(option);
          const optDisabled = isOptionDisabled(option);
          const highlighted = index === activeIndex;
          const label = getOptionLabel(option);

          return (
            <li
              key={optionKey(option, index)}
              id={optionId(index)}
              role="option"
              className={cx(
                "mw-select__option",
                selected && "mw-select__option--selected",
                highlighted && "mw-select__option--highlighted",
                optDisabled && "mw-select__option--disabled",
              )}
              aria-selected={selected}
              aria-disabled={optDisabled || undefined}
              data-state={selected ? "checked" : "unchecked"}
              data-highlighted={highlighted ? "" : undefined}
              data-disabled={optDisabled ? "" : undefined}
              onMouseMove={() => {
                if (!optDisabled) {
                  setActiveIndex(index);
                }
              }}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={(event) => {
                selectOption(option, event.nativeEvent);
              }}
            >
              <span className="mw-select__option-label">
                {renderOption
                  ? renderOption({
                      option,
                      index,
                      selected,
                      disabled: optDisabled,
                      label,
                    })
                  : label}
              </span>
              {selected && (
                <Check className="mw-select__check" aria-hidden="true" />
              )}
            </li>
          );
        })}

        {filteredOptions.length === 0 && (
          <li className="mw-select__empty" role="presentation">
            {empty !== undefined ? empty : emptyText}
          </li>
        )}
      </ul>
    </PopoverPrimitive.Content>
  );

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Anchor asChild>
        <div
          {...restAttrs}
          ref={(node) => {
            triggerRef.current = node;
            setMergedRef(forwardedRef, node);
          }}
          id={triggerId}
          className={rootClassName}
          style={rootStyle}
          role={editable ? undefined : "combobox"}
          aria-haspopup={editable ? undefined : "listbox"}
          aria-expanded={editable ? undefined : isOpen}
          aria-controls={editable ? undefined : listboxId}
          aria-activedescendant={
            !editable && isOpen && activeIndex >= 0
              ? optionId(activeIndex)
              : undefined
          }
          aria-label={editable ? undefined : effectiveAriaLabel}
          aria-labelledby={editable ? undefined : effectiveAriaLabelledby}
          aria-describedby={editable ? undefined : effectiveAriaDescribedby}
          aria-invalid={!editable ? (invalid || undefined) : undefined}
          aria-required={!editable ? (required || undefined) : undefined}
          aria-disabled={!editable ? (disabled || undefined) : undefined}
          aria-readonly={!editable ? (isReadonly || undefined) : undefined}
          tabIndex={editable || disabled ? -1 : 0}
          data-state={isOpen ? "open" : "closed"}
          data-disabled={disabled ? "true" : undefined}
          data-readonly={isReadonly ? "true" : undefined}
          data-invalid={invalid ? "true" : undefined}
          data-loading={loading ? "true" : undefined}
          data-placeholder={!hasSelectedDisplay ? "" : undefined}
          data-size={resolvedSize}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
        >
          {editable ? (
            <input
              id={editableInputId}
              ref={editableInputRef}
              name={name}
              type="text"
              className="mw-select__input"
              value={displayLabel}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={isReadonly}
              required={required}
              role="combobox"
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-activedescendant={
                isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
              }
              aria-label={effectiveAriaLabel}
              aria-labelledby={effectiveAriaLabelledby}
              aria-describedby={effectiveAriaDescribedby}
              aria-invalid={invalid || undefined}
              autoComplete="off"
              spellCheck={false}
              onClick={(event) => event.stopPropagation()}
              onChange={handleEditableChange}
              onKeyDown={(event) => {
                event.stopPropagation();
                handleNavigationKeydown(event, true);
              }}
            />
          ) : (
            <span
              className={cx(
                "mw-select__label",
                !hasSelectedDisplay && "mw-select__label--placeholder",
              )}
            >
              {renderValue
                ? renderValue({
                    value: currentValue,
                    option: selectedOption,
                    placeholder,
                    label: displayLabel,
                  })
                : hasSelectedDisplay
                  ? displayLabel
                  : (placeholder ?? "")}
            </span>
          )}

          {!editable && name && (
            <input
              type="hidden"
              name={name}
              value={isNullishValue(currentValue) ? "" : String(currentValue)}
              disabled={disabled}
            />
          )}

          {showClearButton && (
            <button
              type="button"
              className="mw-select__clear"
              aria-label={t("common.select.clear")}
              tabIndex={-1}
              onMouseDown={(event) => {
                event.stopPropagation();
                event.preventDefault();
              }}
              onClick={handleClear}
            >
              <X className="mw-select__clear-icon" aria-hidden="true" />
            </button>
          )}

          <span className="mw-select__dropdown" aria-hidden="true">
            {loading ? (
              <LoaderCircle className="mw-select__spinner" />
            ) : (
              <ChevronDown className="mw-select__chevron" />
            )}
          </span>
        </div>
      </PopoverPrimitive.Anchor>

      {appendTo === "self" ? (
        panelContent
      ) : (
        <PopoverPrimitive.Portal container={portalContainer}>
          {panelContent}
        </PopoverPrimitive.Portal>
      )}
    </PopoverPrimitive.Root>
  );
});

SelectBase.displayName = "MwSelect";

export type SelectComponent = (<T = any>(
  props: SelectProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement | null) & {
  displayName?: string;
};

export const Select = SelectBase as unknown as SelectComponent;
Select.displayName = "MwSelect";

export default Select;
