export type NumberEditMode = "decimal" | "currency";

export interface NumberFormatOptions {
  useGrouping?: boolean;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  prefix?: string;
  suffix?: string;
  mode?: NumberEditMode;
  currency?: string;
  locale?: string;
}

export type NumberParseResult =
  | { kind: "empty"; value: null }
  | { kind: "incomplete"; value: null }
  | { kind: "invalid"; value: null }
  | { kind: "number"; value: number };

export interface NumberSeparators {
  group: string;
  decimal: string;
  affixPrefix: string;
  affixSuffix: string;
  negAffixPrefix: string;
  negAffixSuffix: string;
  zeroToNine: readonly string[];
  digitLookup: ReadonlyMap<string, string>;
}

export interface ReconcileNumberEditInput {
  rawText: string;
  rawCaret: number;
  prevText?: string;
  prevSelectionStart?: number;
  prevSelectionEnd?: number;
  inputType?: string;
  options?: NumberFormatOptions;
}

export interface ReconcileNumberEditResult {
  text: string;
  caret: number;
  parsed: NumberParseResult;
  rejected?: boolean;
}

const ASCII_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export function normalizeNegativeZero(val: number): number {
  return Object.is(val, -0) ? 0 : val;
}

export function countNumberDecimals(num: number): number {
  if (!Number.isFinite(num)) return 0;
  const str = String(Math.abs(num));
  const expIdx = str.indexOf("e-");
  if (expIdx !== -1) {
    const exp = parseInt(str.slice(expIdx + 2), 10) || 0;
    const dotIdx = str.indexOf(".");
    const mantissaFrac = dotIdx === -1 ? 0 : expIdx - dotIdx - 1;
    return mantissaFrac + exp;
  }
  const dotIdx = str.indexOf(".");
  return dotIdx === -1 ? 0 : str.length - dotIdx - 1;
}

