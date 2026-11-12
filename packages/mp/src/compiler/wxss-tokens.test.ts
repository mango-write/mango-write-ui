import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compileWxssTokens } from "./wxss-tokens.js";

const here = dirname(fileURLToPath(import.meta.url));
const varCssPath = join(here, "../../../core/src/var.css");
const mobileTokensCssPath = join(here, "../../../core/src/mobile-tokens.css");
const varCss = readFileSync(varCssPath, "utf8");
const mobileTokensCss = readFileSync(mobileTokensCssPath, "utf8");

describe("compileWxssTokens (var.css + mobile-tokens.css -> mp-tokens.wxss)", () => {
  const result = compileWxssTokens(varCss, mobileTokensCss);

  it("strips :root, attribute selectors [...], oklch(), linear(), color-mix(), and ⑥ Legacy tokens in WXSS output", () => {
    expect(result.wxss).not.toMatch(/:root\b/);
    expect(result.wxss).not.toMatch(/\[data-theme/);
    expect(result.wxss).not.toContain("color-mix(");
    expect(result.wxss).not.toContain("oklch(");
    expect(result.wxss).not.toMatch(/\blinear\(/);
    expect(result.wxss).not.toContain("--mango-color-primary:");
    expect(result.wxss).not.toContain("--color-brand-50:");
  });

  it("uses pure WXSS class/tag selectors in .wxss and scopes .css to page / .mw-mp-root without bare :root", () => {
    expect(result.wxss).toContain("page,\n.mw-mp-root,\n.mw-theme-light {");
    expect(result.wxss).toContain(
      "page.mw-theme-dark,\n.mw-mp-root.mw-theme-dark,\n.mw-theme-dark {",
    );
    expect(result.wxss).toContain("@media (prefers-color-scheme: dark)");
    expect(result.wxss).toContain(
      "page:not(.mw-theme-light),\n  .mw-mp-root:not(.mw-theme-light) {",
    );
    expect(result.css).not.toMatch(/:root\b/);
    expect(result.css).toContain('.mw-mp-root[data-theme="dark"]');
  });

  it("bakes color-mix() and rgb(var(--ink-rgb) / alpha) distinctly per light and dark theme", () => {
    expect(result.wxss).toContain("--fill-subtle: rgba(31, 27, 23, 0.04);");
    expect(result.wxss).toContain("--border-subtle: rgba(31, 27, 23, 0.08);");
    expect(result.wxss).toContain("--accent-subtle: rgba(249, 115, 22, 0.12);");
    expect(result.wxss).toContain("--success-subtle: rgba(22, 163, 74, 0.11);");
    expect(result.wxss).toContain("--warning-subtle: rgba(245, 158, 11, 0.14);");
    expect(result.wxss).toContain("--info-subtle: rgba(59, 130, 196, 0.11);");

    expect(result.wxss).toContain("--fill-subtle: rgba(255, 250, 244, 0.04);");
    expect(result.wxss).toContain("--border-subtle: rgba(255, 250, 244, 0.08);");
    expect(result.wxss).toContain("--success-subtle: rgba(74, 222, 128, 0.11);");
    expect(result.wxss).toContain("--warning-subtle: rgba(251, 191, 36, 0.14);");
    expect(result.wxss).toContain("--info-subtle: rgba(96, 165, 250, 0.11);");
  });

  it("emits Mobile Touch Size Axis (28 / 36 / 44 / 48px) and mobile typography tokens", () => {
    expect(result.wxss).toContain("--mp-size-xs-h: 28px;");
    expect(result.wxss).toContain("--mp-size-sm-h: 36px;");
    expect(result.wxss).toContain("--mp-size-md-h: 44px;");
    expect(result.wxss).toContain("--mp-size-lg-h: 48px;");
    expect(result.wxss).toContain("--mp-size-md-radius: var(--radius-full);");
    expect(result.wxss).toContain("--mp-size-lg-radius: var(--radius-full);");
    expect(result.wxss).toContain("--mp-type-body-size: 0.9375rem;");
    expect(result.wxss).toContain("--mp-sheet-radius: 28px;");
    expect(result.wxss).toContain("--mp-dialog-w: 320px;");
    expect(result.wxss).toContain("--mp-keyboard-offset: 0px;");
    expect(result.wxss).toContain("--size-md-h: var(--mp-size-md-h);");
  });

  it("keeps length offsets unit-qualified so CSS calc() never drops bottom positioning via IACVT", () => {
    const mpBaseCss = readFileSync(join(here, "../styles/mp-base.css"), "utf8");
    expect(mpBaseCss).not.toMatch(/--mw-mp-(?:safe-top|safe-bottom|keyboard-offset)\s*:\s*(?:0\s*;|var\(--space-0\))/);
    expect(mpBaseCss).toContain("--mw-mp-keyboard-offset: var(--mp-keyboard-offset, 0px);");
  });
});
