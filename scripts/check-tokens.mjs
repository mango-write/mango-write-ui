#!/usr/bin/env node
// 设计 token 门禁：组件只许读 var.css 的 Scale / Semantic / Derived / Domain 层与本组件 --mw-* 局部变量。
// 规则与理由见 ../DESIGN.md「门禁」。CLI：node scripts/check-tokens.mjs；vitest 经 check-tokens.test.ts 调用。
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const coreSrc = join(root, "packages", "core", "src");
const vueSrc = join(root, "packages", "vue", "src");
const mpSrc = join(root, "packages", "mp", "src");

const FLOATING = new Set([
  "ActionMenu", "AsyncSearchSelect", "ColorPicker", "ConfirmHost", "DatePicker", "Dialog",
  "HoverCard", "Menu", "MultiSelect", "Popover", "SearchableMultiSelect", "SearchableSelect",
  "Select", "ToastHost", "UserSelect", "popover",
]);
const OPAQUE_BG = /var\(--bg-(surface|raised|sunken|canvas)\)/;
const RAW_CHECKED_PROPS =
  /^(padding|padding-[a-z-]+|margin|margin-[a-z-]+|gap|row-gap|column-gap|border-radius|border-[a-z-]*-radius|font-size|line-height|letter-spacing|box-shadow|outline-offset|font-weight|transition|transition-duration|transition-delay|animation|animation-duration)$/;
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(\s*\d|\bhsla?\(|\boklch\(|\b(?:white|black)\b/;
const ALLOWED_EXTERNAL = [/^--reka-/, /^--radix-/, /^--tw-/];
const PI_ICON = /\bpi-[a-z0-9-]+\b|\bprimeicons\b/;

export function scanPiIcons(file, text) {
  const out = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(PI_ICON);
    if (m) out.push({ file, line: i + 1, rule: "no-pi-icon", detail: m[0] });
  }
  return out;
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

function styleBlocks(file) {
  const text = readFileSync(file, "utf8");
  if (!file.endsWith(".vue")) return [{ css: text, offset: 0 }];
  const blocks = [];
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/g;
  let m;
  while ((m = re.exec(text))) {
    const offset = text.slice(0, m.index + m[0].indexOf(">") + 1).split("\n").length - 1;
    blocks.push({ css: m[1], offset });
  }
  return blocks;
}

function declarations(css) {
  const out = [];
  const text = stripComments(css);
  let chunkStart = 0;
  for (let i = 0; i <= text.length; i += 1) {
    const ch = text[i];
    if (ch !== ";" && ch !== "{" && ch !== "}" && i !== text.length) continue;
    const chunk = text.slice(chunkStart, i);
    const lead = chunk.length - chunk.trimStart().length;
    const line = text.slice(0, chunkStart + lead).split("\n").length - 1;
    chunkStart = i + 1;
    const colon = chunk.indexOf(":");
    if (colon <= 0) continue;
    const prop = chunk.slice(0, colon).trim();
    if (/^-?-?[a-z][a-z0-9-]*$/i.test(prop)) {
      out.push({ prop, value: chunk.slice(colon + 1).trim(), line });
    }
  }
  return out;
}

function stripVar(value) {
  let prev;
  let next = value;
  do {
    prev = next;
    next = next.replace(/var\([^()]*\)/g, "");
  } while (next !== prev);
  return next;
}

export function checkTokens() {
  const varCss = readFileSync(join(coreSrc, "var.css"), "utf8");
  const legacyBody = varCss.slice(varCss.indexOf("@legacy-start"), varCss.indexOf("@legacy-end"));
  const legacy = new Set([...legacyBody.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  for (const m of varCss.matchAll(/(--color-[a-z0-9-]+-rgb)\s*:/g)) {
    if (!m[1].startsWith("--color-mark-") && !m[1].startsWith("--color-annotation-")) legacy.add(m[1]);
  }

  const coreComponentCssFiles = walk(join(coreSrc, "styles", "components")).filter((f) => f.endsWith(".css"));
  const vueComponentFiles = walk(join(vueSrc, "components")).filter((f) => f.endsWith(".vue"));
  const mpComponentCssFile = join(mpSrc, "styles", "mp-components.css");
  const mpSubComponentCssFiles = walk(join(mpSrc, "styles", "components")).filter((f) => f.endsWith(".css"));
  const mpBaseCssFile = join(mpSrc, "styles", "mp-base.css");
  const mobileTokensCssFile = join(coreSrc, "mobile-tokens.css");
  const mpComponentFiles = [
    ...(existsSync(mpComponentCssFile) ? [mpComponentCssFile] : []),
    ...mpSubComponentCssFiles,
    ...walk(join(mpSrc, "components")).filter((f) => f.endsWith(".vue")),
  ];
  const componentFiles = [...coreComponentCssFiles, ...vueComponentFiles, ...mpComponentFiles];
  const baseCssFiles = [
    join(coreSrc, "base.css"),
    ...(existsSync(mpBaseCssFile) ? [mpBaseCssFile] : []),
  ];
  const desktopFiles = new Set([
    join(coreSrc, "var.css"),
    join(coreSrc, "base.css"),
    join(coreSrc, "components.css"),
    ...coreComponentCssFiles,
    ...vueComponentFiles,
  ]);
  const mobileSourceFiles = [
    ...(existsSync(mobileTokensCssFile) ? [mobileTokensCssFile] : []),
    ...(existsSync(mpBaseCssFile) ? [mpBaseCssFile] : []),
    ...mpComponentFiles,
  ];
  const desktopDefined = new Set();
  for (const file of desktopFiles) {
    for (const { css } of styleBlocks(file)) {
      for (const m of stripComments(css).matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) desktopDefined.add(m[1]);
    }
  }
  const mobileDefined = new Set(desktopDefined);
  for (const file of mobileSourceFiles) {
    for (const { css } of styleBlocks(file)) {
      for (const m of stripComments(css).matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) mobileDefined.add(m[1]);
    }
  }

  const violations = [];
  const report = (file, line, rule, detail) =>
    violations.push({ file: relative(root, file), line: line + 1, rule, detail });

  const mobileStyleFiles = [
    ...(existsSync(mobileTokensCssFile) ? [mobileTokensCssFile] : []),
    ...(existsSync(mpBaseCssFile) ? [mpBaseCssFile] : []),
    ...(existsSync(mpComponentCssFile) ? [mpComponentCssFile] : []),
    ...mpSubComponentCssFiles,
  ];
  for (const file of mobileStyleFiles) {
    const clean = stripComments(readFileSync(file, "utf8"));
    for (const m of clean.matchAll(/([^{};]+)\{/g)) {
      const rawSelector = m[1].trim();
      if (!rawSelector || rawSelector.startsWith("@") || /^(from|to|\d+%)$/.test(rawSelector)) continue;
      const line = clean.slice(0, m.index + (m[1].length - m[1].trimStart().length)).split("\n").length - 1;
      for (const part of rawSelector.split(",").map((s) => s.trim()).filter(Boolean)) {
        if (/(^|[^\w-]):root\b/.test(part) || !/^(page\b|\.mw-mp-root\b|\.mw-mp-[a-z0-9-])/.test(part)) {
          report(file, line, "mobile-scope-leak", `${part}（移动端样式必须限定在 page / .mw-mp-root / .mw-mp-* 作用域内）`);
        }
      }
    }
  }

  for (const file of [...baseCssFiles, join(coreSrc, "components.css"), ...componentFiles]) {
    const isDesktop = desktopFiles.has(file);
    const activeDefined = isDesktop ? desktopDefined : mobileDefined;
    const isComponent = !baseCssFiles.includes(file);
    const isComponentCssOrVue =
      file.endsWith(".vue") ||
      coreComponentCssFiles.includes(file) ||
      file === mpComponentCssFile ||
      mpSubComponentCssFiles.includes(file);
    const name = file.split("/").pop().replace(/\.(vue|css)$/, "");
    for (const { css, offset } of styleBlocks(file)) {
      for (const { prop, value, line } of declarations(css)) {
        const at = offset + line;
        if (prop.startsWith("--") && isComponent && isComponentCssOrVue && !prop.startsWith("--mw-") && !prop.startsWith("--control-")) {
          report(file, at, "local-token-prefix", `${prop}（组件内局部变量必须以 --mw- 开头）`);
        }
        for (const m of value.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*(,?)/g)) {
          const token = m[1];
          if (ALLOWED_EXTERNAL.some((re) => re.test(token))) continue;
          if (token.startsWith("--mw-") && m[2] === ",") continue;
          if (isDesktop && (token.startsWith("--mp-") || token.startsWith("--mw-mp-"))) {
            report(file, at, "mobile-token-in-desktop", token);
          } else if (!activeDefined.has(token)) report(file, at, "undefined-token", token);
          else if (legacy.has(token)) report(file, at, "legacy-token", token);
          else if (isComponent && token.startsWith("--palette-")) report(file, at, "palette-in-component", token);
        }
        if (!isComponent) continue;
        if (!prop.startsWith("--") && COLOR_LITERAL.test(stripVar(value))) {
          report(file, at, "color-literal", `${prop}: ${value}`);
        }
        if (RAW_CHECKED_PROPS.test(prop)) {
          const bare = stripVar(value);
          const lengths = [...bare.matchAll(/(?<![\w.-])(-?\d*\.?\d+)(px|rem|em)\b/g)]
            .filter(([, n, unit]) => !(unit === "px" && Math.abs(Number(n)) <= 1) && Number(n) !== 0);
          if (lengths.length && !/^(transition|animation)/.test(prop)) {
            report(file, at, "raw-length", `${prop}: ${value}`);
          }
          if (/^(transition|animation)/.test(prop) && /(?<![\w.-])\d*\.?\d+m?s\b/.test(bare)) {
            report(file, at, "raw-duration", `${prop}: ${value}`);
          }
          if (prop === "font-weight" && /\d/.test(bare)) report(file, at, "raw-font-weight", value);
        }
        if (prop === "z-index" && /^-?\d+$/.test(value) && Math.abs(Number(value)) > 10) {
          report(file, at, "raw-z-index", value);
        }
        if (FLOATING.has(name) && /^background/.test(prop) && OPAQUE_BG.test(value)) {
          const src = readFileSync(file, "utf8").split("\n")[at] ?? "";
          if (!src.includes("opaque-ok")) report(file, at, "opaque-in-frost", `${prop}: ${value}`);
        }
      }
    }
  }
  for (const file of [join(coreSrc, "components.css"), ...coreComponentCssFiles, ...mpComponentFiles, ...walk(join(vueSrc, "components"))]) {
    violations.push(...scanPiIcons(relative(root, file), readFileSync(file, "utf8")));
  }
  return violations;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const violations = checkTokens();
  const byRule = new Map();
  for (const v of violations) byRule.set(v.rule, (byRule.get(v.rule) ?? 0) + 1);
  const filter = process.argv[2];
  for (const v of violations) {
    if (filter && !v.file.includes(filter)) continue;
    console.log(`${v.file}:${v.line}  ${v.rule}  ${v.detail}`);
  }
  console.log(`\n${violations.length} violations`, Object.fromEntries(byRule));
  process.exit(violations.length ? 1 : 0);
}
