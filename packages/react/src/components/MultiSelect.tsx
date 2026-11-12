import { Check, ChevronDown, X } from "lucide-react";
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
import { createPortal } from "react-dom";
import {
  isSameValue,
  resolveOptionDisabled,
  resolveOptionLabel as coreResolveOptionLabel,
  resolveOptionValue,
} from "@mango-write/ui-core/headless/option-accessor";
import { useScrollFade } from "../lib/scroll-fade";
import { Tooltip } from "../lib/tooltip";
import { useComboPanel } from "../lib/useComboPanel";
import { useUiLocale } from "../locale";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";
import type {
  MultiSelectChangeEvent,
  MultiSelectDisplay,
  MultiSelectOptionAccessor,
  MultiSelectOptionSlotProps,
  MultiSelectProps,
  MultiSelectSize,
  MultiSelectValueSlotProps,
} from "./multi-select";

export type {
  MultiSelectChangeEvent,
  MultiSelectDisplay,
  MultiSelectOptionAccessor,
  MultiSelectOptionSlotProps,
  MultiSelectProps,
  MultiSelectSize,
  MultiSelectValueSlotProps,
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

function resolveMsOptionLabel(
  option: any,
  optionLabel?: MultiSelectOptionAccessor<any, string>,
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

const MultiSelectBase = forwardRef<HTMLDivElement, MultiSelectProps<any>>(
  function MwMultiSelect(props, forwardedRef) {
    const {
      value: valueProp,
      modelValue,
      defaultValue = [],
      onValueChange,
      onChange,
      onShow,
      onHide,
      options = [],
      optionLabel,
      optionValue,
      optionDisabled,
      placeholder,
      display = "comma",
      maxSelectedLabels = 3,
      selectedItemsLabel = "{0} items selected",
      filter = false,
      filterPlaceholder,
      emptyMessage,
      emptyFilterMessage,
      showClear = false,
      showToggleAll = false,
      disabled: disabledProp,
      readonly: readonlyProp = false,
      readOnly = false,
      required: requiredProp,
      invalid: invalidProp,
      fluid = false,
      size = "md",
      ariaLabel,
      ariaLabelledby,
      ariaDescribedby,
      inputId,
      id,
      name,
      scrollHeight = "15rem",
      header,
      footer,
      empty,
      renderValue,
      renderOption,
      className,
      style,
      onClick,
      onKeyDown,
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
    const [uncontrolledValue, setUncontrolledValue] = useState<any[]>(() =>
      Array.isArray(defaultValue) ? defaultValue : [],
    );
    const currentValues: any[] = useMemo(() => {
      const raw = isControlled ? controlledValue : uncontrolledValue;
      return Array.isArray(raw) ? raw : [];
    }, [isControlled, controlledValue, uncontrolledValue]);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const filterInputRef = useRef<HTMLInputElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);
    const labelRef = useRef<HTMLDivElement | null>(null);
    const measureRef = useRef<HTMLDivElement | null>(null);
    const listContainerScrollRef = useScrollFade<HTMLDivElement>({ size: "sm" });

    const [filterQuery, setFilterQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);
    const [fitWidthPx, setFitWidthPx] = useState<number | null>(null);
    const [visibleCount, setVisibleCount] = useState(currentValues.length);

    const onHideRef = useRef(onHide);
    onHideRef.current = onHide;

    const { open, panelStyle, openPanel, closePanel, reposition } =
      useComboPanel(rootRef, panelRef, {
        onClose: () => {
          setFilterQuery("");
          setActiveIndex(-1);
          onHideRef.current?.();
        },
      });

    const generatedId = useId();
    const baseId = resolvedInputId ?? id ?? `mw-multiselect-${generatedId}`;
    const listboxId = `${baseId}-listbox`;
    const optionId = (index: number) => `${listboxId}-option-${index}`;

    const effectiveAriaLabel = ariaLabel ?? restAttrs["aria-label"];
    const effectiveAriaLabelledby =
      ariaLabelledby ?? restAttrs["aria-labelledby"];
    const effectiveAriaDescribedby = mergeDescribedBy(
      formField.describedBy,
      ariaDescribedby,
      restAttrs["aria-describedby"],
    );

    const normalizedSize: "sm" | "md" | "lg" = useMemo(() => {
      if (size === "sm" || size === "small") return "sm";
      if (size === "lg" || size === "large") return "lg";
      return "md";
    }, [size]);

    const getOptionLabel = useCallback(
      (opt: any) => resolveMsOptionLabel(opt, optionLabel),
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
    const isValueSelected = useCallback(
      (val: any) => currentValues.some((v) => isSameValue(v, val)),
      [currentValues],
    );
    const isOptionSelected = useCallback(
      (opt: any) => isValueSelected(getOptionValue(opt)),
      [isValueSelected, getOptionValue],
    );

    const selectedItems = useMemo(() => {
      return currentValues.map((val) => {
        const matched = options.find((opt) =>
          isSameValue(getOptionValue(opt), val),
        );
        return {
          value: val,
          option: matched,
          label:
            matched !== undefined ? getOptionLabel(matched) : String(val ?? ""),
        };
      });
    }, [currentValues, options, getOptionValue, getOptionLabel]);

    const hasSelection = currentValues.length > 0;
    const exceedsMaxLabels =
      maxSelectedLabels !== undefined &&
      maxSelectedLabels >= 0 &&
      currentValues.length > maxSelectedLabels;

    const summaryText = useMemo(() => {
      if (!hasSelection) return "";
      if (exceedsMaxLabels) {
        const count = String(currentValues.length);
        return (selectedItemsLabel || "{0} items selected")
          .replace(/\{0\}/g, count)
          .replace(/\{count\}/g, count);
      }
      return selectedItems.map((item) => item.label).join(", ");
    }, [
      hasSelection,
      exceedsMaxLabels,
      currentValues.length,
      selectedItemsLabel,
      selectedItems,
    ]);

    const recalc = useCallback(() => {
      const total = selectedItems.length;
      const label = labelRef.current;
      const measure = measureRef.current;
      const root = rootRef.current;
      if (
        display !== "chip" ||
        Boolean(renderValue) ||
        total === 0 ||
        !label ||
        !measure ||
        !root
      ) {
        setFitWidthPx((prev) => (prev === null ? prev : null));
        setVisibleCount((prev) => (prev === total ? prev : total));
        return;
      }

      const cs = getComputedStyle(label);
      const gap = parseFloat(cs.columnGap || cs.gap || "0") || 0;
      const padX =
        parseFloat(cs.paddingLeft || "0") + parseFloat(cs.paddingRight || "0");
      const widths = Array.from(measure.children).map(
        (el) => (el as HTMLElement).getBoundingClientRect().width,
      );
      const chipsWidth =
        widths.reduce((a, w) => a + w, 0) + gap * Math.max(total - 1, 0);
      const chrome =
        root.getBoundingClientRect().width -
        label.getBoundingClientRect().width;
      const nextFit = Math.ceil(chipsWidth + padX + chrome);
      setFitWidthPx((prev) => (prev === nextFit ? prev : nextFit));

      const avail = label.getBoundingClientRect().width - padX;
      if (chipsWidth <= avail + 1 || avail <= 0) {
        setVisibleCount((prev) => (prev === total ? prev : total));
        return;
      }
      let used = 0;
      let count = 0;
      for (let i = 0; i < total; i += 1) {
        const add = (count > 0 ? gap : 0) + (widths[i] ?? 0);
        if (used + add + gap + PLUS_RESERVE <= avail) {
          used += add;
          count += 1;
        } else {
          break;
        }
      }
      const nextCount = Math.max(count, 1);
      setVisibleCount((prev) => (prev === nextCount ? prev : nextCount));
    }, [selectedItems.length, display, renderValue]);

    useIsomorphicLayoutEffect(() => {
      recalc();
    }, [recalc, selectedItems, display]);

    useEffect(() => {
      let cancelled = false;
      const ro =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => recalc())
          : null;
      if (rootRef.current && ro) {
        ro.observe(rootRef.current);
      }
      if (typeof document !== "undefined" && document.fonts?.ready) {
        document.fonts.ready
          .then(() => {
            if (!cancelled) recalc();
          })
          .catch(() => {});
      }
      return () => {
        cancelled = true;
        ro?.disconnect();
      };
    }, [recalc]);

    const clampedVisibleCount = Math.min(visibleCount, selectedItems.length);
    const visibleItems = useMemo(
      () => selectedItems.slice(0, clampedVisibleCount),
      [selectedItems, clampedVisibleCount],
    );
    const overflowCount = selectedItems.length - visibleItems.length;
    const overflowTip = useMemo(
      () =>
        selectedItems
          .slice(clampedVisibleCount)
          .map((item) => item.label)
          .join(", "),
      [selectedItems, clampedVisibleCount],
    );

    const filteredOptions = useMemo(() => {
      if (!filter) return options;
      const q = filterQuery.trim().toLowerCase();
      if (!q) return options;
      return options.filter((opt) =>
        getOptionLabel(opt).toLowerCase().includes(q),
      );
    }, [options, filter, filterQuery, getOptionLabel]);

    const enabledFilteredOptions = useMemo(
      () => filteredOptions.filter((opt) => !isOptionDisabled(opt)),
      [filteredOptions, isOptionDisabled],
    );

    const allFilteredSelected = useMemo(() => {
      if (enabledFilteredOptions.length === 0) return false;
      return enabledFilteredOptions.every((opt) => isOptionSelected(opt));
    }, [enabledFilteredOptions, isOptionSelected]);

    const emptyText = useMemo(() => {
      if (filterQuery.trim()) {
        return emptyFilterMessage ?? emptyMessage ?? t("common.select.noMatch");
      }
      return emptyMessage ?? t("common.select.empty");
    }, [filterQuery, emptyFilterMessage, emptyMessage, t]);

    const showClearButton = showClear && hasSelection && !isBlocked;

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
          if (idx < 0 || idx >= len) return current;
          if (!isOptionDisabled(list[idx])) return idx;
        }
        return current;
      },
      [isOptionDisabled],
    );

    useEffect(() => {
      if (!open || activeIndex < 0) return;
      const item =
        listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[
          activeIndex
        ];
      item?.scrollIntoView?.({ block: "nearest" });
    }, [open, activeIndex]);

    const reveal = useCallback(() => {
      if (isBlocked || open) return;
      setFilterQuery("");
      setActiveIndex(findEdgeEnabledIndex(options, "first"));
      openPanel();
      onShow?.();
      queueMicrotask(() => {
        if (filter) {
          filterInputRef.current?.focus();
        }
      });
    }, [isBlocked, open, findEdgeEnabledIndex, options, openPanel, onShow, filter]);

    const dismiss = useCallback(
      (restoreFocus = false) => {
        if (!open) return;
        closePanel();
        if (restoreFocus) {
          queueMicrotask(() => rootRef.current?.focus());
        }
      },
      [open, closePanel],
    );

    const commitValues = useCallback(
      (nextValues: any[], originalEvent: Event) => {
        if (!isControlled) {
          setUncontrolledValue(nextValues);
        }
        onValueChange?.(nextValues);
        onChange?.({ originalEvent, value: nextValues });
        queueMicrotask(() => {
          if (open) reposition();
        });
      },
      [isControlled, onValueChange, onChange, open, reposition],
    );

    const toggleOption = useCallback(
      (option: any, originalEvent: Event) => {
        if (isBlocked || isOptionDisabled(option)) return;
        const val = getOptionValue(option);
        const exists = isValueSelected(val);
        const next = exists
          ? currentValues.filter((v) => !isSameValue(v, val))
          : [...currentValues, val];
        commitValues(next, originalEvent);
      },
      [
        isBlocked,
        isOptionDisabled,
        getOptionValue,
        isValueSelected,
        currentValues,
        commitValues,
      ],
    );

    const removeValue = (val: any, event: ReactMouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (isBlocked) return;
      const next = currentValues.filter((v) => !isSameValue(v, val));
      commitValues(next, event.nativeEvent);
    };

    const clearSelection = (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (isBlocked) return;
      commitValues([], event.nativeEvent);
    };

    const toggleAll = (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (isBlocked) return;
      const enabledVals = enabledFilteredOptions.map((opt) =>
        getOptionValue(opt),
      );
      if (allFilteredSelected) {
        const next = currentValues.filter(
          (v) => !enabledVals.some((ev) => isSameValue(ev, v)),
        );
        commitValues(next, event.nativeEvent);
      } else {
        const next = [...currentValues];
        for (const ev of enabledVals) {
          if (!next.some((v) => isSameValue(v, ev))) {
            next.push(ev);
          }
        }
        commitValues(next, event.nativeEvent);
      }
    };

    const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
      const nextQuery = event.target.value;
      setFilterQuery(nextQuery);
      const nextList = !nextQuery.trim()
        ? options
        : options.filter((opt) =>
            getOptionLabel(opt)
              .toLowerCase()
              .includes(nextQuery.trim().toLowerCase()),
          );
      setActiveIndex(findEdgeEnabledIndex(nextList, "first"));
    };

    const handleNavigationKeydown = (
      event: ReactKeyboardEvent<HTMLElement>,
      fromFilter = false,
    ) => {
      if (isBlocked) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!open) {
          reveal();
          return;
        }
        setActiveIndex((prev) =>
          prev < 0
            ? findEdgeEnabledIndex(filteredOptions, "first")
            : findNextEnabledIndex(filteredOptions, prev, 1),
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!open) {
          reveal();
          return;
        }
        setActiveIndex((prev) =>
          prev < 0
            ? findEdgeEnabledIndex(filteredOptions, "last")
            : findNextEnabledIndex(filteredOptions, prev, -1),
        );
      } else if (event.key === "Home" && open) {
        event.preventDefault();
        setActiveIndex(findEdgeEnabledIndex(filteredOptions, "first"));
      } else if (event.key === "End" && open) {
        event.preventDefault();
        setActiveIndex(findEdgeEnabledIndex(filteredOptions, "last"));
      } else if (event.key === "Enter" || (event.key === " " && !fromFilter)) {
        event.preventDefault();
        if (!open) {
          reveal();
          return;
        }
        const opt = filteredOptions[activeIndex];
        if (opt !== undefined && !isOptionDisabled(opt)) {
          toggleOption(opt, event.nativeEvent);
        }
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        event.stopPropagation();
        dismiss(true);
      }
    };

    const handleRootClick = (event: ReactMouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || isBlocked) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(".mw-multiselect__clear, .mw-multiselect__chip-remove")
      ) {
        return;
      }
      if (open) {
        dismiss(false);
      } else {
        reveal();
      }
    };

    const handleRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      handleNavigationKeydown(event, false);
    };

    const optionKey = (option: any, index: number): string => {
      const val = getOptionValue(option);
      if (val !== null && typeof val === "object") return `obj-${index}`;
      return `${typeof val}:${String(val)}-${index}`;
    };

    const rootClassName = cx(
      "mw-multiselect",
      "mw-control",
      `mw-multiselect--${normalizedSize}`,
      fluid && "mw-multiselect--fluid",
      disabled && "mw-multiselect--disabled",
      isReadonly && "mw-multiselect--readonly",
      invalid && "mw-multiselect--invalid",
      open && "mw-multiselect--open",
      display === "chip" && "mw-multiselect--chip",
      className,
    );

    const rootStyle: CSSProperties = {
      ...(fitWidthPx !== null
        ? ({ "--mw-multiselect-fit": `${fitWidthPx}px` } as CSSProperties)
        : undefined),
      ...style,
    };

    return (
      <>
        <div
          {...restAttrs}
          ref={(node) => {
            rootRef.current = node;
            setMergedRef(forwardedRef, node);
          }}
        id={baseId}
        className={rootClassName}
        style={rootStyle}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={
          open && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        aria-label={effectiveAriaLabel}
        aria-labelledby={effectiveAriaLabelledby}
        aria-describedby={effectiveAriaDescribedby}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        aria-readonly={isReadonly || undefined}
        tabIndex={disabled ? -1 : 0}
        data-state={open ? "open" : "closed"}
        data-disabled={disabled ? "true" : undefined}
        data-readonly={isReadonly ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
        data-placeholder={!hasSelection ? "" : undefined}
        onClick={handleRootClick}
        onKeyDown={handleRootKeyDown}
      >
        <div className="mw-multiselect__label-container">
          <div
            ref={labelRef}
            className={cx(
              "mw-multiselect__label",
              !hasSelection && "mw-multiselect__label--placeholder",
              display === "chip" &&
                hasSelection &&
                "mw-multiselect__label--chip",
            )}
          >
            {renderValue ? (
              renderValue({ value: currentValues, placeholder })
            ) : !hasSelection ? (
              (placeholder ?? "")
            ) : display === "chip" ? (
              <>
                {visibleItems.map((item, idx) => (
                  <span key={`chip-${idx}`} className="mw-multiselect__chip">
                    <span className="mw-multiselect__chip-label">
                      {item.label}
                    </span>
                    {!isBlocked && (
                      <button
                        type="button"
                        className="mw-multiselect__chip-remove"
                        aria-label={t("common.select.remove", {
                          label: item.label,
                        })}
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                        }}
                        onClick={(event) => removeValue(item.value, event)}
                      >
                        <X aria-hidden="true" />
                      </button>
                    )}
                  </span>
                ))}
                {overflowCount > 0 && (
                  <Tooltip content={overflowTip}>
                    <span
                      className="mw-multiselect__chip mw-multiselect__chip--more"
                      data-tooltip={overflowTip}
                    >
                      +{overflowCount}
                    </span>
                  </Tooltip>
                )}
              </>
            ) : (
              summaryText
            )}
          </div>
        </div>

        {display === "chip" && !renderValue && (
          <div
            ref={measureRef}
            className="mw-multiselect__measure"
            aria-hidden="true"
          >
            {selectedItems.map((item, idx) => (
              <span key={`measure-${idx}`} className="mw-multiselect__chip">
                <span className="mw-multiselect__chip-label">{item.label}</span>
                {!isBlocked && (
                  <X
                    className="mw-multiselect__chip-remove"
                    aria-hidden="true"
                  />
                )}
              </span>
            ))}
          </div>
        )}

        {name &&
          currentValues.map((val, idx) => (
            <input
              key={`hidden-${idx}`}
              type="hidden"
              name={name}
              value={val === null || val === undefined ? "" : String(val)}
              disabled={disabled}
            />
          ))}

        {showClearButton && (
          <button
            type="button"
            className="mw-multiselect__clear"
            aria-label={t("common.select.clear")}
            tabIndex={-1}
            onMouseDown={(event) => {
              event.stopPropagation();
              event.preventDefault();
            }}
            onClick={clearSelection}
          >
            <X aria-hidden="true" />
          </button>
        )}

        <span className="mw-multiselect__dropdown" aria-hidden="true">
          <ChevronDown
            className="mw-multiselect__dropdown-icon"
            aria-hidden="true"
          />
        </span>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
            <div
              ref={panelRef}
              className="mw-multiselect__overlay mw-frost mw-glass"
              style={panelStyle}
            >
              {(header !== undefined || showToggleAll || filter) && (
                <div className="mw-multiselect__header">
                  {header}
                  {showToggleAll && (
                    <button
                      type="button"
                      role="checkbox"
                      className={cx(
                        "mw-multiselect__toggle-all",
                        allFilteredSelected &&
                          "mw-multiselect__toggle-all--checked",
                      )}
                      aria-checked={allFilteredSelected}
                      disabled={
                        isBlocked || enabledFilteredOptions.length === 0
                      }
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={toggleAll}
                    >
                      {allFilteredSelected && <Check aria-hidden="true" />}
                    </button>
                  )}
                  {filter && (
                    <div className="mw-multiselect__filter-container">
                      <input
                        ref={filterInputRef}
                        type="text"
                        className="mw-multiselect__filter mw-control mw-input"
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
                </div>
              )}

              <div
                ref={listContainerScrollRef}
                className="mw-multiselect__list-container mw-scroll"
                style={{ maxHeight: scrollHeight }}
              >
                <ul
                  id={listboxId}
                  ref={listRef}
                  role="listbox"
                  aria-multiselectable="true"
                  className="mw-multiselect__list"
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
                          "mw-multiselect__option",
                          selected && "mw-multiselect__option--selected",
                          highlighted && "mw-multiselect__option--highlighted",
                          optDisabled && "mw-multiselect__option--disabled",
                        )}
                        aria-label={label}
                        aria-selected={selected}
                        aria-disabled={optDisabled || undefined}
                        data-state={selected ? "checked" : "unchecked"}
                        data-highlighted={highlighted ? "" : undefined}
                        data-disabled={optDisabled ? "" : undefined}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseMove={() => {
                          if (!optDisabled) {
                            setActiveIndex(index);
                          }
                        }}
                        onClick={(event) => {
                          toggleOption(option, event.nativeEvent);
                        }}
                      >
                        <span
                          className="mw-multiselect__checkbox"
                          aria-hidden="true"
                        >
                          {selected && <Check aria-hidden="true" />}
                        </span>
                        {renderOption ? (
                          renderOption({
                            option,
                            index,
                            selected,
                            disabled: optDisabled,
                            label,
                          })
                        ) : (
                          <span className="mw-multiselect__option-label">
                            {label}
                          </span>
                        )}
                      </li>
                    );
                  })}

                  {filteredOptions.length === 0 && (
                    <li role="option" className="mw-multiselect__empty">
                      {empty !== undefined ? empty : emptyText}
                    </li>
                  )}
                </ul>
              </div>

              {footer !== undefined && footer !== null && (
                <div className="mw-multiselect__footer">{footer}</div>
              )}
            </div>,
            document.body,
          )}
      </>
    );
  },
);

MultiSelectBase.displayName = "MwMultiSelect";

export type MultiSelectComponent = (<T = any>(
  props: MultiSelectProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement | null) & {
  displayName?: string;
};

export const MultiSelect = MultiSelectBase as unknown as MultiSelectComponent;
MultiSelect.displayName = "MwMultiSelect";

export default MultiSelect;
