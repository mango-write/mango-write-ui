import { ChevronDown, X } from "lucide-react";
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
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { isSameValue } from "@mango-write/ui-core/headless/option-accessor";
import { useScrollFade } from "../lib/scroll-fade";
import { useComboPanel } from "../lib/useComboPanel";
import { useUiLocale } from "../locale";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";

export type SearchableSelectSize = "small" | "large" | "sm" | "md" | "lg";

export interface SearchableSelectOptionSlotProps<
  TOption = Record<string, unknown>,
> {
  option: TOption;
  label: string;
  index: number;
  selected: boolean;
}

export interface SearchableSelectProps<
  TValue = unknown,
  TOption extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: TValue | null;
  modelValue?: TValue | null;
  defaultValue?: TValue | null;
  onValueChange?: (value: TValue | null) => void;
  onChange?: (value: TValue | null) => void;
  onShow?: () => void;
  options: readonly TOption[];
  optionLabel: string | ((option: TOption) => string);
  optionValue?: string | ((option: TOption) => TValue);
  inputId?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  placeholder?: string;
  showClear?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  size?: SearchableSelectSize;
  emptyMessage?: string;
  renderOption?: (props: SearchableSelectOptionSlotProps<TOption>) => ReactNode;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

const SearchableSelectBase = forwardRef<
  HTMLDivElement,
  SearchableSelectProps<any, any>
