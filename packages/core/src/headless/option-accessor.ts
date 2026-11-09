export type OptionAccessor<T = any, R = any> = string | ((option: T) => R);

export function isEmptyValue(val: unknown): boolean {
  return val === null || val === undefined || val === "";
}

export function isSameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a !== null && b !== null && typeof a === "object" && typeof b === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

export function resolveOptionLabel(
  option: any,
  optionLabel?: OptionAccessor<any, string>,
): string {
  if (option === null || option === undefined) return "";
  if (typeof optionLabel === "function") return String(optionLabel(option) ?? "");
  if (typeof optionLabel === "string" && optionLabel.length > 0 && typeof option === "object") {
    const raw = (option as Record<string, unknown>)[optionLabel];
    return raw === null || raw === undefined ? "" : String(raw);
  }
  if (typeof option === "object") {
    const fallback = (option as Record<string, unknown>).label ?? (option as Record<string, unknown>).name;
    return fallback !== undefined && fallback !== null ? String(fallback) : String(option);
  }
  return String(option);
}

export function resolveOptionValue(
  option: any,
  optionValue?: OptionAccessor<any, any>,
): any {
  if (option === null || option === undefined) return option;
  if (typeof optionValue === "function") return optionValue(option);
  if (typeof optionValue === "string" && optionValue.length > 0 && typeof option === "object") {
    return (option as Record<string, unknown>)[optionValue];
  }
  return option;
}

export function resolveOptionDisabled(
  option: any,
  optionDisabled?: OptionAccessor<any, boolean>,
): boolean {
  if (option === null || option === undefined) return false;
  if (typeof optionDisabled === "function") return Boolean(optionDisabled(option));
  if (typeof optionDisabled === "string" && optionDisabled.length > 0 && typeof option === "object") {
    return Boolean((option as Record<string, unknown>)[optionDisabled]);
  }
  return false;
}