export function resolveEffectiveMaxFractionDigits(options: NumberFormatOptions = {}): number | undefined {
  if (options.maxFractionDigits !== undefined) {
    return options.maxFractionDigits;
  }
  if (options.mode === "currency" && options.currency) {
    try {
      const resolved = new Intl.NumberFormat(options.locale, {
        style: "currency",
        currency: options.currency,
        minimumFractionDigits: options.minFractionDigits,
      }).resolvedOptions();
      return resolved.maximumFractionDigits;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function roundNumberToPrecision(val: number, maxFractionDigits?: number): number {
  if (!Number.isFinite(val)) return val;
  if (maxFractionDigits !== undefined && maxFractionDigits >= 0) {
    const factor = 10 ** maxFractionDigits;
    const sign = val < 0 ? -1 : 1;
    return normalizeNegativeZero(
      sign * (Math.round((Math.abs(val) + Number.EPSILON) * factor) / factor),
    );
  }
  return normalizeNegativeZero(val);
}

export function clampNumberValue(
  val: number,
  min?: number,
  max?: number,
  maxFractionDigits?: number,
): number {
  let next = roundNumberToPrecision(val, maxFractionDigits);
  if (min !== undefined && next < min) {
    next = min;
  }
  if (max !== undefined && next > max) {
    next = max;
  }
  return normalizeNegativeZero(next);
}

function buildDigitTables(locale?: string): {
  zeroToNine: readonly string[];
  digitLookup: Map<string, string>;
} {
  const digitLookup = new Map<string, string>();
  for (let d = 0; d <= 9; d += 1) {
    const ascii = String(d);
    digitLookup.set(ascii, ascii);
    digitLookup.set(String.fromCharCode(0xff10 + d), ascii);
    digitLookup.set(String.fromCharCode(0x0660 + d), ascii);
    digitLookup.set(String.fromCharCode(0x06f0 + d), ascii);
  }

  let zeroToNine: readonly string[] = ASCII_DIGITS;
  if (locale) {
    try {
      const sample = new Intl.NumberFormat(locale, { useGrouping: false }).format(9876543210);
      const chars = Array.from(sample);
      if (chars.length === 10) {
        const mapped: string[] = new Array(10);
        for (let idx = 0; idx < 10; idx += 1) {
          const digit = 9 - idx;
          const glyph = chars[idx]!;
          mapped[digit] = glyph;
          digitLookup.set(glyph, String(digit));
        }
        zeroToNine = mapped;
      }
    } catch {
      // 非法 locale 时退回 ASCII 数码表。
    }
  }

  return { zeroToNine, digitLookup };
}

export function resolveNumberSeparators(options: NumberFormatOptions = {}): NumberSeparators {
  let group = ",";
  let decimal = ".";
  let posLead = "";
  let posTail = "";
  let negLead = "-";
  let negTail = "";

  const { zeroToNine, digitLookup } = buildDigitTables(options.locale);

  try {
    const parts = new Intl.NumberFormat(options.locale, {
      style: "decimal",
      useGrouping: true,
    }).formatToParts(1234567.8);
    let foundGroup = false;
    for (const part of parts) {
      if (part.type === "group" && part.value) {
        group = part.value;
        foundGroup = true;
      }
      if (part.type === "decimal" && part.value) {
        decimal = part.value;
      }
    }
    if (!foundGroup && decimal === ",") {
      group = ".";
    }
  } catch {
    // 非法 locale 时退回标准 ASCII 分隔符。
  }

  if (options.mode === "currency" && options.currency) {
    try {
      const fmt = new Intl.NumberFormat(options.locale, {
        style: "currency",
        currency: options.currency,
      });
      const collectAffixes = (parts: Intl.NumberFormatPart[], includeSign: boolean) => {
        let lead = "";
        let tail = "";
        let seenDigits = false;
        for (const part of parts) {
          if (
            part.type === "integer" ||
            part.type === "fraction" ||
            part.type === "decimal" ||
            part.type === "group"
          ) {
            seenDigits = true;
            continue;
          }
          if (!includeSign && (part.type === "minusSign" || part.type === "plusSign")) {
            continue;
          }
          const val = part.type === "minusSign" ? "-" : part.value;
          if (!seenDigits) {
            lead += val;
          } else {
            tail += val;
          }
        }
        return { lead, tail };
      };
      const pos = collectAffixes(fmt.formatToParts(1), false);
      const neg = collectAffixes(fmt.formatToParts(-1), true);
      posLead = pos.lead;
      posTail = pos.tail;
      negLead = neg.lead.includes("-") ? neg.lead : `-${pos.lead}`;
      negTail = neg.tail;
    } catch {
      negLead = "-";
    }
  }

  const userPrefix = options.prefix ?? "";
  const userSuffix = options.suffix ?? "";

  return {
    group,
    decimal,
    affixPrefix: `${userPrefix}${posLead}`,
    affixSuffix: `${posTail}${userSuffix}`,
    negAffixPrefix: `${userPrefix}${negLead}`,
    negAffixSuffix: `${negTail}${userSuffix}`,
    zeroToNine,
    digitLookup,
  };
}

function formatPlainNumberNoExp(rounded: number): string {
  const str = String(rounded);
  if (!str.includes("e") && !str.includes("E")) {
    return str;
  }
  const decimals = countNumberDecimals(rounded);
  if (decimals > 0 && decimals <= 20) {
    return rounded.toFixed(decimals).replace(/\.?0+$/, (m) => (m.startsWith(".") ? "" : m));
  }
  return str;
}

export function formatCommittedNumber(
  val: number | null | undefined,
  options: NumberFormatOptions = {},
): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return "";
  }
  const effectiveMaxFrac = resolveEffectiveMaxFractionDigits(options);
  const rounded = roundNumberToPrecision(val, effectiveMaxFrac);
  let core: string;

  if (options.mode === "currency" && options.currency) {
    try {
      core = new Intl.NumberFormat(options.locale, {
        style: "currency",
        currency: options.currency,
        useGrouping: options.useGrouping !== false,
        minimumFractionDigits: options.minFractionDigits,
        maximumFractionDigits: options.maxFractionDigits,
      }).format(rounded);
    } catch {
      core = formatPlainNumberNoExp(rounded);
    }
  } else if (
    options.useGrouping === false &&
    options.minFractionDigits === undefined &&
    options.maxFractionDigits === undefined
  ) {
    core = formatPlainNumberNoExp(rounded);
  } else if (options.useGrouping === false && options.minFractionDigits !== undefined) {
    const maxFrac =
      options.maxFractionDigits !== undefined
        ? Math.max(options.minFractionDigits, options.maxFractionDigits)
        : Math.max(options.minFractionDigits, countNumberDecimals(rounded));
    core = rounded.toFixed(
      Math.min(20, Math.max(options.minFractionDigits, Math.min(maxFrac, countNumberDecimals(rounded)))),
    );
  } else if (options.useGrouping === false) {
    core = formatPlainNumberNoExp(rounded);
  } else {
    try {
      const minFrac = options.minFractionDigits;
      const maxFrac =
        options.maxFractionDigits ??
        (minFrac !== undefined ? Math.max(minFrac, 3) : Math.max(3, countNumberDecimals(rounded)));
      core = new Intl.NumberFormat(options.locale, {
        style: "decimal",
        useGrouping: true,
        minimumFractionDigits: minFrac,
        maximumFractionDigits: Math.min(20, maxFrac),
      }).format(rounded);
    } catch {
      core = formatPlainNumberNoExp(rounded);
    }
  }

  return `${options.prefix ?? ""}${core}${options.suffix ?? ""}`;
}

function isWhitespaceLike(ch: string): boolean {
  return ch === " " || ch === "\t" || ch === "\u00a0" || ch === "\u202f" || ch === "\u2009";
}

function stripAffixesOnce(
  raw: string,
  caret: number,
  seps: NumberSeparators,
): { core: string; caret: number; prefixUsed: string; suffixUsed: string } {
  // 优先匹配更长的负货币前后缀（如 "-$"），且前后缀各自最多剥离一次，防止数字前后缀二次误剥。
  if (
    seps.negAffixPrefix &&
    seps.negAffixPrefix !== "-" &&
    raw.startsWith(seps.negAffixPrefix)
  ) {
    const start = seps.negAffixPrefix.length;
    let end = raw.length;
    let suffixUsed = "";
    if (
      seps.negAffixSuffix &&
      end - start >= seps.negAffixSuffix.length &&
      raw.endsWith(seps.negAffixSuffix)
    ) {
      end -= seps.negAffixSuffix.length;
      suffixUsed = seps.negAffixSuffix;
    }
    const inner = raw.slice(start, end);
    const localCaret = Math.max(0, Math.min(inner.length, caret - start));
    return {
      core: `-${inner}`,
      caret: localCaret + 1,
      prefixUsed: seps.negAffixPrefix,
      suffixUsed,
    };
  }

  let start = 0;
  let end = raw.length;
  let prefixUsed = "";
  let suffixUsed = "";

  if (seps.affixPrefix && raw.startsWith(seps.affixPrefix)) {
    start = seps.affixPrefix.length;
    prefixUsed = seps.affixPrefix;
  } else if (optionsPrefixFallback(raw, seps)) {
    const trimmedLead = optionsPrefixFallback(raw, seps)!;
    start = trimmedLead.length;
    prefixUsed = trimmedLead;
  }

  if (seps.affixSuffix && end - start >= seps.affixSuffix.length && raw.endsWith(seps.affixSuffix)) {
    end -= seps.affixSuffix.length;
    suffixUsed = seps.affixSuffix;
  }

  const core = raw.slice(start, end);
  const clampedCaret = Math.max(0, Math.min(core.length, caret - start));
  return { core, caret: clampedCaret, prefixUsed, suffixUsed };
}

function optionsPrefixFallback(raw: string, seps: NumberSeparators): string | null {
  // 兼容 "-$1,234" 与 "$-1,234" 两种手输顺序（如用户先有 "$1,234" 后在数字前输入 "-"）。
  if (seps.affixPrefix && raw.startsWith(`-${seps.affixPrefix}`)) {
    return "";
  }
  return null;
}

interface ScannedCore {
  valid: boolean;
  sign: "" | "-" | "+";
  intDigits: string;
  hasDecimal: boolean;
  fracDigits: string;
  tokensBeforeCaret: number;
}

function scanCoreTokens(
  coreRaw: string,
  coreCaret: number,
  options: NumberFormatOptions,
  seps: NumberSeparators,
): ScannedCore {
  const allowDecimal = resolveEffectiveMaxFractionDigits(options) !== 0;
  let sign: "" | "-" | "+" = "";
  let intDigits = "";
  let hasDecimal = false;
  let fracDigits = "";
  let tokensBeforeCaret = 0;

  let i = 0;
  while (i < coreRaw.length) {
    const beforeCaret = i < coreCaret;

    // 多码元 group 分隔符优先整段匹配（仅允许出现在整数部分）。
    if (
      !hasDecimal &&
      seps.group &&
      seps.group !== seps.decimal &&
      coreRaw.startsWith(seps.group, i)
    ) {
      i += seps.group.length;
      continue;
    }

    if (seps.decimal && coreRaw.startsWith(seps.decimal, i)) {
      if (!allowDecimal || hasDecimal) {
        return { valid: false, sign, intDigits, hasDecimal, fracDigits, tokensBeforeCaret };
      }
      hasDecimal = true;
      if (beforeCaret) tokensBeforeCaret += 1;
      i += seps.decimal.length;
      continue;
    }

    const ch = coreRaw[i]!;

    if (ch === "-" || ch === "\u2212" || ch === "－" || ch === "+" || ch === "＋") {
      if (sign !== "" || intDigits !== "" || hasDecimal || fracDigits !== "") {
        return { valid: false, sign, intDigits, hasDecimal, fracDigits, tokensBeforeCaret };
      }
      sign = ch === "+" || ch === "＋" ? "+" : "-";
      if (beforeCaret) tokensBeforeCaret += 1;
      i += 1;
      continue;
    }

    const mappedDigit = seps.digitLookup.get(ch);
    if (mappedDigit !== undefined) {
      if (hasDecimal) {
        fracDigits += mappedDigit;
      } else {
        intDigits += mappedDigit;
      }
      if (beforeCaret) tokensBeforeCaret += 1;
      i += 1;
      continue;
    }

    // 兼容 ASCII '.' / 全角 '．' / 中文输入法句号 '。' 作为小数点（前提是 '.' 不是当前 locale 的千分位符）。
    if (ch === "." || ch === "．" || ch === "。") {
      if (ch === "." && seps.group === ".") {
        if (hasDecimal) {
          return { valid: false, sign, intDigits, hasDecimal, fracDigits, tokensBeforeCaret };
        }
        i += 1;
        continue;
      }
      if (!allowDecimal || hasDecimal) {
        return { valid: false, sign, intDigits, hasDecimal, fracDigits, tokensBeforeCaret };
      }
      hasDecimal = true;
      if (beforeCaret) tokensBeforeCaret += 1;
      i += 1;
      continue;
    }

    // 兼容 ASCII ',' / '_' / 各类空格作为分组符（前提是 ',' 不是当前 locale 的小数点，且仅限整数部分）。
    if (isWhitespaceLike(ch)) {
      if (!hasDecimal || coreRaw.slice(i).split("").every(isWhitespaceLike)) {
        i += 1;
        continue;
      }
      return { valid: false, sign, intDigits, hasDecimal, fracDigits, tokensBeforeCaret };
    }

    if (!hasDecimal && (ch === "_" || ((ch === "," || ch === "，") && seps.decimal !== ","))) {
      i += 1;
      continue;
    }

    if ((ch === "," || ch === "，") && seps.decimal === ",") {
      if (!allowDecimal || hasDecimal) {
        return { valid: false, sign, intDigits, hasDecimal, fracDigits, tokensBeforeCaret };
      }
      hasDecimal = true;
      if (beforeCaret) tokensBeforeCaret += 1;
      i += 1;
      continue;
    }

    return { valid: false, sign, intDigits, hasDecimal, fracDigits, tokensBeforeCaret };
  }

  // 超出 IEEE-754 安全整数范围的整数位直接视为非法词法，避免静默精度丢失。
  if (intDigits.length >= 16) {
    try {
      if (BigInt(intDigits) > BigInt(Number.MAX_SAFE_INTEGER)) {
        return { valid: false, sign, intDigits, hasDecimal, fracDigits, tokensBeforeCaret };
      }
    } catch {
      return { valid: false, sign, intDigits, hasDecimal, fracDigits, tokensBeforeCaret };
    }
  }

  return { valid: true, sign, intDigits, hasDecimal, fracDigits, tokensBeforeCaret };
}

export function parseNumberRaw(raw: string, options: NumberFormatOptions = {}): NumberParseResult {
  const seps = resolveNumberSeparators(options);
  let { core } = stripAffixesOnce(raw, raw.length, seps);

  // 兼容手输 "-$1,234"（当 affixPrefix 为 "$" 时）
  if (
    seps.affixPrefix &&
    (core.startsWith(`-${seps.affixPrefix}`) || core.startsWith(`\u2212${seps.affixPrefix}`))
  ) {
    core = `-${core.slice(1 + seps.affixPrefix.length)}`;
  }

  const trimmed = core.trim();
  if (trimmed === "") {
    return { kind: "empty", value: null };
  }

  const scanned = scanCoreTokens(trimmed, trimmed.length, { ...options, maxFractionDigits: undefined }, seps);
  if (!scanned.valid) {
    return { kind: "invalid", value: null };
  }

  if (scanned.intDigits === "" && scanned.fracDigits === "") {
    if (scanned.sign !== "" || scanned.hasDecimal) {
      return { kind: "incomplete", value: null };
    }
    return { kind: "empty", value: null };
  }

  const canonical = `${scanned.sign === "-" ? "-" : ""}${scanned.intDigits || "0"}${
    scanned.hasDecimal ? `.${scanned.fracDigits}` : ""
  }`;
  const num = Number(canonical);
  if (!Number.isFinite(num) || Math.abs(num) > Number.MAX_SAFE_INTEGER) {
    return { kind: "invalid", value: null };
  }
  return { kind: "number", value: normalizeNegativeZero(num) };
}

function localizeAsciiDigits(digits: string, zeroToNine: readonly string[]): string {
  if (zeroToNine === ASCII_DIGITS) return digits;
  let out = "";
  for (let i = 0; i < digits.length; i += 1) {
    const code = digits.charCodeAt(i) - 48;
    out += code >= 0 && code <= 9 ? zeroToNine[code]! : digits[i]!;
  }
  return out;
}

function formatGroupedIntegerDigits(
  intDigits: string,
  options: NumberFormatOptions,
  seps: NumberSeparators,
): string {
  if (!intDigits) return "";
  if (options.useGrouping === false || !seps.group) {
    return localizeAsciiDigits(intDigits, seps.zeroToNine);
  }
  try {
    const formatter = new Intl.NumberFormat(options.locale, {
      style: "decimal",
      useGrouping: true,
      maximumFractionDigits: 0,
    });
    if (intDigits[0] !== "0") {
      return formatter.format(BigInt(intDigits));
    }
    if (intDigits.length === 1) {
      return seps.zeroToNine[0]!;
    }
    // 首字符暂换为 1 借用 Intl 的真实分组宽度（兼容 en-IN 2-2-3 等），再换回本地 0 以保留前导零。
    const probe = formatter.format(BigInt(`1${intDigits.slice(1)}`));
    const oneGlyph = seps.zeroToNine[1]!;
    const zeroGlyph = seps.zeroToNine[0]!;
    const idx = probe.indexOf(oneGlyph);
    return idx === -1 ? probe : `${probe.slice(0, idx)}${zeroGlyph}${probe.slice(idx + oneGlyph.length)}`;
  } catch {
    const localized = localizeAsciiDigits(intDigits, seps.zeroToNine);
    return localized.replace(/\B(?=(?:.{3})+(?!.))/g, seps.group);
  }
}

export function isAllowedNumberInputText(
  data: string,
  options: NumberFormatOptions = {},
): boolean {
  if (!data) return true;
  const seps = resolveNumberSeparators(options);
  const allowDecimal = resolveEffectiveMaxFractionDigits(options) !== 0;

  let i = 0;
  while (i < data.length) {
    if (seps.group && seps.group !== seps.decimal && data.startsWith(seps.group, i)) {
      i += seps.group.length;
      continue;
    }
    if (seps.decimal && data.startsWith(seps.decimal, i)) {
      if (!allowDecimal) return false;
      i += seps.decimal.length;
      continue;
    }
    const ch = data[i]!;
    if (
      seps.digitLookup.has(ch) ||
      ch === "-" ||
      ch === "\u2212" ||
      ch === "－" ||
      ch === "+" ||
      ch === "＋" ||
      ch === "_" ||
      isWhitespaceLike(ch)
    ) {
      i += 1;
      continue;
    }
    if ((ch === "," || ch === "，") && seps.decimal !== ",") {
      i += 1;
      continue;
    }
    if ((ch === "," || ch === "，") && seps.decimal === ",") {
      if (!allowDecimal) return false;
      i += 1;
      continue;
    }
    if (ch === "." || ch === "．" || ch === "。") {
      if (ch === "." && seps.group === ".") {
        i += 1;
        continue;
      }
      if (!allowDecimal) return false;
      i += 1;
      continue;
    }
    return false;
  }
  return true;
}

function isLeadingSignChar(ch: string | undefined): boolean {
  return ch === "-" || ch === "\u2212" || ch === "－" || ch === "+" || ch === "＋";
}

function deleteLastDigitInCore(core: string, seps: NumberSeparators): string {
  for (let i = core.length - 1; i >= 0; i -= 1) {
    const ch = core[i]!;
    if (seps.digitLookup.has(ch) || isLeadingSignChar(ch) || (seps.decimal && core.startsWith(seps.decimal, i)) || ch === ".") {
      return `${core.slice(0, i)}${core.slice(i + 1)}`;
    }
  }
  return "";
}

function deleteFirstDigitInCore(core: string, seps: NumberSeparators): string {
  for (let i = 0; i < core.length; i += 1) {
    const ch = core[i]!;
    if (seps.digitLookup.has(ch) || isLeadingSignChar(ch) || (seps.decimal && core.startsWith(seps.decimal, i)) || ch === ".") {
      return `${core.slice(0, i)}${core.slice(i + 1)}`;
    }
  }
  return "";
}

export function mapSemanticCaretToFormattedText(
  formattedText: string,
  tokensBeforeCaret: number,
  options: NumberFormatOptions = {},
): number {
  const seps = resolveNumberSeparators(options);
  const stripped = stripAffixesOnce(formattedText, formattedText.length, seps);
  // stripAffixesOnce 对 negAffixPrefix 会在 core 前补 '-'，映射时按真实展示壳定位。
  const useNegShell =
    seps.negAffixPrefix &&
    seps.negAffixPrefix !== "-" &&
    formattedText.startsWith(seps.negAffixPrefix);
  const shellPrefix = useNegShell ? seps.negAffixPrefix : stripped.prefixUsed;
  const shellSuffix = useNegShell ? seps.negAffixSuffix : stripped.suffixUsed;
  const visibleCore = formattedText.slice(
    shellPrefix.length,
    formattedText.length - shellSuffix.length,
  );

  if (tokensBeforeCaret <= 0) {
    return shellPrefix.length;
  }

  let seenTokens = useNegShell ? 1 : 0;
  if (seenTokens >= tokensBeforeCaret) {
    return shellPrefix.length;
  }

  let j = 0;
  while (j < visibleCore.length) {
    if (
      options.useGrouping !== false &&
      seps.group &&
      seps.group !== seps.decimal &&
      visibleCore.startsWith(seps.group, j)
    ) {
      j += seps.group.length;
      continue;
    }
    if (seps.decimal && visibleCore.startsWith(seps.decimal, j)) {
      seenTokens += 1;
      j += seps.decimal.length;
      if (seenTokens >= tokensBeforeCaret) {
        return shellPrefix.length + j;
      }
      continue;
    }
    seenTokens += 1;
    j += 1;
    if (seenTokens >= tokensBeforeCaret) {
      return shellPrefix.length + j;
    }
  }

  return shellPrefix.length + visibleCore.length;
}

export function countSemanticTokensBeforeCaret(
  text: string,
  caret: number,
  options: NumberFormatOptions = {},
): number {
  const seps = resolveNumberSeparators(options);
  const stripped = stripAffixesOnce(text, caret, seps);
  const scanned = scanCoreTokens(stripped.core, stripped.caret, { ...options, maxFractionDigits: undefined }, seps);
  return scanned.tokensBeforeCaret;
}

export function reconcileNumberEdit(input: ReconcileNumberEditInput): ReconcileNumberEditResult {
  const options = input.options ?? {};
  const seps = resolveNumberSeparators(options);
  const rawText = input.rawText;
  const clampedRawCaret = Math.max(0, Math.min(rawText.length, input.rawCaret));

  const prevText = input.prevText;
  const hasPrevSel =
    prevText !== undefined &&
    input.prevSelectionStart !== undefined &&
    input.prevSelectionEnd !== undefined;
  const prevSelStart = hasPrevSel
    ? Math.max(0, Math.min(prevText.length, input.prevSelectionStart!))
    : undefined;
  const prevSelEnd = hasPrevSel
    ? Math.max(prevSelStart!, Math.min(prevText.length, input.prevSelectionEnd!))
    : undefined;
  const wasCollapsed = prevSelStart !== undefined && prevSelEnd !== undefined ? prevSelStart === prevSelEnd : true;

  let coreRaw: string;
  let coreCaret: number;

  if (prevText !== undefined && prevText !== "") {
    const prevUseNegShell =
      Boolean(seps.negAffixPrefix) &&
      seps.negAffixPrefix !== "-" &&
      prevText.startsWith(seps.negAffixPrefix);
    const prevStripped = stripAffixesOnce(prevText, prevText.length, seps);
    const prevPrefixLen = prevUseNegShell ? seps.negAffixPrefix.length : prevStripped.prefixUsed.length;
    const prevSuffixLen = prevUseNegShell ? seps.negAffixSuffix.length : prevStripped.suffixUsed.length;
    const prevVisibleCore = prevText.slice(prevPrefixLen, prevText.length - prevSuffixLen);

    const matchesSelectionDelta =
      prevSelStart !== undefined &&
      prevSelEnd !== undefined &&
      rawText.length >= prevSelStart + (prevText.length - prevSelEnd) &&
      rawText.startsWith(prevText.slice(0, prevSelStart)) &&
      rawText.endsWith(prevText.slice(prevSelEnd));

    if (matchesSelectionDelta && prevSelStart !== undefined && prevSelEnd !== undefined) {
      const inserted = rawText.slice(prevSelStart, rawText.length - (prevText.length - prevSelEnd));
      const vStart = Math.max(0, Math.min(prevVisibleCore.length, prevSelStart - prevPrefixLen));
      const vEnd = Math.max(vStart, Math.min(prevVisibleCore.length, prevSelEnd - prevPrefixLen));

      if (
        wasCollapsed &&
        input.inputType === "deleteContentBackward" &&
        prevSuffixLen > 0 &&
        prevSelStart > prevPrefixLen + prevVisibleCore.length &&
        inserted === ""
      ) {
        // 折叠光标在 suffix 内按 Backspace：删除数值末位。
        const shortened = deleteLastDigitInCore(prevVisibleCore, seps);
        coreRaw = prevUseNegShell && shortened !== "" ? `-${shortened}` : shortened;
        coreCaret = coreRaw.length;
      } else if (
        wasCollapsed &&
        input.inputType === "deleteContentForward" &&
        prevPrefixLen > 0 &&
        prevSelStart < prevPrefixLen &&
        inserted === ""
      ) {
        // 折叠光标在 prefix 内按 Delete：删除数值首位。
        const shortened = deleteFirstDigitInCore(prevVisibleCore, seps);
        coreRaw = prevUseNegShell && shortened !== "" ? `-${shortened}` : shortened;
        coreCaret = prevUseNegShell && shortened !== "" ? 1 : 0;
      } else if (
        wasCollapsed &&
        options.useGrouping !== false &&
        seps.group &&
        inserted === "" &&
        vEnd - vStart === seps.group.length &&
        prevVisibleCore.slice(vStart, vEnd) === seps.group
      ) {
        // 折叠光标紧贴千分位分隔符按 Backspace / Delete：跨过分隔符删除相邻数字。
        let nextVisible = `${prevVisibleCore.slice(0, vStart)}${prevVisibleCore.slice(vEnd)}`;
        let nextVCaret = vStart;
        if (
          input.inputType === "deleteContentBackward" &&
          vStart > 0 &&
          seps.digitLookup.has(nextVisible[vStart - 1]!)
        ) {
          nextVisible = `${nextVisible.slice(0, vStart - 1)}${nextVisible.slice(vStart)}`;
          nextVCaret = vStart - 1;
        } else if (
          input.inputType === "deleteContentForward" &&
          vStart < nextVisible.length &&
          seps.digitLookup.has(nextVisible[vStart]!)
        ) {
          nextVisible = `${nextVisible.slice(0, vStart)}${nextVisible.slice(vStart + 1)}`;
        }
        coreRaw = prevUseNegShell ? `-${nextVisible}` : nextVisible;
        coreCaret = prevUseNegShell ? nextVCaret + 1 : nextVCaret;
      } else {
        let nextVisible = `${prevVisibleCore.slice(0, vStart)}${inserted}${prevVisibleCore.slice(vEnd)}`;
        let nextVCaret = vStart + inserted.length;
        // 折叠或前部插入落在负号左侧（如 |-2,000,000 键入 5）时，将新数字放到负号右侧以保持负号语义不翻转。
        if (
          !prevUseNegShell &&
          vStart === 0 &&
          vEnd === 0 &&
          inserted.length > 0 &&
          isLeadingSignChar(prevVisibleCore[0]) &&
          !isLeadingSignChar(inserted[0])
        ) {
          const signChar = prevVisibleCore[0]!;
          nextVisible = `${signChar}${inserted}${prevVisibleCore.slice(1)}`;
          nextVCaret = 1 + inserted.length;
        }
        coreRaw = prevUseNegShell ? `-${nextVisible}` : nextVisible;
        coreCaret = prevUseNegShell ? nextVCaret + 1 : nextVCaret;
      }
    } else {
      // 未捕获选区（如单测直接赋值 el.value 派发 input）：走常规去壳 + 折叠相邻差分推断。
      const stripped = stripAffixesOnce(rawText, clampedRawCaret, seps);
      coreRaw = stripped.core;
      coreCaret = stripped.caret;

      if (
        wasCollapsed &&
        input.inputType === "deleteContentBackward" &&
        prevSuffixLen > 0 &&
        prevText.endsWith(prevStripped.suffixUsed || seps.negAffixSuffix) &&
        rawText.length < prevText.length &&
        prevText.startsWith(rawText) &&
        rawText.length >= prevPrefixLen + prevVisibleCore.length
      ) {
        const shortened = deleteLastDigitInCore(prevVisibleCore, seps);
        coreRaw = prevUseNegShell && shortened !== "" ? `-${shortened}` : shortened;
        coreCaret = coreRaw.length;
      } else if (
        wasCollapsed &&
        input.inputType === "deleteContentForward" &&
        prevPrefixLen > 0 &&
        rawText.length < prevText.length &&
        prevText.endsWith(rawText) &&
        rawText.length >= prevVisibleCore.length + prevSuffixLen
      ) {
        const shortened = deleteFirstDigitInCore(prevVisibleCore, seps);
        coreRaw = prevUseNegShell && shortened !== "" ? `-${shortened}` : shortened;
        coreCaret = prevUseNegShell && shortened !== "" ? 1 : 0;
      } else if (
        wasCollapsed &&
        options.useGrouping !== false &&
        seps.group &&
        prevStripped.core.length === coreRaw.length + seps.group.length &&
        prevStripped.core.startsWith(seps.group, coreCaret) &&
        prevStripped.core.slice(0, coreCaret) === coreRaw.slice(0, coreCaret) &&
        prevStripped.core.slice(coreCaret + seps.group.length) === coreRaw.slice(coreCaret)
      ) {
        if (
          input.inputType === "deleteContentBackward" &&
          coreCaret > 0 &&
          seps.digitLookup.has(coreRaw[coreCaret - 1]!)
        ) {
          coreRaw = `${coreRaw.slice(0, coreCaret - 1)}${coreRaw.slice(coreCaret)}`;
          coreCaret -= 1;
        } else if (
          input.inputType === "deleteContentForward" &&
          coreCaret < coreRaw.length &&
          seps.digitLookup.has(coreRaw[coreCaret]!)
        ) {
          coreRaw = `${coreRaw.slice(0, coreCaret)}${coreRaw.slice(coreCaret + 1)}`;
        }
      } else if (
        isLeadingSignChar(prevStripped.core[0]) &&
        coreRaw.endsWith(prevStripped.core) &&
        coreRaw.length > prevStripped.core.length
      ) {
        const ins = coreRaw.slice(0, coreRaw.length - prevStripped.core.length);
        if (!isLeadingSignChar(ins[0])) {
          coreRaw = `${prevStripped.core[0]!}${ins}${prevStripped.core.slice(1)}`;
          coreCaret = 1 + ins.length;
        }
      }
    }
  } else {
    const stripped = stripAffixesOnce(rawText, clampedRawCaret, seps);
    coreRaw = stripped.core;
    coreCaret = stripped.caret;
  }

  const scanned = scanCoreTokens(coreRaw, coreCaret, options, seps);
  if (!scanned.valid) {
    if (prevText !== undefined) {
      const fallbackCaret = prevSelEnd ?? prevSelStart ?? prevText.length;
      return {
        text: prevText,
        caret: Math.max(0, Math.min(prevText.length, fallbackCaret)),
        parsed: parseNumberRaw(prevText, options),
        rejected: true,
      };
    }
    return {
      text: "",
      caret: 0,
      parsed: { kind: "empty", value: null },
      rejected: true,
    };
  }

  if (scanned.sign === "" && scanned.intDigits === "" && !scanned.hasDecimal && scanned.fracDigits === "") {
    return {
      text: "",
      caret: 0,
      parsed: { kind: "empty", value: null },
    };
  }

  const groupedInt = formatGroupedIntegerDigits(scanned.intDigits, options, seps);
  const localizedFrac = localizeAsciiDigits(scanned.fracDigits, seps.zeroToNine);
  const useNegCurrencyShell =
    scanned.sign === "-" &&
    Boolean(seps.negAffixPrefix) &&
    seps.negAffixPrefix !== "-";

  const visibleSign = useNegCurrencyShell ? "" : scanned.sign;
  const formattedCore = `${visibleSign}${groupedInt}${
    scanned.hasDecimal ? `${seps.decimal}${localizedFrac}` : ""
  }`;
  const outPrefix = useNegCurrencyShell ? seps.negAffixPrefix : seps.affixPrefix;
  const outSuffix = useNegCurrencyShell ? seps.negAffixSuffix : seps.affixSuffix;
  const fullText = `${outPrefix}${formattedCore}${outSuffix}`;

  const nextCaret = mapSemanticCaretToFormattedText(fullText, scanned.tokensBeforeCaret, options);
  const parsed = parseNumberRaw(fullText, options);

  return {
    text: fullText,
    caret: nextCaret,
    parsed,
  };
}
