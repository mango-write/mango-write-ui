import { ChevronDown, X } from "lucide-react";
import {
  Fragment,
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
  type FocusEvent,
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
import { measureMaxTextWidth } from "../lib/text-fit";
import { useComboPanel } from "../lib/useComboPanel";
import { useUiLocale } from "../locale";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";

export type SearchableMultiSelectSize = "small" | "large" | "sm" | "md" | "lg";

export interface SearchableMultiSelectChipProps<
  TOption = Record<string, unknown>,
> {
  option: TOption;
  label: string;
  index: number;
  remove: () => void;
}

export interface SearchableMultiSelectOptionProps<
  TOption = Record<string, unknown>,
> {
  option: TOption;
  label: string;
  index: number;
  selected: boolean;
}

export interface SearchableMultiSelectProps<
  TValue = unknown,
  TOption extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: TValue[];
  modelValue?: TValue[];
  defaultValue?: TValue[];
  onValueChange?: (value: TValue[]) => void;
  onChange?: (value: TValue[]) => void;
  onShow?: () => void;
  options: readonly TOption[];
  optionLabel: string | ((option: TOption) => string);
  optionValue?: string | ((option: TOption) => TValue);
  optionFilter?: (option: TOption, query: string) => boolean;
  inputId?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  size?: SearchableMultiSelectSize;
  emptyMessage?: string;
  renderChip?: (props: SearchableMultiSelectChipProps<TOption>) => ReactNode;
  renderOption?: (props: SearchableMultiSelectOptionProps<TOption>) => ReactNode;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const INPUT_MIN = 24;
const PLUS_RESERVE = 42;

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

const SearchableMultiSelectBase = forwardRef<
  HTMLDivElement,
  SearchableMultiSelectProps<any, any>
>(function MwSearchableMultiSelect(props, forwardedRef) {
  const {
    value: valueProp,
    modelValue,
    defaultValue = [],
    onValueChange,
    onChange,
    onShow,
    options = [],
    optionLabel,
    optionValue,
    optionFilter,
    inputId,
    id,
    name,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    placeholder,
    disabled: disabledProp,
    readonly: readonlyProp = false,
    readOnly = false,
    invalid: invalidProp,
    required: requiredProp,
    size,
    emptyMessage,
    renderChip,
    renderOption,
    className,
    style,
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
  const [uncontrolledValue, setUncontrolledValue] = useState<any[]>(
    () => defaultValue,
  );
  const currentValues: any[] = useMemo(() => {
    const raw = isControlled ? controlledValue : uncontrolledValue;
    return Array.isArray(raw) ? raw : [];
  }, [isControlled, controlledValue, uncontrolledValue]);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const listScrollRef = useScrollFade<HTMLUListElement>({ size: "sm" });

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fitTextWidth, setFitTextWidth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(currentValues.length);

  const { open, panelStyle, openPanel, closePanel, reposition } = useComboPanel(
    rootRef,
    panelRef,
    {
      onClose: () => {
        setQuery("");
        setActiveIndex(-1);
      },
    },
  );

  const generatedId = useId();
  const fieldId = resolvedInputId ?? id ?? `mw-ms-${generatedId}`;
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

  const isSelected = useCallback(
    (option: Record<string, unknown>): boolean => {
      const target = valueOf(option);
      return currentValues.some((item) => isSameValue(item, target));
    },
    [currentValues, valueOf],
  );

  const sizeClass = useMemo(() => {
    if (size === "small" || size === "sm") return "mw-ms-sm";
    if (size === "large" || size === "lg") return "mw-ms-lg";
    return "mw-ms-md";
  }, [size]);

  const selectedOptions = useMemo(
    () => options.filter((o) => isSelected(o)),
    [options, isSelected],
  );
  const selectedLabels = useMemo(
    () => selectedOptions.map((o) => labelOf(o)),
    [selectedOptions, labelOf],
  );
  const hasSelection = selectedLabels.length > 0;

  const measureFitWidth = useCallback(() => {
    const texts = options.map((o) => labelOf(o));
    if (placeholder) texts.push(placeholder);
    const measured = measureMaxTextWidth(inputRef.current, texts);
    setFitTextWidth((prev) => (prev === measured ? prev : measured));
  }, [options, labelOf, placeholder]);

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

  const recalc = useCallback(() => {
    const total = selectedLabels.length;
    if (total === 0) {
      setVisibleCount((prev) => (prev === 0 ? prev : 0));
      return;
    }
    const label = labelRef.current;
    const measure = measureRef.current;
    if (!label || !measure) {
      setVisibleCount((prev) => (prev === total ? prev : total));
      return;
    }
    const cs = getComputedStyle(label);
    const gap = parseFloat(cs.columnGap || cs.gap || "0") || 0;
    const padX =
      parseFloat(cs.paddingLeft || "0") + parseFloat(cs.paddingRight || "0");
    const avail = label.clientWidth - padX;
    const widths = Array.from(measure.children).map(
      (el) => (el as HTMLElement).offsetWidth,
    );

    const totalWidth = widths.reduce((a, w) => a + w, 0) + gap * (total - 1);
    if (totalWidth + gap + INPUT_MIN <= avail) {
      setVisibleCount((prev) => (prev === total ? prev : total));
      return;
    }
    let used = 0;
    let count = 0;
    for (let i = 0; i < total; i += 1) {
      const add = (count > 0 ? gap : 0) + (widths[i] ?? 0);
      if (used + add + gap + PLUS_RESERVE + INPUT_MIN <= avail) {
        used += add;
        count += 1;
      } else {
        break;
      }
    }
    const next = Math.max(count, 1);
    setVisibleCount((prev) => (prev === next ? prev : next));
  }, [selectedLabels.length]);

  useIsomorphicLayoutEffect(() => {
    recalc();
  }, [recalc, selectedLabels]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined" || !rootRef.current) return;
    const ro = new ResizeObserver(() => recalc());
    ro.observe(rootRef.current);
    return () => {
      ro.disconnect();
    };
  }, [recalc]);

  const clampedVisibleCount = Math.min(visibleCount, selectedOptions.length);
  const visibleOptions = useMemo(
    () => selectedOptions.slice(0, clampedVisibleCount),
    [selectedOptions, clampedVisibleCount],
  );
  const overflowCount = selectedLabels.length - visibleOptions.length;

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return optionFilter
      ? options.filter((o) => optionFilter(o, q))
      : options.filter((o) => labelOf(o).toLowerCase().includes(q));
  }, [options, query, optionFilter, labelOf]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const option =
      panelRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[
        activeIndex
      ];
    option?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex]);

  const commitValues = useCallback(
    (next: any[]) => {
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
    setActiveIndex(filteredOptions.length ? 0 : -1);
    openPanel();
    queueMicrotask(() => {
      inputRef.current?.focus();
    });
  }, [isBlocked, open, onShow, filteredOptions.length, openPanel]);

  const dismiss = useCallback(() => {
    closePanel();
    setQuery("");
    setActiveIndex(-1);
  }, [closePanel]);

  const handleBlur = (_event: FocusEvent<HTMLInputElement>) => {
    setQuery("");
    if (labelRef.current) {
      labelRef.current.scrollLeft = 0;
    }
    queueMicrotask(() => recalc());
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isBlocked) return;
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    if (!open) {
      onShow?.();
      openPanel();
    }
    const q = nextQuery.trim().toLowerCase();
    const nextFiltered = !q
      ? options
      : optionFilter
        ? options.filter((o) => optionFilter(o, q))
        : options.filter((o) => labelOf(o).toLowerCase().includes(q));
    setActiveIndex(nextFiltered.length ? 0 : -1);
  };

  const handleFieldMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    onMouseDown?.(event);
    if (event.defaultPrevented) return;
    const target = event.target as HTMLElement | null;
    if (
      open &&
      target &&
      (target === rootRef.current ||
        target === labelRef.current ||
        Boolean(target.closest(".mw-ms-dropdown")))
    ) {
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

  const toggleOption = useCallback(
    (option: Record<string, unknown>) => {
      if (isBlocked) return;
      const v = valueOf(option);
      const exists = currentValues.some((item) => isSameValue(item, v));
      const next = exists
        ? currentValues.filter((item) => !isSameValue(item, v))
        : [...currentValues, v];
      commitValues(next);
      setQuery("");
      queueMicrotask(() => {
        inputRef.current?.focus();
        reposition();
      });
    },
    [isBlocked, valueOf, currentValues, commitValues, reposition],
  );

  const removeAt = useCallback(
    (index: number) => {
      if (isBlocked) return;
      const option = selectedOptions[index];
      if (!option) return;
      const v = valueOf(option);
      commitValues(currentValues.filter((item) => !isSameValue(item, v)));
    },
    [isBlocked, selectedOptions, valueOf, commitValues, currentValues],
  );

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (isBlocked) return;
    if (event.key === "Backspace") {
      if (query.length === 0 && currentValues.length > 0) {
        commitValues(currentValues.slice(0, -1));
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        reveal();
        return;
      }
      if (filteredOptions.length) {
        setActiveIndex((prev) =>
          Math.min(prev + 1, filteredOptions.length - 1),
        );
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        reveal();
        return;
      }
      if (filteredOptions.length) {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    } else if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(filteredOptions.length ? 0 : -1);
    } else if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(filteredOptions.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (!open) {
        reveal();
        return;
      }
      const option = filteredOptions[activeIndex] ?? filteredOptions[0];
      if (option) toggleOption(option);
    } else if (event.key === "Escape" && open) {
      event.stopPropagation();
      dismiss();
    }
  };

  const rootStyle: CSSProperties = {
    ...style,
    "--mw-ms-fit-text": `${fitTextWidth}px`,
  } as CSSProperties;

  return (
    <>
      <div
        {...restAttrs}
        ref={(node) => {
          rootRef.current = node;
          setMergedRef(forwardedRef, node);
        }}
      className={cx(
        "mw-ms",
        sizeClass,
        open && "mw-ms-focus",
        disabled && "mw-ms-disabled",
        invalid && "mw-ms-invalid",
        className,
      )}
      style={rootStyle}
      data-state={open ? "open" : "closed"}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      onMouseDown={handleFieldMouseDown}
      onClick={handleFieldClick}
    >
      <div ref={labelRef} className="mw-ms-label">
        {visibleOptions.map((o, i) => {
          const itemLabel = labelOf(o);
          const key = `${String(valueOf(o))}-${i}`;
          if (renderChip) {
            return (
              <Fragment key={key}>
                {renderChip({
                  option: o,
                  label: itemLabel,
                  index: i,
                  remove: () => removeAt(i),
                })}
              </Fragment>
            );
          }
          return (
            <span key={key} className="mw-ms-chip">
              <span className="mw-ms-chip-label">{itemLabel}</span>
              {!isBlocked && (
                <button
                  type="button"
                  className="mw-ms-chip-remove"
                  aria-label={t("common.select.remove", { label: itemLabel })}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeAt(i);
                  }}
                >
                  <X aria-hidden="true" />
                </button>
              )}
            </span>
          );
        })}

        {overflowCount > 0 && (
          <span className="mw-ms-chip mw-ms-chip-more">+{overflowCount}</span>
        )}

        <input
          id={fieldId}
          ref={inputRef}
          name={name}
          value={query}
          className="mw-ms-input"
          placeholder={hasSelection ? "" : placeholder}
          disabled={disabled}
          readOnly={isReadonly}
          aria-label={effectiveAriaLabel}
          aria-labelledby={effectiveAriaLabelledby}
          aria-describedby={effectiveAriaDescribedby}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
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
          onFocus={reveal}
          onBlur={handleBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div ref={measureRef} className="mw-ms-measure" aria-hidden="true">
        {selectedOptions.map((o, i) => {
          const itemLabel = labelOf(o);
          const key = `${String(valueOf(o))}-${i}`;
          if (renderChip) {
            return (
              <span key={key} style={{ display: "inline-flex" }}>
                {renderChip({
                  option: o,
                  label: itemLabel,
                  index: i,
                  remove: () => {},
                })}
              </span>
            );
          }
          return (
            <span key={key} className="mw-ms-chip">
              <span className="mw-ms-chip-label">{itemLabel}</span>
              <X className="mw-ms-chip-remove" aria-hidden="true" />
            </span>
          );
        })}
      </div>

      <span className="mw-ms-dropdown" aria-hidden="true">
        <ChevronDown aria-hidden="true" />
      </span>
    </div>

    {open &&
      typeof document !== "undefined" &&
      createPortal(
          <div
            ref={panelRef}
            className="mw-ms-overlay mw-frost mw-scroll-scope"
            style={panelStyle}
          >
            <ul
              id={listboxId}
              ref={listScrollRef}
              className="mw-ms-list mw-scroll"
              aria-label={effectiveAriaLabel}
              aria-labelledby={effectiveAriaLabelledby}
              aria-multiselectable="true"
              role="listbox"
            >
              {filteredOptions.map((option, i) => {
                const selected = isSelected(option);
                const active = i === activeIndex;
                const itemLabel = labelOf(option);
                return (
                  <li
                    key={`${String(valueOf(option))}-${i}`}
                    id={optionId(i)}
                    className={cx(
                      "mw-ms-option",
                      selected && "mw-ms-option-selected",
                      active && "mw-ms-option-active",
                    )}
                    aria-selected={selected}
                    data-state={selected ? "checked" : "unchecked"}
                    data-highlighted={active ? "" : undefined}
                    role="option"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      toggleOption(option);
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

              {filteredOptions.length === 0 && (
                <li className="mw-ms-empty">{emptyMessageText}</li>
              )}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
});

SearchableMultiSelectBase.displayName = "MwSearchableMultiSelect";

export type SearchableMultiSelectComponent = (<
  TValue = unknown,
  TOption extends Record<string, unknown> = Record<string, unknown>,
>(
  props: SearchableMultiSelectProps<TValue, TOption> & {
    ref?: Ref<HTMLDivElement>;
  },
) => ReactElement | null) & {
  displayName?: string;
};

export const SearchableMultiSelect =
  SearchableMultiSelectBase as unknown as SearchableMultiSelectComponent;
SearchableMultiSelect.displayName = "MwSearchableMultiSelect";

export default SearchableMultiSelect;
