import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  X,
} from "lucide-react";
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
import { pad2, startOfDayTime } from "@mango-write/ui-core/headless/calendar-grid";
import { useComboPanel } from "../lib/useComboPanel";
import { uiMessages, useUiLocale, type UiLocaleSource } from "../locale";
import Calendar, { type CalendarHandle } from "./Calendar";
import type {
  DatePickerHourFormat,
  DatePickerMode,
  DatePickerModelValue,
  DatePickerOutputValue,
  DatePickerProps,
  DatePickerSelectionMode,
  DatePickerSize,
} from "./date-picker";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";

export type {
  DatePickerHourFormat,
  DatePickerMode,
  DatePickerModelValue,
  DatePickerOutputValue,
  DatePickerProps,
  DatePickerSelectionMode,
  DatePickerSize,
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

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function MwDatePicker(props, forwardedRef) {
    const {
      value: valueProp,
      modelValue,
      defaultValue = null,
      onValueChange,
      onChange,
      onDateSelect,
      onClear,
      onClearClick,
      onShow,
      onHide,
      selectionMode = "single",
      mode,
      showTime: showTimeProp = false,
      timeOnly: timeOnlyProp = false,
      hourFormat = "24",
      dateFormat = "yy-mm-dd",
      minDate = null,
      maxDate = null,
      firstDayOfWeek = 1,
      days,
      locale: localeProp,
      showIcon = false,
      showClear = false,
      showButtonBar = false,
      hideOnRangeSelection = false,
      placeholder,
      disabled: disabledProp,
      readonly: readonlyProp = false,
      readOnly = false,
      required: requiredProp,
      invalid: invalidProp,
      fluid = false,
      size,
      inputId,
      id,
      name,
      ariaLabel,
      ariaLabelledby,
      ariaDescribedby,
      title,
      className,
      style,
      ...restAttrs
    } = props;

    const formField = useFormFieldContext();
    const disabled = Boolean(disabledProp ?? formField.disabled ?? false);
    const invalid = Boolean(invalidProp ?? formField.invalid ?? false);
    const required = Boolean(requiredProp ?? formField.required ?? false);
    const resolvedInputId = inputId ?? formField.inputId;
    const isReadonly = Boolean(readonlyProp || readOnly);
    const isBlocked = disabled || isReadonly;

    const timeOnly = Boolean(timeOnlyProp || mode === "time");
    const showTime = Boolean(showTimeProp || mode === "datetime");

    const { locale: contextLocale } = useUiLocale();

    const localeKey = useMemo<UiLocaleSource>(() => {
      if (localeProp) {
        return localeProp.toLowerCase().startsWith("en") ? "en-US" : "zh-CN";
      }
      if (typeof document !== "undefined") {
        const htmlLang = document.documentElement.lang?.toLowerCase() ?? "";
        if (htmlLang.startsWith("en")) return "en-US";
      }
      return contextLocale;
    }, [localeProp, contextLocale]);

    const copy = uiMessages[localeKey].common;

    const isControlled = valueProp !== undefined || modelValue !== undefined;
    const controlledValue = valueProp !== undefined ? valueProp : modelValue;
    const [uncontrolledValue, setUncontrolledValue] =
      useState<DatePickerModelValue>(() => defaultValue);
    const currentValue = isControlled
      ? (controlledValue ?? null)
      : uncontrolledValue;

    const uid = useId();
    const panelId = `${id || resolvedInputId || `mw-dp-${uid}`}-panel`;

    const effectiveAriaLabel = ariaLabel ?? restAttrs["aria-label"];
    const effectiveAriaLabelledby =
      ariaLabelledby ?? restAttrs["aria-labelledby"];
    const effectiveAriaDescribedby = mergeDescribedBy(
      formField.describedBy,
      ariaDescribedby,
      restAttrs["aria-describedby"],
    );

    const normalizedSize: "sm" | "md" | "lg" = useMemo(() => {
      if (size === "small" || size === "sm") return "sm";
      if (size === "large" || size === "lg") return "lg";
      return "md";
    }, [size]);

    const rootEl = useRef<HTMLDivElement | null>(null);
    const inputEl = useRef<HTMLInputElement | null>(null);
    const panelEl = useRef<HTMLDivElement | null>(null);
    const calendarRef = useRef<CalendarHandle | null>(null);
    const [focused, setFocused] = useState(false);

    const currentHoursRef = useRef(0);
    const currentMinutesRef = useRef(0);
    const [currentHours, setCurrentHours] = useState(0);
    const [currentMinutes, setCurrentMinutes] = useState(0);
    const viewYearRef = useRef(new Date().getFullYear());
    const viewMonthRef = useRef(new Date().getMonth());

    const parseSingleDateString = useCallback(
      (
        raw: string,
        fallbackBase?: Date | null,
        hoursFallback = currentHoursRef.current,
        minutesFallback = currentMinutesRef.current,
      ): Date | null => {
        const text = raw.trim();
        if (!text) return null;

        if (timeOnly) {
          const timeMatch = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(text);
          if (timeMatch) {
            let hours = Number(timeMatch[1]);
            const minutes = Number(timeMatch[2]);
            const ampm = timeMatch[3]?.toUpperCase();
            if (ampm === "PM" && hours < 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;
            if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
              const base = fallbackBase ?? new Date();
              const d = new Date(base.getTime());
              d.setHours(hours, minutes, 0, 0);
              return d;
            }
          }
        }

        const isoMatch =
          /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?)?$/i.exec(
            text,
          );
        if (isoMatch) {
          const year = Number(isoMatch[1]);
          const month = Number(isoMatch[2]) - 1;
          const day = Number(isoMatch[3]);
          let hours =
            isoMatch[4] !== undefined ? Number(isoMatch[4]) : hoursFallback;
          const minutes =
            isoMatch[5] !== undefined ? Number(isoMatch[5]) : minutesFallback;
          const seconds = isoMatch[6] !== undefined ? Number(isoMatch[6]) : 0;
          const ampm = isoMatch[7]?.toUpperCase();
          if (ampm === "PM" && hours < 12) hours += 12;
          if (ampm === "AM" && hours === 12) hours = 0;

          if (
            month >= 0 &&
            month <= 11 &&
            day >= 1 &&
            day <= 31 &&
            hours >= 0 &&
            hours < 24 &&
            minutes >= 0 &&
            minutes < 60
          ) {
            const candidate = new Date(
              year,
              month,
              day,
              showTime || isoMatch[4] !== undefined ? hours : 0,
              showTime || isoMatch[5] !== undefined ? minutes : 0,
              seconds,
              0,
            );
            if (
              candidate.getFullYear() === year &&
              candidate.getMonth() === month &&
              candidate.getDate() === day
            ) {
              return candidate;
            }
          }
        }

        return null;
      },
      [timeOnly, showTime],
    );

    const toValidDate = useCallback(
      (val: unknown): Date | null => {
        if (!val) return null;
        if (val instanceof Date) {
          return Number.isNaN(val.getTime()) ? null : new Date(val.getTime());
        }
        if (typeof val === "string") {
          const parsed = parseSingleDateString(val, null, 0, 0);
          if (parsed) return parsed;
          const d = new Date(val);
          return Number.isNaN(d.getTime()) ? null : d;
        }
        return null;
      },
      [parseSingleDateString],
    );

    const formatTimePart = useCallback(
      (d: Date): string => {
        const h24 = d.getHours();
        const min = pad2(d.getMinutes());
        if (hourFormat === "12") {
          const suffix = h24 >= 12 ? "PM" : "AM";
          const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
          return `${pad2(h12)}:${min} ${suffix}`;
        }
        return `${pad2(h24)}:${min}`;
      },
      [hourFormat],
    );

    const formatSingleDate = useCallback(
      (d: Date): string => {
        if (timeOnly) {
          return formatTimePart(d);
        }
        const yyyy = String(d.getFullYear());
        const yy = yyyy.slice(-2);
        const mm = pad2(d.getMonth() + 1);
        const dd = pad2(d.getDate());
        const fmt = dateFormat || "yy-mm-dd";
        let datePart = fmt
          .replace(/yyyy/gi, yyyy)
          .replace(/yy/gi, yyyy)
          .replace(/\by\b/gi, yy)
          .replace(/mm/gi, mm)
          .replace(/dd/gi, dd);
        if (!datePart || datePart === fmt) {
          datePart = `${yyyy}-${mm}-${dd}`;
        }
        if (showTime) {
          return `${datePart} ${formatTimePart(d)}`;
        }
        return datePart;
      },
      [timeOnly, dateFormat, showTime, formatTimePart],
    );

    const formatModelValue = useCallback(
      (val: DatePickerModelValue | undefined): string => {
        if (val == null || val === "") return "";
        if (Array.isArray(val)) {
          if (selectionMode === "range") {
            const start = toValidDate(val[0]);
            const end = toValidDate(val[1]);
            if (start && end) {
              return `${formatSingleDate(start)} - ${formatSingleDate(end)}`;
            }
            if (start) return formatSingleDate(start);
            return "";
          }
          const validDates = val
            .map((item) => toValidDate(item))
            .filter((d): d is Date => d !== null);
          return validDates.map((d) => formatSingleDate(d)).join(", ");
        }
        const single = toValidDate(val);
        return single ? formatSingleDate(single) : "";
      },
      [selectionMode, toValidDate, formatSingleDate],
    );

    const syncViewAndTimeFromModel = useCallback(
      (val: DatePickerModelValue | undefined) => {
        let primary: Date | null = null;
        if (Array.isArray(val)) {
          primary = toValidDate(val[0]) ?? toValidDate(val[1]);
        } else {
          primary = toValidDate(val);
        }
        if (primary) {
          viewYearRef.current = primary.getFullYear();
          viewMonthRef.current = primary.getMonth();
          currentHoursRef.current = primary.getHours();
          currentMinutesRef.current = primary.getMinutes();
          setCurrentHours(primary.getHours());
          setCurrentMinutes(primary.getMinutes());
        }
      },
      [toValidDate],
    );

    const [inputText, setInputText] = useState(() =>
      formatModelValue(currentValue),
    );

    useEffect(() => {
      setInputText(formatModelValue(currentValue));
      syncViewAndTimeFromModel(currentValue);
    }, [
      currentValue,
      dateFormat,
      showTime,
      timeOnly,
      hourFormat,
      formatModelValue,
      syncViewAndTimeFromModel,
    ]);

    const hasValue = useMemo(() => {
      if (currentValue == null || currentValue === "") return false;
      if (Array.isArray(currentValue)) {
        return currentValue.some((item) => toValidDate(item) !== null);
      }
      return toValidDate(currentValue) !== null;
    }, [currentValue, toValidDate]);

    const onHideRef = useRef(onHide);
    onHideRef.current = onHide;

    const {
      open,
      panelStyle,
      openPanel: comboOpenPanel,
      closePanel: comboClosePanel,
      reposition,
    } = useComboPanel(rootEl, panelEl, {
      matchTriggerWidth: false,
      onClose: () => {
        onHideRef.current?.();
      },
    });

    const closePanel = useCallback(() => {
      if (!open) return;
      comboClosePanel();
    }, [open, comboClosePanel]);

    const openPanel = useCallback(() => {
      if (isBlocked || open) return;
      syncViewAndTimeFromModel(currentValue);
      comboOpenPanel();
      onShow?.();
      queueMicrotask(() => reposition());
    }, [
      isBlocked,
      open,
      syncViewAndTimeFromModel,
      currentValue,
      comboOpenPanel,
      onShow,
      reposition,
    ]);

    const togglePanel = () => {
      if (isBlocked) return;
      if (open) {
        closePanel();
      } else {
        openPanel();
      }
    };

    const isDateDisabled = useCallback(
      (d: Date): boolean => {
        if (disabled) return true;
        const dayTime = startOfDayTime(d);
        if (minDate instanceof Date && !Number.isNaN(minDate.getTime())) {
          if (dayTime < startOfDayTime(minDate)) return true;
        }
        if (maxDate instanceof Date && !Number.isNaN(maxDate.getTime())) {
          if (dayTime > startOfDayTime(maxDate)) return true;
        }
        return false;
      },
      [disabled, minDate, maxDate],
    );

    const commitOutput = useCallback(
      (nextVal: DatePickerOutputValue) => {
        if (!isControlled) {
          setUncontrolledValue(nextVal);
        }
        onValueChange?.(nextVal);
        onChange?.(nextVal);
      },
      [isControlled, onValueChange, onChange],
    );

    const handleCalendarValueChange = (nextVal: DatePickerOutputValue) => {
      setInputText(formatModelValue(nextVal));
      commitOutput(nextVal);

      if (selectionMode === "range") {
        if (
          Array.isArray(nextVal) &&
          nextVal[0] &&
          nextVal[1] &&
          hideOnRangeSelection &&
          !showTime
        ) {
          closePanel();
        }
        return;
      }

      if (selectionMode === "single" && !showTime) {
        closePanel();
      }
    };

    const applyTimeChange = (nextHours: number, nextMinutes: number) => {
      if (isBlocked) return;
      currentHoursRef.current = nextHours;
      currentMinutesRef.current = nextMinutes;
      setCurrentHours(nextHours);
      setCurrentMinutes(nextMinutes);

      if (selectionMode === "range" && Array.isArray(currentValue)) {
        const start = toValidDate(currentValue[0]);
        const end = toValidDate(currentValue[1]);
        if (!start) return;
        const updatedStart = new Date(start.getTime());
        updatedStart.setHours(nextHours, nextMinutes, 0, 0);
        const nextRange: Array<Date | null> = [updatedStart, end];
        setInputText(formatModelValue(nextRange));
        commitOutput(nextRange);
        onDateSelect?.(updatedStart);
        return;
      }

      const base =
        toValidDate(currentValue) ??
        new Date(viewYearRef.current, viewMonthRef.current, 1);
      const nextDate = new Date(base.getTime());
      nextDate.setHours(nextHours, nextMinutes, 0, 0);
      if (isDateDisabled(nextDate) && !timeOnly) return;
      setInputText(formatModelValue(nextDate));
      commitOutput(nextDate);
      onDateSelect?.(nextDate);
    };

    const changeHour = (delta: number) => {
      if (isBlocked) return;
      const nextH = (currentHoursRef.current + delta + 24) % 24;
      applyTimeChange(nextH, currentMinutesRef.current);
    };

    const changeMinute = (delta: number) => {
      if (isBlocked) return;
      const nextM = (currentMinutesRef.current + delta + 60) % 60;
      applyTimeChange(currentHoursRef.current, nextM);
    };

    const toggleAmPm = () => {
      if (isBlocked) return;
      const nextH = (currentHoursRef.current + 12) % 24;
      applyTimeChange(nextH, currentMinutesRef.current);
    };

    const displayHour = useMemo(() => {
      if (hourFormat === "12") {
        const h = currentHours % 12 === 0 ? 12 : currentHours % 12;
        return pad2(h);
      }
      return pad2(currentHours);
    }, [hourFormat, currentHours]);

    const displayMinute = pad2(currentMinutes);
    const displayAmPm = currentHours >= 12 ? "PM" : "AM";

    const isCompleteStrictInput = (raw: string): boolean => {
      const text = raw.trim();
      if (timeOnly) {
        return /^\d{2}:\d{2}(?:\s*(?:AM|PM))?$/i.test(text);
      }
      if (selectionMode === "range") {
        return /^\d{4}[-/]\d{2}[-/]\d{2}\s*-\s*\d{4}[-/]\d{2}[-/]\d{2}$/.test(
          text,
        );
      }
      if (showTime) {
        return /^\d{4}[-/]\d{2}[-/]\d{2}(?:[T\s]+\d{2}:\d{2}(?:\s*(?:AM|PM))?)?$/i.test(
          text,
        );
      }
      return /^\d{4}[-/]\d{2}[-/]\d{2}$/.test(text);
    };

    const commitParsedInput = (raw: string, allowEmptyClear: boolean) => {
      const text = raw.trim();
      if (!text) {
        if (allowEmptyClear && hasValue) {
          commitOutput(null);
          onClear?.();
        }
        return;
      }

      if (selectionMode === "range" && text.includes(" - ")) {
        const parts = text.split(/\s+-\s+/);
        const start = parseSingleDateString(parts[0] ?? "", null);
        const end = parseSingleDateString(parts[1] ?? "", null);
        if (start && end && !isDateDisabled(start) && !isDateDisabled(end)) {
          const sorted: Array<Date | null> =
            start.getTime() <= end.getTime() ? [start, end] : [end, start];
          syncViewAndTimeFromModel(sorted);
          commitOutput(sorted);
          onDateSelect?.(sorted[1] ?? sorted[0]!);
        }
        return;
      }

      const fallbackBase = toValidDate(currentValue);
      const parsed = parseSingleDateString(text, fallbackBase);
      if (!parsed) return;
      if (!timeOnly && isDateDisabled(parsed)) return;

      if (fallbackBase && fallbackBase.getTime() === parsed.getTime()) {
        return;
      }

      syncViewAndTimeFromModel(parsed);
      if (selectionMode === "range") {
        const nextRange: Array<Date | null> = [parsed, null];
        commitOutput(nextRange);
        onDateSelect?.(parsed);
        return;
      }
      if (selectionMode === "multiple") {
        commitOutput([parsed]);
        onDateSelect?.(parsed);
        return;
      }
      commitOutput(parsed);
      onDateSelect?.(parsed);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (isBlocked) return;
      const nextVal = event.target.value;
      setInputText(nextVal);
      if (isCompleteStrictInput(nextVal)) {
        commitParsedInput(nextVal, false);
      }
    };

    const handleFocus = () => {
      setFocused(true);
      if (!isBlocked) {
        openPanel();
      }
    };

    const handleBlur = () => {
      setFocused(false);
      if (!inputText.trim() && hasValue) {
        commitOutput(null);
        onClear?.();
        return;
      }
      commitParsedInput(inputText, false);
      setInputText(formatModelValue(currentValue));
    };

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        closePanel();
        return;
      }
      if (event.key === "ArrowDown" && !open) {
        event.preventDefault();
        openPanel();
      } else if (event.key === "Enter") {
        commitParsedInput(inputText, true);
      }
    };

    const handleClearClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (isBlocked) return;
      setInputText("");
      commitOutput(null);
      onClear?.();
      onClearClick?.(event.nativeEvent);
      closePanel();
    };

    const handleTodayClick = () => {
      if (isBlocked) return;
      const now = new Date();
      if (showTime || timeOnly) {
        now.setHours(
          currentHoursRef.current,
          currentMinutesRef.current,
          0,
          0,
        );
      } else {
        now.setHours(0, 0, 0, 0);
      }
      viewYearRef.current = now.getFullYear();
      viewMonthRef.current = now.getMonth();
      calendarRef.current?.backToToday();
      if (isDateDisabled(now)) return;
      if (selectionMode === "range") {
        const nextRange: Array<Date | null> = [now, now];
        setInputText(formatModelValue(nextRange));
        commitOutput(nextRange);
        onDateSelect?.(now);
        if (hideOnRangeSelection && !showTime) closePanel();
        return;
      }
      if (selectionMode === "multiple") {
        setInputText(formatModelValue([now]));
        commitOutput([now]);
        onDateSelect?.(now);
        return;
      }
      setInputText(formatModelValue(now));
      commitOutput(now);
      onDateSelect?.(now);
      if (!showTime) closePanel();
    };

    const isWideValueMode =
      selectionMode === "range" || selectionMode === "multiple" || showTime;

    return (
      <>
        <div
          {...restAttrs}
          ref={(node) => {
            rootEl.current = node;
            setMergedRef(forwardedRef, node);
          }}
        id={id}
        className={cx(
          "mw-date-picker",
          "mw-control",
          `mw-date-picker--${normalizedSize}`,
          isWideValueMode && "mw-date-picker--wide",
          timeOnly && "mw-date-picker--time-only",
          fluid && "mw-date-picker--fluid",
          disabled && "mw-date-picker--disabled",
          invalid && "mw-date-picker--invalid",
          open && "mw-date-picker--open",
          hasValue && "mw-date-picker--filled",
          (focused || open) && "mw-date-picker--focused",
          className,
        )}
        style={style}
        data-state={open ? "open" : "closed"}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
      >
        <input
          ref={inputEl}
          type="text"
          className="mw-date-picker__input mw-input"
          id={resolvedInputId}
          name={name}
          value={inputText}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={isReadonly}
          required={required}
          title={title}
          aria-label={effectiveAriaLabel}
          aria-labelledby={effectiveAriaLabelledby}
          aria-describedby={effectiveAriaDescribedby}
          aria-invalid={invalid ? "true" : undefined}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          autoComplete="off"
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />

        {showClear && hasValue && !isBlocked && (
          <button
            type="button"
            className="mw-date-picker__clear"
            aria-label={copy.select.clear}
            tabIndex={-1}
            onClick={handleClearClick}
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}

        {showIcon && (
          <button
            type="button"
            className="mw-date-picker__dropdown"
            disabled={disabled}
            aria-label={copy.calendar.chooseDate}
            aria-expanded={open}
            tabIndex={-1}
            onClick={togglePanel}
          >
            {timeOnly ? (
              <Clock size={14} aria-hidden="true" />
            ) : (
              <CalendarIcon size={14} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
            <div
              id={panelId}
              ref={panelEl}
              className="mw-date-picker__panel mw-frost mw-glass"
              style={panelStyle}
              role="dialog"
              aria-label={effectiveAriaLabel || copy.calendar.chooseDate}
            >
              {!timeOnly && (
                <Calendar
                  calendarRef={calendarRef}
                  variant="plain"
                  value={currentValue}
                  selectionMode={selectionMode}
                  minDate={minDate}
                  maxDate={maxDate}
                  firstDayOfWeek={firstDayOfWeek}
                  days={days}
                  locale={localeProp}
                  hours={showTime ? currentHours : 0}
                  minutes={showTime ? currentMinutes : 0}
                  disabled={disabled}
                  readonly={isReadonly}
                  onValueChange={handleCalendarValueChange}
                  onDateSelect={onDateSelect}
                />
              )}

              {(showTime || timeOnly) && (
                <div
                  className={cx(
                    "mw-date-picker__time-picker",
                    timeOnly && "mw-date-picker__time-picker--standalone",
                  )}
                >
                  <div className="mw-date-picker__time-unit">
                    <button
                      type="button"
                      className="mw-date-picker__time-btn"
                      aria-label="Next Hour"
                      onClick={() => changeHour(1)}
                    >
                      <ChevronUp size={12} aria-hidden="true" />
                    </button>
                    <span
                      className="mw-date-picker__time-val"
                      data-time-part="hour"
                    >
                      {displayHour}
                    </span>
                    <button
                      type="button"
                      className="mw-date-picker__time-btn"
                      aria-label="Previous Hour"
                      onClick={() => changeHour(-1)}
                    >
                      <ChevronDown size={12} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mw-date-picker__time-sep">:</div>

                  <div className="mw-date-picker__time-unit">
                    <button
                      type="button"
                      className="mw-date-picker__time-btn"
                      aria-label="Next Minute"
                      onClick={() => changeMinute(1)}
                    >
                      <ChevronUp size={12} aria-hidden="true" />
                    </button>
                    <span
                      className="mw-date-picker__time-val"
                      data-time-part="minute"
                    >
                      {displayMinute}
                    </span>
                    <button
                      type="button"
                      className="mw-date-picker__time-btn"
                      aria-label="Previous Minute"
                      onClick={() => changeMinute(-1)}
                    >
                      <ChevronDown size={12} aria-hidden="true" />
                    </button>
                  </div>

                  {hourFormat === "12" && (
                    <div className="mw-date-picker__time-unit">
                      <button
                        type="button"
                        className="mw-date-picker__time-btn"
                        aria-label="Toggle AM/PM"
                        onClick={toggleAmPm}
                      >
                        <ChevronUp size={12} aria-hidden="true" />
                      </button>
                      <span
                        className="mw-date-picker__time-val"
                        data-time-part="ampm"
                      >
                        {displayAmPm}
                      </span>
                      <button
                        type="button"
                        className="mw-date-picker__time-btn"
                        aria-label="Toggle AM/PM"
                        onClick={toggleAmPm}
                      >
                        <ChevronDown size={12} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {showButtonBar && (
                <div className="mw-date-picker__buttonbar">
                  <button
                    type="button"
                    className="mw-date-picker__bar-btn"
                    onClick={handleTodayClick}
                  >
                    {copy.calendar.today}
                  </button>
                  <button
                    type="button"
                    className="mw-date-picker__bar-btn"
                    onClick={handleClearClick}
                  >
                    {copy.calendar.clear}
                  </button>
                </div>
              )}
            </div>,
            document.body,
          )}
      </>
    );
  },
);

DatePicker.displayName = "MwDatePicker";

export default DatePicker;
