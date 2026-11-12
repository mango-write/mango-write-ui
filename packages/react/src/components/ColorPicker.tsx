import {
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { mergeDescribedBy, useFormFieldContext } from "./form-field-context";
import type { ColorPickerProps } from "./color-picker";

export type {
  ColorPickerChangeEvent,
  ColorPickerFormat,
  ColorPickerProps,
} from "./color-picker";

const HASH = String.fromCharCode(35);

function extractCleanHex6(raw: string | undefined, fallback: string): string {
  const source = (raw || fallback || "ff0000").trim();
  const stripped = source.startsWith(HASH) ? source.slice(1) : source;
  if (/^[0-9a-fA-F]{6}$/.test(stripped)) {
    return stripped.toLowerCase();
  }
  if (/^[0-9a-fA-F]{3}$/.test(stripped)) {
    return stripped
      .split("")
      .map((c) => c + c)
      .join("")
      .toLowerCase();
  }
  return "ff0000";
}

function hexToRgb(hex6: string): { r: number; g: number; b: number } {
  const num = parseInt(hex6, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHsb(r: number, g: number, b: number): { h: number; s: number; b: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (max !== min) {
    if (max === rn) {
      h = (gn - bn) / delta + (gn < bn ? 6 : 0);
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    b: Math.round(v * 100),
  };
}

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(function MwColorPicker(
  props,
  ref,
) {
  const {
    value,
    defaultValue,
    modelValue,
    defaultColor = "ff0000",
    onValueChange,
    onChange,
    inline = false,
    disabled,
    readOnly,
    readonly,
    invalid,
    format = "hex",
    inputId,
    id,
    name,
    tabIndex,
    tabindex,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    className,
    style,
    "aria-label": nativeAriaLabel,
    "aria-labelledby": nativeAriaLabelledby,
    "aria-describedby": nativeAriaDescribedby,
    ...restAttrs
  } = props;

  const fieldContext = useFormFieldContext();
  const controlledProp = value !== undefined ? value : modelValue;
  const isControlled = controlledProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue ?? defaultColor);
  const currentValue = isControlled ? controlledProp : uncontrolledValue;

  const resolvedId = inputId ?? id ?? fieldContext.inputId;
  const resolvedDisabled = Boolean(disabled ?? fieldContext.disabled);
  const resolvedReadOnly = Boolean(readOnly ?? readonly);
  const resolvedInvalid = Boolean(invalid ?? fieldContext.invalid);
  const resolvedDescribedBy = mergeDescribedBy(
    ariaDescribedby ?? nativeAriaDescribedby,
    fieldContext.describedBy,
  );

  function formatOutput(hex6: string): string {
    if (format === "rgb") {
      const { r, g, b } = hexToRgb(hex6);
      return ["rgb", "(", r, ", ", g, ", ", b, ")"].join("");
    }
    if (format === "hsb") {
      const { r, g, b } = hexToRgb(hex6);
      const hsb = rgbToHsb(r, g, b);
      return ["hsb", "(", hsb.h, ", ", hsb.s, "%, ", hsb.b, "%)"].join("");
    }
    const hadLeadingHash =
      typeof currentValue === "string" && currentValue.trim().startsWith(HASH);
    return hadLeadingHash ? `${HASH}${hex6}` : hex6;
  }

  const nativeColorValue = `${HASH}${extractCleanHex6(currentValue, defaultColor)}`;

  const rootClass = [
    "mw-color-picker",
    inline ? "mw-color-picker--inline" : undefined,
    resolvedDisabled ? "mw-color-picker--disabled" : undefined,
    resolvedReadOnly ? "mw-color-picker--readonly" : undefined,
    resolvedInvalid ? "mw-color-picker--invalid" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function handleColorChange(event: ChangeEvent<HTMLInputElement>) {
    if (resolvedDisabled || resolvedReadOnly) return;

    const hex6 = extractCleanHex6(event.currentTarget.value, defaultColor);
    const formatted = formatOutput(hex6);
    if (!isControlled) {
      setUncontrolledValue(formatted);
    }
    onValueChange?.(formatted);
    onChange?.({ originalEvent: event.nativeEvent, value: formatted });
  }

  return (
    <span
      className={rootClass}
      style={style}
      data-disabled={resolvedDisabled ? "" : undefined}
      data-readonly={resolvedReadOnly ? "" : undefined}
      data-invalid={resolvedInvalid ? "" : undefined}
      data-inline={inline ? "" : undefined}
    >
      <input
        {...restAttrs}
        ref={ref}
        type="color"
        className="mw-color-picker__input mw-control"
        id={resolvedId}
        name={name}
        value={nativeColorValue}
        disabled={resolvedDisabled || resolvedReadOnly}
        tabIndex={tabIndex ?? tabindex}
        aria-label={ariaLabel ?? nativeAriaLabel}
        aria-labelledby={ariaLabelledby ?? nativeAriaLabelledby}
        aria-describedby={resolvedDescribedBy}
        aria-invalid={resolvedInvalid || undefined}
        aria-readonly={resolvedReadOnly || undefined}
        data-invalid={resolvedInvalid ? "" : undefined}
        data-disabled={resolvedDisabled ? "" : undefined}
        data-readonly={resolvedReadOnly ? "" : undefined}
        onChange={handleColorChange}
      />
    </span>
  );
});

ColorPicker.displayName = "MwColorPicker";

export default ColorPicker;
