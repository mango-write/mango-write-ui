/**
 * MangoWrite UI · WXSS Token 编译管线（var.css + mobile-tokens.css -> mp-tokens.wxss / mp-tokens.css）
 *
 * 五项核心契约（DESIGN.md & DESIGN-MOBILE.md）：
 * 1. 一核双翼合并：读取 Core `var.css`（色板 ①、基础刻度 ②、语义色 ③、派生色 ④、业务域 ⑤）与
 *    Mobile `mobile-tokens.css`（移动端触控尺寸轴 28/36/44/48px、掌上排版阶梯、悬浮胶囊与内缩抽屉几何），
 *    在 `.mw-mp-root` / `page` 作用域下将 `--size-xs/sm/md/lg-*` 与 `--control-*` 映射至移动端触控尺寸轴。
 * 2. WXSS 与 CSS 严禁污染桌面端全局 `:root`：WXSS 仅输出 `page`、`.mw-mp-root`、`.mw-theme-light`、`.mw-theme-dark`；
 *    CSS 作用域同样锁定在 `page` 与 `.mw-mp-root`（含 `.mw-mp-root[data-theme="light|dark"]`）内，供 H5 与展示站双端同屏对照使用而不污染 PC 组件。
 * 3. 样式隔离与挂载契约：配合 `MpThemeProvider`（同时挂载 `.mw-mp-root`、`.mw-theme-light|dark` 与 `data-theme`）
 *    与组件 `styleIsolation: "shared"`，确保 CSS 自定义属性在微信小程序自定义组件树内穿透生效。
 * 4. `color-mix` 与 RGB 三元组静态烘焙：在构建期按 light / dark 双主题分别解析并烘焙为标准
 *    `rgba(r, g, b, a)`，同步写入深色作用域与 `@media (prefers-color-scheme: dark)`。
 * 5. 渲染引擎兼容边界：剔除 ⑥ Legacy 历史映射；将 `oklch()` 与多段 `linear()` 弹簧函数转换为
 *    WebView 与 Skyline 双引擎兼容的十六进制/RGBA 与 `cubic-bezier()`（最低基础库 >= 2.25.0）。
 */

export interface CompiledMpTokens {
  wxss: string;
  css: string;
  stats: {
    scaleCount: number;
    mobileTokenCount: number;
    lightCount: number;
    darkCount: number;
    derivedCount: number;
    domainCount: number;
  };
}

const OKLCH_FALLBACKS: Record<string, string> = {
  "oklch(0.938 0.012 74)": "#ebe6df",
  "oklch(0.96 0.04 50)": "#fceee2",
};

const SPRING_FALLBACKS: Record<string, string> = {
  "--ease-spring-snap": "cubic-bezier(0.236, 0.618, 0.382, 1)",
  "--ease-spring-pop": "cubic-bezier(0.16, 1, 0.3, 1)",
};

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function extractDeclarations(blockBody: string): Map<string, string> {
  const map = new Map<string, string>();
  const clean = stripComments(blockBody);
  const regex = /(--[a-zA-Z0-9-]+)\s*:\s*([\s\S]*?);/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(clean)) !== null) {
    const key = match[1]!.trim();
    const val = match[2]!.replace(/\s+/g, " ").trim();
    map.set(key, val);
  }
  return map;
}