>(function MwSearchableSelect(props, forwardedRef) {
  const {
    value: valueProp,
    modelValue,
    defaultValue = null,
    onValueChange,
    onChange,
    onShow,
    options = [],
    optionLabel,
    optionValue,
    inputId,
    id,
    name,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    placeholder,
    showClear = false,
    disabled: disabledProp,
    readonly: readonlyProp = false,
    readOnly = false,
    invalid: invalidProp,
    required: requiredProp,
    size,
    emptyMessage,
    renderOption,
    className,
    onMouseDown,
    onClick,
    ...restAttrs
  } = props;

  const formField = useFormFieldContext();
  const disabled = Boolean(disabledProp ?? formField.disabled ?? false);
  const invalid = Boolean(invalidProp ?? formField.invalid ?? false);
  const required = Boolean(requiredProp ?? formField.required ?? false);
  const resolvedInputId = inputId ?? formField.inputId;
  const isReadonly = Boolean(readonlyProp || readOnly);
  const isBlocked = disabled || isReadonly;

  const { t } = useUiLocale();

  const isControlled = valueProp !== undefined || modelValue !== undefined;
  const controlledValue = valueProp !== undefined ? valueProp : modelValue;
  const [uncontrolledValue, setUncontrolledValue] = useState<any>(
    () => defaultValue,
  );
  const currentValue = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mirrorRef = useRef<HTMLSpanElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const listScrollRef = useScrollFade<HTMLUListElement>({ size: "sm" });

  const [typing, setTyping] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [inputWidth, setInputWidth] = useState(0);

  const { open, panelStyle, openPanel, closePanel } = useComboPanel(
    rootRef,
    panelRef,
    {
      onClose: () => {
        setTyping(false);
        setQuery("");
        setActiveIndex(-1);
      },
    },
  );

  const generatedId = useId();
  const fieldId = resolvedInputId ?? id ?? `mw-ss-${generatedId}`;
  const listboxId = `${fieldId}-listbox`;
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const effectiveAriaLabel = ariaLabel ?? restAttrs["aria-label"];
  const effectiveAriaLabelledby = ariaLabelledby ?? restAttrs["aria-labelledby"];
  const effectiveAriaDescribedby = mergeDescribedBy(
    formField.describedBy,
    ariaDescribedby,
    restAttrs["aria-describedby"],
  );

  const emptyMessageText = emptyMessage ?? t("common.select.noMatch");

  const labelOf = useCallback(
    (option: Record<string, unknown>): string => {
      if (typeof optionLabel === "function") {
        return String(optionLabel(option) ?? "");
      }
      return String(option[optionLabel] ?? "");
    },
    [optionLabel],
  );

  const valueOf = useCallback(
    (option: Record<string, unknown>): unknown => {
      if (typeof optionValue === "function") {
        return optionValue(option);
      }
      return optionValue ? option[optionValue] : option;
    },
    [optionValue],
  );

  const sizeClass = useMemo(() => {
    if (size === "small" || size === "sm") return "mw-ss-sm";
    if (size === "large" || size === "lg") return "mw-ss-lg";
    return "mw-ss-md";
  }, [size]);

  const selectedOption = useMemo<Record<string, unknown> | null>(() => {
    if (currentValue === null || currentValue === undefined) return null;
    if (!optionValue) {
      return (currentValue as Record<string, unknown> | null) ?? null;
    }
    return options.find((o) => isSameValue(valueOf(o), currentValue)) ?? null;
  }, [currentValue, optionValue, options, valueOf]);

  const selectedLabel = selectedOption ? labelOf(selectedOption) : "";
  const filled = selectedOption !== null && selectedLabel !== "";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? options.filter((o) => labelOf(o).toLowerCase().includes(q))
      : [...options];
  }, [options, query, labelOf]);

  const inputValue = typing ? query : selectedLabel;
  const mirrorText = inputValue || placeholder || "";

  const measureMirror = useCallback(() => {
    if (!mirrorRef.current) return;
    const next = Math.ceil(mirrorRef.current.getBoundingClientRect().width) + 2;
    setInputWidth((prev) => (prev === next ? prev : next));
  }, []);

  useIsomorphicLayoutEffect(() => {
    measureMirror();
  }, [measureMirror, mirrorText]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const option =
      panelRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[
        activeIndex
      ];
    option?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex]);

  const commitValue = useCallback(
    (next: any) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
      onChange?.(next);
    },
    [isControlled, onValueChange, onChange],
  );

  const reveal = useCallback(() => {
    if (isBlocked || open) return;
    onShow?.();
    const initialIdx =
      currentValue === null || currentValue === undefined
        ? -1
        : filtered.findIndex((o) => isSameValue(valueOf(o), currentValue));
    setActiveIndex(initialIdx);
    openPanel();
  }, [isBlocked, open, onShow, currentValue, filtered, valueOf, openPanel]);

  const dismiss = useCallback(() => {
    closePanel();
    setTyping(false);
    setQuery("");
    setActiveIndex(-1);
  }, [closePanel]);

  const handleFocus = () => {
    if (isBlocked) return;
    reveal();
    queueMicrotask(() => {
      inputRef.current?.select();
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isBlocked) return;
    const nextQuery = event.target.value;
    setTyping(true);
    setQuery(nextQuery);
    if (!open) {
      onShow?.();
      openPanel();
    }
    const q = nextQuery.trim().toLowerCase();
    const nextFiltered = q
      ? options.filter((o) => labelOf(o).toLowerCase().includes(q))
      : options;
    setActiveIndex(nextFiltered.length ? 0 : -1);
  };

  const handleFieldMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    onMouseDown?.(event);
    if (event.defaultPrevented) return;
    if (open) {
      event.preventDefault();
      dismiss();
      inputRef.current?.blur();
    }
  };

  const handleFieldClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!open && !isBlocked) {
      inputRef.current?.focus();
    }
  };

  const selectOption = (option: Record<string, unknown>) => {
    if (isBlocked) return;
    commitValue(valueOf(option));
    dismiss();
    inputRef.current?.blur();
  };

  const handleClear = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isBlocked) return;
    commitValue(null);
    setTyping(false);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (isBlocked) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        reveal();
        return;
      }
      if (filtered.length) {
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        reveal();
        return;
      }
      if (filtered.length) {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    } else if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(filtered.length ? 0 : -1);
    } else if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(filtered.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (!open) {
        reveal();
        return;
      }
      const option = filtered[activeIndex] ?? filtered[0];
      if (option) selectOption(option);
    } else if (event.key === "Escape" && open) {
      event.stopPropagation();
      dismiss();
    }
  };

  return (
    <>
      <div
        {...restAttrs}
        ref={(node) => {
          rootRef.current = node;
          setMergedRef(forwardedRef, node);
        }}
      className={cx(
        "mw-ss",
        sizeClass,
        open && "mw-ss-focus",
        disabled && "mw-ss-disabled",
        invalid && "mw-ss-invalid",
        className,
      )}
      data-state={open ? "open" : "closed"}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      onMouseDown={handleFieldMouseDown}
      onClick={handleFieldClick}
    >
      <div className="mw-ss-field">
        <input
          id={fieldId}
          ref={inputRef}
          name={name}
          className={cx(
            "mw-ss-input",
            !filled && !typing && "mw-ss-placeholder",
          )}
          style={{ width: inputWidth ? `${inputWidth}px` : undefined }}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={isReadonly}
          required={required}
          aria-label={effectiveAriaLabel}
          aria-labelledby={effectiveAriaLabelledby}
          aria-describedby={effectiveAriaDescribedby}
          aria-invalid={invalid || undefined}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={
            open && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          role="combobox"
          type="text"
          autoComplete="off"
          spellCheck={false}
          onFocus={handleFocus}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <span ref={mirrorRef} className="mw-ss-mirror" aria-hidden="true">
          {mirrorText}
        </span>
      </div>

      {showClear && filled && !isBlocked && (
        <button
          type="button"
          className="mw-ss-clear"
          aria-label={t("common.select.clear")}
          onMouseDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onClick={handleClear}
        >
          <X aria-hidden="true" />
        </button>
      )}

      <span className="mw-ss-dropdown" aria-hidden="true">
        <ChevronDown aria-hidden="true" />
      </span>
    </div>

    {open &&
      typeof document !== "undefined" &&
      createPortal(
          <div
            ref={panelRef}
            className="mw-ss-overlay mw-frost mw-scroll-scope"
            style={panelStyle}
          >
            <ul
              id={listboxId}
              ref={listScrollRef}
              className="mw-ss-list mw-scroll"
              aria-label={effectiveAriaLabel}
              aria-labelledby={effectiveAriaLabelledby}
              role="listbox"
            >
              {filtered.map((option, i) => {
                const selected =
                  currentValue !== null &&
                  currentValue !== undefined &&
                  isSameValue(valueOf(option), currentValue);
                const active = i === activeIndex;
                const itemLabel = labelOf(option);

                return (
                  <li
                    key={`${String(valueOf(option))}-${i}`}
                    id={optionId(i)}
                    className={cx(
                      "mw-ss-option",
                      selected && "mw-ss-option-selected",
                      active && "mw-ss-option-active",
                    )}
                    aria-selected={selected}
                    data-state={selected ? "checked" : "unchecked"}
                    data-highlighted={active ? "" : undefined}
                    role="option"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectOption(option);
                    }}
                    onMouseMove={() => {
                      setActiveIndex(i);
                    }}
                  >
                    {renderOption
                      ? renderOption({
                          option,
                          label: itemLabel,
                          index: i,
                          selected,
                        })
                      : itemLabel}
                  </li>
                );
              })}

              {filtered.length === 0 && (
                <li className="mw-ss-empty">{emptyMessageText}</li>
              )}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
});

SearchableSelectBase.displayName = "MwSearchableSelect";

export type SearchableSelectComponent = (<
  TValue = unknown,
  TOption extends Record<string, unknown> = Record<string, unknown>,
>(
  props: SearchableSelectProps<TValue, TOption> & {
    ref?: Ref<HTMLDivElement>;
  },
) => ReactElement | null) & {
  displayName?: string;
};

export const SearchableSelect =
  SearchableSelectBase as unknown as SearchableSelectComponent;
SearchableSelect.displayName = "MwSearchableSelect";

export default SearchableSelect;
