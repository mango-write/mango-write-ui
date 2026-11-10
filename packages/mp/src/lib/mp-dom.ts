/**
 * Cross-environment input value reader for WeChat Mini Program (uni-app WXML) and Web H5 (Playground/DOM).
 * - Mini Program `<input>` / `<textarea>` events carry the value at `event.detail.value`.
 * - Browser DOM `<input>` / `<textarea>` events carry the value at `event.target.value`.
 */
export function readMpInputValue(event: unknown): string {
  if (!event || typeof event !== "object") return "";
  const record = event as {
    detail?: { value?: unknown } | null;
    target?: { value?: unknown } | null;
  };
  if (record.detail && typeof record.detail === "object" && "value" in record.detail) {
    const val = record.detail.value;
    return val === undefined || val === null ? "" : String(val);
  }
  if (record.target && typeof record.target === "object" && "value" in record.target) {
    const val = record.target.value;
    return val === undefined || val === null ? "" : String(val);
  }
  return "";
}
