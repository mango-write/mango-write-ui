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
import { useUiLocale } from "../locale";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";
import type {
  ListboxChangeEvent,
  ListboxOptionAccessor,
  ListboxOptionSlotProps,
  ListboxProps,
} from "./listbox-defs";

export type {
  ListboxChangeEvent,
  ListboxOptionAccessor,
  ListboxOptionSlotProps,
  ListboxProps,
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

function resolveLbOptionLabel(
  option: any,
  optionLabel?: ListboxOptionAccessor<any, string>,
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

const ListboxBase = forwardRef<HTMLDivElement, ListboxProps<any>>(
  function MwListbox(props, forwardedRef) {
    const {
      value: valueProp,
      modelValue,
      defaultValue,
      onValueChange,
      onChange,
      options = [],
      optionLabel,
      optionValue,
      optionDisabled,
      multiple = false,
      filter = false,
      filterPlaceholder,
      emptyMessage,
      emptyFilterMessage,
      listStyle,
      disabled: disabledProp,
      readonly: readonlyProp = false,
      readOnly = false,
      required: requiredProp,
      invalid: invalidProp,
      inputId,
      id,
      ariaLabel,
      ariaLabelledby,
      ariaDescribedby,
      header,
      footer,
      empty,
      renderOption,
      className,
      style,
      onKeyDown,
      ...restListAttrs
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
    const [uncontrolledValue, setUncontrolledValue] = useState<any>(() =>
      defaultValue !== undefined ? defaultValue : multiple ? [] : null,
    );
    const currentValue = isControlled ? controlledValue : uncontrolledValue;

    const generatedId = useId();
    const baseId = resolvedInputId ?? id ?? `mw-listbox-${generatedId}`;
    const listboxId = `${baseId}-list`;
    const optionId = (index: number) => `${listboxId}-option-${index}`;

    const effectiveAriaLabel = ariaLabel ?? restListAttrs["aria-label"];
    const effectiveAriaLabelledby =
      ariaLabelledby ?? restListAttrs["aria-labelledby"];
    const effectiveAriaDescribedby = mergeDescribedBy(
      formField.describedBy,
      ariaDescribedby,
      restListAttrs["aria-describedby"],
    );

    const listRef = useRef<HTMLUListElement | null>(null);
    const listContainerScrollRef = useScrollFade<HTMLDivElement>({ size: "sm" });
    const [filterQuery, setFilterQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);

    const getOptionLabel = useCallback(
      (opt: any) => resolveLbOptionLabel(opt, optionLabel),
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
        const val = getOptionValue(opt);
        if (multiple) {
          const arr = Array.isArray(currentValue) ? currentValue : [];
          return arr.some((item) => isSameValue(item, val));
        }
        if (currentValue === null || currentValue === undefined) return false;
        return isSameValue(val, currentValue);
      },
      [getOptionValue, multiple, currentValue],
    );

    const filteredOptions = useMemo(() => {
      if (!filter) return options;
      const q = filterQuery.trim().toLowerCase();
      if (!q) return options;
      return options.filter((opt) =>
        getOptionLabel(opt).toLowerCase().includes(q),
      );
    }, [options, filter, filterQuery, getOptionLabel]);

    const emptyText = useMemo(() => {
      if (filterQuery.trim()) {
        return emptyFilterMessage ?? emptyMessage ?? t("common.select.noMatch");
      }
      return emptyMessage ?? t("common.select.empty");
    }, [filterQuery, emptyFilterMessage, emptyMessage, t]);

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
      if (activeIndex < 0) return;
      const item =
        listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[
          activeIndex
        ];
      item?.scrollIntoView?.({ block: "nearest" });
    }, [activeIndex]);

    const selectOption = (option: any, index: number, originalEvent: Event) => {
      if (isBlocked || isOptionDisabled(option)) return;
      setActiveIndex(index);
      const val = getOptionValue(option);
      if (multiple) {
        const arr = Array.isArray(currentValue) ? currentValue : [];
        const exists = arr.some((item) => isSameValue(item, val));
        const next = exists
          ? arr.filter((item) => !isSameValue(item, val))
          : [...arr, val];
        if (!isControlled) setUncontrolledValue(next);
        onValueChange?.(next);
        onChange?.({ originalEvent, value: next });
      } else {
        if (!isControlled) setUncontrolledValue(val);
        onValueChange?.(val);
        onChange?.({ originalEvent, value: val });
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

    const handleNavigationKeyDown = (
      event: ReactKeyboardEvent<HTMLElement>,
      fromFilter = false,
    ) => {
      if (isBlocked) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) =>
          prev < 0
            ? findEdgeEnabledIndex(filteredOptions, "first")
            : findNextEnabledIndex(filteredOptions, prev, 1),
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) =>
          prev < 0
            ? findEdgeEnabledIndex(filteredOptions, "last")
            : findNextEnabledIndex(filteredOptions, prev, -1),
        );
      } else if (event.key === "Home") {
        event.preventDefault();
        setActiveIndex(findEdgeEnabledIndex(filteredOptions, "first"));
      } else if (event.key === "End") {
        event.preventDefault();
        setActiveIndex(findEdgeEnabledIndex(filteredOptions, "last"));
      } else if (event.key === "Enter" || (event.key === " " && !fromFilter)) {
        event.preventDefault();
        const idx =
          activeIndex >= 0
            ? activeIndex
            : findEdgeEnabledIndex(filteredOptions, "first");
        const opt = filteredOptions[idx];
        if (opt !== undefined && !isOptionDisabled(opt)) {
          selectOption(opt, idx, event.nativeEvent);
        }
      }
    };

    const optionKey = (option: any, index: number): string => {
      const val = getOptionValue(option);
      if (val !== null && typeof val === "object") return `obj-${index}`;
      return `${typeof val}:${String(val)}-${index}`;
    };

    return (
      <div
        ref={(node) => setMergedRef(forwardedRef, node)}
        id={baseId}
        className={cx(
          "mw-listbox",
          "mw-control",
          disabled && "mw-listbox--disabled",
          isReadonly && "mw-listbox--readonly",
          invalid && "mw-listbox--invalid",
          className,
        )}
        style={style}
        data-disabled={disabled ? "true" : undefined}
        data-readonly={isReadonly ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
      >
        {(header !== undefined || filter) && (
          <div className="mw-listbox__header">
            {header}
            {filter && (
              <div className="mw-listbox__filter-container">
                <input
                  type="text"
                  className="mw-listbox__filter mw-control mw-input"
                  value={filterQuery}
                  placeholder={filterPlaceholder}
                  disabled={disabled}
                  readOnly={isReadonly}
                  aria-label={filterPlaceholder || effectiveAriaLabel}
                  aria-controls={listboxId}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={handleFilterChange}
                  onKeyDown={(event) => handleNavigationKeyDown(event, true)}
                />
              </div>
            )}
          </div>
        )}

        <div
          ref={listContainerScrollRef}
          className="mw-listbox__list-container mw-scroll"
          style={listStyle}
        >
          <ul
            {...restListAttrs}
            id={listboxId}
            ref={listRef}
            role="listbox"
            className="mw-listbox__list"
            aria-multiselectable={multiple || undefined}
            aria-label={effectiveAriaLabel}
            aria-labelledby={effectiveAriaLabelledby}
            aria-describedby={effectiveAriaDescribedby}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            aria-disabled={disabled || undefined}
            aria-readonly={isReadonly || undefined}
            aria-activedescendant={
              activeIndex >= 0 ? optionId(activeIndex) : undefined
            }
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (!event.defaultPrevented) {
                handleNavigationKeyDown(event, false);
              }
            }}
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
                    "mw-listbox__option",
                    selected && "mw-listbox__option--selected",
                    highlighted && "mw-listbox__option--highlighted",
                    optDisabled && "mw-listbox__option--disabled",
                  )}
                  aria-label={label}
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
                  onClick={(event) => {
                    selectOption(option, index, event.nativeEvent);
                  }}
                >
                  {renderOption
                    ? renderOption({
                        option,
                        index,
                        selected,
                        disabled: optDisabled,
                        label,
                      })
                    : label}
                </li>
              );
            })}

            {filteredOptions.length === 0 && (
              <li role="option" className="mw-listbox__empty">
                {empty !== undefined ? empty : emptyText}
              </li>
            )}
          </ul>
        </div>

        {footer !== undefined && footer !== null && (
          <div className="mw-listbox__footer">{footer}</div>
        )}
      </div>
    );
  },
);

ListboxBase.displayName = "MwListbox";

export type ListboxComponent = (<T = any>(
  props: ListboxProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement | null) & {
  displayName?: string;
};

export const Listbox = ListboxBase as unknown as ListboxComponent;
Listbox.displayName = "MwListbox";

export default Listbox;