function extractCssRuleBlocks(
  css: string,
): Array<{ selector: string; declarations: Map<string, string> }> {
  const clean = stripComments(css);
  const blocks: Array<{ selector: string; declarations: Map<string, string> }> = [];
  const blockRegex = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(clean)) !== null) {
    const selector = match[1]!.trim();
    const declarations = extractDeclarations(match[2]!);
    if (selector && declarations.size > 0) {
      blocks.push({ selector, declarations });
    }
  }
  return blocks;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    const r = parseInt(clean[0]! + clean[0]!, 16);
    const g = parseInt(clean[1]! + clean[1]!, 16);
    const b = parseInt(clean[2]! + clean[2]!, 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

function formatAlpha(alpha: number): string {
  return Number(alpha.toFixed(4)).toString();
}

function resolveVarChain(
  token: string,
  themeVars: Map<string, string>,
  fallbackVars: Map<string, string>,
  depth = 0,
): string | undefined {
  if (depth > 8) return undefined;
  const raw = themeVars.get(token) ?? fallbackVars.get(token);
  if (!raw) return undefined;
  const varMatch = /^var\(\s*(--[a-zA-Z0-9-]+)\s*\)$/.exec(raw.trim());
  if (varMatch) {
    return resolveVarChain(varMatch[1]!, themeVars, fallbackVars, depth + 1);
  }
  return raw;
}

function normalizeCssValue(
  key: string,
  rawValue: string,
  themeVars: Map<string, string>,
  fallbackVars: Map<string, string>,
): string {
  if (key in SPRING_FALLBACKS) {
    return SPRING_FALLBACKS[key]!;
  }

  let value = rawValue;

  for (const [oklchLiteral, hexFallback] of Object.entries(OKLCH_FALLBACKS)) {
    value = value.split(oklchLiteral).join(hexFallback);
  }

  // Bake color-mix(in srgb, var(--token) P%, transparent)
  value = value.replace(
    /color-mix\(\s*in\s+srgb\s*,\s*var\(\s*(--[a-zA-Z0-9-]+)\s*\)\s+(\d+(?:\.\d+)?)%\s*,\s*transparent\s*\)/g,
    (_m, varName: string, pctStr: string) => {
      const resolved = resolveVarChain(varName, themeVars, fallbackVars);
      if (resolved) {
        const rgb = hexToRgb(resolved);
        if (rgb) {
          const alpha = formatAlpha(Number(pctStr) / 100);
          return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
        }
      }
      return _m;
    },
  );

  // Bake rgb(var(--*-rgb) / alpha)
  value = value.replace(
    /rgb\(\s*var\(\s*(--[a-zA-Z0-9-]+)\s*\)\s*\/\s*([0-9.]+)\s*\)/g,
    (_m, varName: string, alphaStr: string) => {
      const resolved = resolveVarChain(varName, themeVars, fallbackVars);
      if (resolved && /^\d+\s+\d+\s+\d+$/.test(resolved.trim())) {
        const parts = resolved.trim().split(/\s+/);
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${formatAlpha(Number(alphaStr))})`;
      }
      return _m;
    },
  );

  // Convert literal rgb(R G B / A) to rgba(R, G, B, A)
  value = value.replace(
    /rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*([0-9.]+)\s*\)/g,
    (_m, r: string, g: string, b: string, a: string) =>
      `rgba(${r}, ${g}, ${b}, ${formatAlpha(Number(a))})`,
  );

  // Convert literal rgb(R G B) to rgb(R, G, B)
  value = value.replace(
    /rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\)/g,
    (_m, r: string, g: string, b: string) => `rgb(${r}, ${g}, ${b})`,
  );

  return value;
}

function formatBlock(selector: string, entries: Iterable<[string, string]>, indent = ""): string {
  const lines: string[] = [];
  for (const [k, v] of entries) {
    lines.push(`${indent}  ${k}: ${v};`);
  }
  if (lines.length === 0) return "";
  return `${indent}${selector} {\n${lines.join("\n")}\n${indent}}`;
}

export function compileWxssTokens(
  varCssContent: string,
  mobileTokensCssContent = "",
): CompiledMpTokens {
  // Strip section ⑥ Legacy
  const legacyMarker = varCssContent.indexOf("/* ⑥ Legacy");
  const withoutLegacy =
    legacyMarker >= 0 ? varCssContent.slice(0, legacyMarker) : varCssContent;

  const s1Idx = withoutLegacy.indexOf("/* ① Palette");
  const s2Idx = withoutLegacy.indexOf("/* ② Scale");
  const s3LightIdx = withoutLegacy.indexOf("/* ③ Semantic · 浅色基值");
  const s3DarkIdx = withoutLegacy.indexOf("/* ③ Semantic · 深色覆盖");
  const s4DerivedIdx = withoutLegacy.indexOf("/* ④ Derived");
  const s5DomainIdx = withoutLegacy.indexOf("/* ⑤ Domain");

  if (
    s1Idx < 0 ||
    s2Idx < 0 ||
    s3LightIdx < 0 ||
    s3DarkIdx < 0 ||
    s4DerivedIdx < 0 ||
    s5DomainIdx < 0
  ) {
    throw new Error("var.css structure markers missing; cannot compile mp-tokens.wxss");
  }

  const paletteMap = extractDeclarations(withoutLegacy.slice(s1Idx, s2Idx));
  const scaleSection = withoutLegacy.slice(s2Idx, s3LightIdx);
  const scaleMediaIdx = scaleSection.indexOf("@media");
  const scaleBaseBody = scaleMediaIdx >= 0 ? scaleSection.slice(0, scaleMediaIdx) : scaleSection;
  const scaleMap = extractDeclarations(scaleBaseBody);

  // Extract mobile tokens (page, .mw-mp-root block) & mobile size-axis remapping (.mw-mp-root block) by CSS selector
  const mobileSpecificTokens = new Map<string, string>();
  const mobileScopeOverrides = new Map<string, string>();
  const mobileDarkOverrides = new Map<string, string>();
  if (mobileTokensCssContent) {
    for (const block of extractCssRuleBlocks(mobileTokensCssContent)) {
      const selectors = block.selector.split(",").map((s) => s.trim());
      if (selectors.some((s) => s.includes("mw-theme-dark"))) {
        for (const [k, v] of block.declarations) mobileDarkOverrides.set(k, v);
      } else if (selectors.includes("page") || selectors.includes(":root")) {
        for (const [k, v] of block.declarations) mobileSpecificTokens.set(k, v);
      } else if (selectors.includes(".mw-mp-root")) {
        for (const [k, v] of block.declarations) mobileScopeOverrides.set(k, v);
      }
    }
  }

  const lightSemanticMap = extractDeclarations(withoutLegacy.slice(s3LightIdx, s3DarkIdx));

  const darkSection = withoutLegacy.slice(s3DarkIdx, s4DerivedIdx);
  const darkMediaIdx = darkSection.indexOf("@media");
  const darkExplicitBody = darkMediaIdx >= 0 ? darkSection.slice(0, darkMediaIdx) : darkSection;
  const darkSemanticMap = new Map<string, string>([
    ...extractDeclarations(darkExplicitBody),
    ...mobileDarkOverrides,
  ]);

  const derivedRawMap = extractDeclarations(withoutLegacy.slice(s4DerivedIdx, s5DomainIdx));
  const domainRawMap = extractDeclarations(withoutLegacy.slice(s5DomainIdx));

  // Build lookup tables for light and dark
  const baseLookup = new Map<string, string>([
    ...paletteMap,
    ...scaleMap,
    ...mobileSpecificTokens,
  ]);
  const lightLookup = new Map<string, string>([...baseLookup, ...lightSemanticMap]);
  const darkLookup = new Map<string, string>([
    ...baseLookup,
    ...lightSemanticMap,
    ...darkSemanticMap,
  ]);

  // Normalize base & scale + mobile tokens
  const normalizedBase = new Map<string, string>();
  for (const [k, v] of [...paletteMap, ...scaleMap, ...mobileSpecificTokens]) {
    normalizedBase.set(k, normalizeCssValue(k, v, lightLookup, baseLookup));
  }

  // Normalize light semantic + derived + domain
  const normalizedLight = new Map<string, string>();
  for (const [k, v] of lightSemanticMap) {
    const nv = normalizeCssValue(k, v, lightLookup, baseLookup);
    normalizedLight.set(k, nv);
    lightLookup.set(k, nv);
  }
  for (const [k, v] of [...derivedRawMap, ...domainRawMap]) {
    const nv = normalizeCssValue(k, v, lightLookup, baseLookup);
    normalizedLight.set(k, nv);
    lightLookup.set(k, nv);
  }

  // Normalize dark semantic + derived + domain
  const normalizedDark = new Map<string, string>();
  for (const [k, v] of darkSemanticMap) {
    const nv = normalizeCssValue(k, v, darkLookup, lightLookup);
    normalizedDark.set(k, nv);
    darkLookup.set(k, nv);
  }
  for (const [k, v] of [...derivedRawMap, ...domainRawMap]) {
    const nv = normalizeCssValue(k, v, darkLookup, lightLookup);
    darkLookup.set(k, nv);
    if (nv !== normalizedLight.get(k)) {
      normalizedDark.set(k, nv);
    }
  }

  const header = [
    "/* AUTO-GENERATED FROM @mango-write/ui-core/{var,mobile-tokens}.css — DO NOT EDIT MANUALLY.",
    " * Target: WeChat Mini Program (WebView + Skyline compatible subset, base library >= 2.25.0) & uni-app H5.",
    " * Contracts:",
    " *   1. Theme scopes: page, .mw-mp-root, .mw-theme-light, .mw-theme-dark.",
    " *   2. Touch Size Axis: .mw-mp-root maps xs/sm/md/lg to 28/36/44/48px and 15px default body typography.",
    " *   3. Static baking: color-mix & rgb-triplet expressions are statically baked per theme (light/dark).",
    " */",
  ].join("\n");

  const cssBlocks = [
    header,
    "/* ① Palette · ② Core Scale · Mobile Tokens (--mp-*) */",
    formatBlock("page,\n.mw-mp-root", normalizedBase),
    ...(mobileScopeOverrides.size > 0
      ? [
          "/* ②b Mobile Touch Size Axis Remap (.mw-mp-root) */",
          formatBlock("page,\n.mw-mp-root", mobileScopeOverrides),
        ]
      : []),
    "/* ③ Semantic + ④ Derived + ⑤ Domain (Light Default & Explicit Light Scope) */",
    formatBlock(
      'page,\n.mw-mp-root,\n.mw-mp-root[data-theme="light"],\n.mw-mp-root.mw-theme-light',
      normalizedLight,
    ),
    "/* ③ Semantic + ④ Derived + ⑤ Domain (Explicit Dark Scope) */",
    formatBlock(
      'page[data-theme="dark"],\npage.mw-theme-dark,\n.mw-mp-root[data-theme="dark"],\n.mw-mp-root.mw-theme-dark',
      normalizedDark,
    ),
    "/* ③ Semantic + ④ Derived + ⑤ Domain (System Dark Fallback) */",
    `@media (prefers-color-scheme: dark) {\n${formatBlock(
      'page:not([data-theme="light"]):not(.mw-theme-light),\n  .mw-mp-root:not([data-theme="light"]):not(.mw-theme-light)',
      normalizedDark,
      "  ",
    )}\n}`,
  ];

  // WXSS uses pure tag/class selectors (no `:root`, no `[data-theme]` attribute selectors)
  const wxssBaseAndMobile = new Map<string, string>([
    ...normalizedBase,
    ...mobileScopeOverrides,
  ]);
  const wxssBlocks = [
    header,
    "/* ① Palette · ② Scale · Mobile Touch Size Axis (page, .mw-mp-root) */",
    formatBlock("page,\n.mw-mp-root", wxssBaseAndMobile),
    "/* ③ Semantic + ④ Derived + ⑤ Domain (Light Default & .mw-theme-light) */",
    formatBlock("page,\n.mw-mp-root,\n.mw-theme-light", normalizedLight),
    "/* ③ Semantic + ④ Derived + ⑤ Domain (.mw-theme-dark) */",
    formatBlock("page.mw-theme-dark,\n.mw-mp-root.mw-theme-dark,\n.mw-theme-dark", normalizedDark),
    "/* ③ Semantic + ④ Derived + ⑤ Domain (System Dark Fallback) */",
    `@media (prefers-color-scheme: dark) {\n${formatBlock(
      "page:not(.mw-theme-light),\n  .mw-mp-root:not(.mw-theme-light)",
      normalizedDark,
      "  ",
    )}\n}`,
  ];

  return {
    wxss: `${wxssBlocks.join("\n\n")}\n`,
    css: `${cssBlocks.join("\n\n")}\n`,
    stats: {
      scaleCount: normalizedBase.size,
      mobileTokenCount: mobileSpecificTokens.size,
      lightCount: lightSemanticMap.size,
      darkCount: darkSemanticMap.size,
      derivedCount: derivedRawMap.size,
      domainCount: domainRawMap.size,
    },
  };
}
