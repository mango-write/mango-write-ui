import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(__dirname, "mobile-tokens.css"), "utf8").replace(/\r\n/g, "\n");
const varCss = readFileSync(join(__dirname, "var.css"), "utf8").replace(/\r\n/g, "\n");

function token(source: string, name: string): string {
  const match = source.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`Missing token ${name}`);
  return match[1].trim();
}
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255).map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
function contrast(foreground: string, background: string): number {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

describe("mobile semantic tokens & contrast", () => {
  it("scopes mobile tokens to page / .mw-mp-root with concentric capsule geometry, floating rail, and contrast", () => {
    expect(css).not.toMatch(/:root\b/);
    expect(css).not.toContain("--mp-navbar-h");
    expect(css).toContain("page,\n.mw-mp-root");
    expect(token(css, "--mp-size-xs-h")).toBe("28px");
    expect(token(css, "--mp-size-sm-h")).toBe("36px");
    expect(token(css, "--mp-size-md-h")).toBe("44px");
    expect(token(css, "--mp-size-lg-h")).toBe("48px");
    expect(token(css, "--mp-size-md-radius")).toBe("var(--radius-full)");
    expect(token(css, "--mp-chip-h")).toBe("32px");
    expect(token(css, "--mp-back-btn-size")).toBe("44px");
    expect(token(css, "--mp-tabbar-h")).toBe("56px");
    expect(token(css, "--mp-float-inset")).toBe("var(--space-3)");
    expect(token(css, "--mp-card-radius")).toBe("20px");
    expect(token(css, "--mp-cell-px")).toBe("var(--space-4)");
    expect(token(css, "--mp-sheet-inset")).toBe("var(--space-3)");
    expect(token(css, "--mp-sheet-radius")).toBe("28px");
    expect(token(css, "--mp-dialog-radius")).toBe("28px");
    expect(token(css, "--mp-accent-ink")).toBe("var(--text-on-accent)");
    expect(token(css, "--mp-text-meta")).toBe("var(--text-secondary)");
    expect(contrast(token(varCss, "--text-secondary"), token(varCss, "--bg-canvas"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#bdb7b0", "#0f0e0d")).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token(varCss, "--text-primary"), token(varCss, "--bg-sunken"))).toBeGreaterThanOrEqual(7);
  });
});
