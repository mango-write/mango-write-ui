import { ChevronDown, LoaderCircle, X } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { useScrollFade } from "../lib/scroll-fade";
import { useComboPanel } from "../lib/useComboPanel";
import { useUiLocale } from "../locale";
import type {
  AsyncSearchOption,
  AsyncSearchSelectOptionSlotProps,
  AsyncSearchSelectProps,
} from "./async-search-select";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";

export type {
  AsyncSearchOption,
  AsyncSearchSelectOptionSlotProps,
  AsyncSearchSelectProps,
};

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

const EMPTY_EXCLUDE: readonly string[] = [];

export const AsyncSearchSelect = forwardRef<
  HTMLDivElement,
  AsyncSearchSelectProps
>(function MwAsyncSearchSelect(props, forwardedRef) {
  const {
    value: valueProp,
    modelValue,
    defaultValue = null,
    onValueChange,
    onChange,
    onSelect,
    search,
    inputId,
    id,
    name,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    placeholder,
    emptyMessage,
    loadingMessage,
    errorMessage,
    retryLabel,
    showClear = true,
    disabled: disabledProp,
    readonly: readonlyProp = false,
    readOnly = false,
    invalid: invalidProp,
    required: requiredProp,
    fluid = false,
    debounceMs = 250,
    excludeValues = EMPTY_EXCLUDE,
    initialOption,
    renderOption,
    className,
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
  const emptyMessageText = emptyMessage ?? t("common.select.noMatch");
  const loadingMessageText = loadingMessage ?? t("common.select.searching");
  const errorMessageText = errorMessage ?? t("common.async.errorTitle");
  const retryLabelText = retryLabel ?? t("common.async.retry");

  const isControlled = valueProp !== undefined || modelValue !== undefined;
  const controlledValue = valueProp !== undefined ? valueProp : modelValue;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(
    () => defaultValue,
  );
  const currentValue = isControlled
    ? (controlledValue ?? null)
    : uncontrolledValue;

  const generatedId = useId();
  const fieldId = resolvedInputId ?? id ?? `mw-ass-${generatedId}`;
  const listboxId = `${fieldId}_list`;
  const optionId = (index: number) => `${fieldId}_${index}`;

  const effectiveAriaLabel = ariaLabel ?? restAttrs["aria-label"];
  const effectiveAriaLabelledby =
    ariaLabelledby ?? restAttrs["aria-labelledby"];
  const effectiveAriaDescribedby = mergeDescribedBy(
    formField.describedBy,
    ariaDescribedby,
    restAttrs["aria-describedby"],
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const listContainerScrollRef = useScrollFade<HTMLDivElement>({ size: "sm" });

  const seenOptionsRef = useRef<Map<string, AsyncSearchOption>>(new Map());
  const seqRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef("");
  const currentValueRef = useRef(currentValue);
  currentValueRef.current = currentValue;
  const searchRef = useRef(search);
  searchRef.current = search;
  const excludeValuesRef = useRef(excludeValues);
  excludeValuesRef.current = excludeValues;

  if (currentValue) {
    if (initialOption?.value === currentValue) {
      seenOptionsRef.current.set(currentValue, initialOption);
    } else if (!seenOptionsRef.current.has(currentValue)) {
      seenOptionsRef.current.set(currentValue, {
        value: currentValue,
        label: currentValue,
      });
    }
  }

  const [draftQuery, setDraftQuery] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rawResults, setRawResults] = useState<AsyncSearchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [, setSeenTick] = useState(0);

  const clearDebounce = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const handleDismiss = useCallback(() => {
    clearDebounce();
    setDraftQuery(null);
  }, [clearDebounce]);

  const { open, panelStyle, openPanel, closePanel, reposition } = useComboPanel(
    rootRef,
    panelRef,
    {
      onClose: () => {
        setActiveIndex(-1);
        handleDismiss();
      },
    },
  );

  useEffect(() => {
    return () => {
      clearDebounce();
      seqRef.current += 1;
    };
  }, [clearDebounce]);

  useEffect(() => {
    setDraftQuery(null);
  }, [currentValue, initialOption]);

  const resolvedSelectedOption = useMemo<AsyncSearchOption | null>(() => {
    if (!currentValue) return null;
    if (initialOption?.value === currentValue) {
      seenOptionsRef.current.set(currentValue, initialOption);
      return initialOption;
    }
    return (
      seenOptionsRef.current.get(currentValue) ?? {
        value: currentValue,
        label: currentValue,
      }
    );
  }, [currentValue, initialOption, rawResults]);

  const displayValue =
    draftQuery !== null ? draftQuery : (resolvedSelectedOption?.label ?? "");

  const suggestions = useMemo(
    () => rawResults.filter((o) => !excludeValues.includes(o.value)),
    [rawResults, excludeValues],
  );

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const items = panelRef.current?.querySelectorAll<HTMLElement>(
      '[role="option"]:not(.mw-ass-empty)',
    );
    items?.[activeIndex]?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex]);

  const commitValue = useCallback(
    (nextVal: string | null, option: AsyncSearchOption | null) => {
      if (!isControlled) {
        setUncontrolledValue(nextVal);
      }
      onValueChange?.(nextVal);
      onChange?.(nextVal);
      onSelect?.(option);
    },
    [isControlled, onValueChange, onChange, onSelect],
  );

  const runSearch = useCallback(
    async (query: string) => {
      const current = ++seqRef.current;
      lastQueryRef.current = query;
      setLoading(true);
      setHasError(false);
      try {
        const items = await searchRef.current(query);
        if (current !== seqRef.current) return;
        for (const option of items) {
          seenOptionsRef.current.set(option.value, option);
        }
        setSeenTick((n) => n + 1);
        setRawResults([...items]);
        setHasError(false);
        openPanel();
        const visibleItems = items.filter(
          (o) => !excludeValuesRef.current.includes(o.value),
        );
        setActiveIndex(visibleItems.length > 0 ? 0 : -1);
        queueMicrotask(() => reposition());
      } catch {
        if (current !== seqRef.current) return;
        setRawResults([]);
        setHasError(true);
        openPanel();
        setActiveIndex(-1);
        queueMicrotask(() => reposition());
      } finally {
        if (current === seqRef.current) {
          setLoading(false);
        }
      }
    },
    [openPanel, reposition],
  );

  const handleFocus = () => {
    if (isBlocked) return;
    setFocused(true);
    if (!open && !loading) {
      void runSearch("");
    }
  };

  const handleBlur = () => {
    setFocused(false);
    handleDismiss();
  };

  const handleRootClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isBlocked) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest(".mw-ass-dropdown, .mw-ass-clear")) return;
    inputRef.current?.focus();
    if (!open && !loading) {
      void runSearch("");
    }
  };

  const handleDropdownClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isBlocked) return;
    if (open) {
      closePanel();
    } else {
      inputRef.current?.focus();
      if (!loading) {
        void runSearch("");
      }
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isBlocked) return;
    const val = event.target.value;
    clearDebounce();
    if (val === "") {
      closePanel();
      setDraftQuery(null);
      return;
    }
    setDraftQuery(val);
    if (debounceMs <= 0) {
      void runSearch(val);
    } else {
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        void runSearch(val);
      }, debounceMs);
    }
  };

  const selectOption = (option: AsyncSearchOption) => {
    if (isBlocked) return;
    clearDebounce();
    seenOptionsRef.current.set(option.value, option);
    setDraftQuery(null);
    closePanel();
    commitValue(option.value, option);
  };

  const handleClearClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isBlocked) return;
    clearDebounce();
    seqRef.current += 1;
    setLoading(false);
    setHasError(false);
    setRawResults([]);
    setDraftQuery(null);
    setActiveIndex(-1);
    closePanel();
    if (currentValue !== null) {
      commitValue(null, null);
    }
    void runSearch("");
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (isBlocked) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        if (!loading) void runSearch("");
        return;
      }
      if (suggestions.length > 0) {
        setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        if (!loading) void runSearch("");
        return;
      }
      if (suggestions.length > 0) {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    } else if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(suggestions.length > 0 ? 0 : -1);
    } else if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(suggestions.length - 1);
    } else if (event.key === "Enter") {
      if (!open) return;
      event.preventDefault();
      const option = suggestions[activeIndex] ?? suggestions[0];
      if (option) selectOption(option);
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        event.stopPropagation();
        closePanel();
      }
      handleDismiss();
    }
  };

  const showClearButton =
    showClear &&
    !isBlocked &&
    (currentValue !== null || draftQuery !== null);

  return (
    <>
      <div
        {...restAttrs}
        ref={(node) => {
          rootRef.current = node;
          setMergedRef(forwardedRef, node);
        }}
      className={cx(
        "mw-ass",
        "mw-control",
        fluid && "mw-ass--fluid",
        disabled && "mw-ass--disabled",
        (open || focused) && "mw-ass--open",
        className,
      )}
      data-state={open ? "open" : "closed"}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      onClick={handleRootClick}
    >
      <input
        id={fieldId}
        ref={inputRef}
        name={name}
        type="text"
        role="combobox"
        className="mw-ass-input mw-input"
        value={displayValue}
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
        autoComplete="off"
        spellCheck={false}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />

      {loading && (
        <LoaderCircle
          className="mw-ass-loader mw-icon--spin"
          aria-hidden="true"
        />
      )}

      {showClearButton && (
        <button
          type="button"
          className="mw-ass-clear"
          aria-label={t("common.select.clear")}
          onMouseDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onClick={handleClearClick}
        >
          <X aria-hidden="true" />
        </button>
      )}

      <button
        type="button"
        className="mw-ass-dropdown"
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        onMouseDown={(event) => {
          event.stopPropagation();
          event.preventDefault();
        }}
        onClick={handleDropdownClick}
      >
        <ChevronDown aria-hidden="true" />
      </button>
    </div>

    {open &&
      typeof document !== "undefined" &&
      createPortal(
          <div
            ref={panelRef}
            className="mw-ass-overlay mw-frost mw-glass"
            style={panelStyle}
            onMouseDown={(event) => event.preventDefault()}
          >
            <div
              ref={listContainerScrollRef}
              className="mw-ass-list-container mw-scroll"
            >
              <ul
                id={listboxId}
                role="listbox"
                className="mw-ass-list"
                aria-label={effectiveAriaLabel}
                aria-labelledby={effectiveAriaLabelledby}
              >
                {suggestions.map((option, i) => {
                  const isOptSelected = option.value === currentValue;
                  const highlighted = i === activeIndex;
                  return (
                    <li
                      key={option.value}
                      id={optionId(i)}
                      role="option"
                      className={cx(
                        "mw-ass-option",
                        isOptSelected && "mw-ass-option--selected",
                        highlighted && "mw-ass-option--highlighted",
                      )}
                      aria-selected={isOptSelected}
                      data-highlighted={highlighted ? "" : undefined}
                      data-state={isOptSelected ? "checked" : "unchecked"}
                      onMouseMove={() => setActiveIndex(i)}
                      onClick={() => selectOption(option)}
                    >
                      {renderOption ? (
                        renderOption({
                          option,
                          selected: isOptSelected,
                          index: i,
                        })
                      ) : (
                        <span className="mw-ass-option-body">
                          {option.avatar && (
                            <img
                              className="mw-ass-avatar"
                              src={option.avatar}
                              alt=""
                            />
                          )}
                          <span className="mw-ass-option-text">
                            <span className="mw-ass-option-label">
                              {option.label}
                            </span>
                            {option.description && (
                              <span className="mw-ass-option-desc">
                                {option.description}
                              </span>
                            )}
                          </span>
                        </span>
                      )}
                    </li>
                  );
                })}

                {suggestions.length === 0 && (
                  <li role="option" className="mw-ass-empty">
                    {loading ? (
                      <span className="mw-ass-note">{loadingMessageText}</span>
                    ) : hasError ? (
                      <span className="mw-ass-option-body">
                        <span className="mw-ass-note mw-ass-error">
                          {errorMessageText}
                        </span>
                        <button
                          type="button"
                          className="mw-btn mw-btn--xs mw-btn--text mw-ass-retry"
                          onMouseDown={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                            void runSearch(lastQueryRef.current);
                          }}
                        >
                          {retryLabelText}
                        </button>
                      </span>
                    ) : (
                      <span className="mw-ass-note">{emptyMessageText}</span>
                    )}
                  </li>
                )}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
});

AsyncSearchSelect.displayName = "MwAsyncSearchSelect";

export default AsyncSearchSelect;
