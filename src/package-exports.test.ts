import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { build } from "vite";
import { describe, expect, it } from "vitest";

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
type ExportTarget = string | { [condition: string]: ExportTarget };

const pkgJson = JSON.parse(readFileSync(path.join(pkgRoot, "package.json"), "utf8")) as {
  exports: Record<string, ExportTarget>;
  publishConfig: {
    exports: Record<string, ExportTarget>;
  };
};

function collectTargetPaths(target: ExportTarget, trail: string[] = []): Array<{ label: string; relPath: string }> {
  if (typeof target === "string") {
    return [{ label: trail.join(".") || "default", relPath: target }];
  }
  const results: Array<{ label: string; relPath: string }> = [];
  for (const [cond, child] of Object.entries(target)) {
    results.push(...collectTargetPaths(child, [...trail, cond]));
  }
  return results;
}

async function bundleConsumer(entryCode: string, useMangoSource: boolean): Promise<{ js: string; css: string }> {
  const scratchParent = path.join(pkgRoot, "node_modules", ".cache");
  mkdirSync(scratchParent, { recursive: true });
  const tempDir = mkdtempSync(path.join(scratchParent, "mw-ui-consumer-"));
  const entryFile = path.join(tempDir, "entry.ts");
  writeFileSync(entryFile, entryCode, "utf8");

  try {
    const result = await build({
      root: tempDir,
      logLevel: "silent",
      plugins: [vue()],
      resolve: {
        conditions: useMangoSource
          ? ["mango-source", "module", "import", "browser", "default"]
          : ["module", "import", "browser", "default"],
      },
      build: {
        write: false,
        minify: false,
        cssCodeSplit: false,
        rollupOptions: {
          input: entryFile,
          external: [
            "vue",
            "vue-router",
            /^primevue(\/.*)?$/,
            /^@primeuix\/.*$/,
            /^primeicons(\/.*)?$/,
            /^reka-ui(\/.*)?$/,
            /^@tanstack\/vue-table(\/.*)?$/,
          ],
        },
      },
    });

    const outputs = Array.isArray(result) ? result : [result];
    let js = "";
    let css = "";
    for (const out of outputs) {
      if (!("output" in out)) continue;
      for (const chunk of out.output) {
        if (chunk.type === "chunk") {
          js += `\n${chunk.code}`;
        } else if (chunk.fileName.endsWith(".css")) {
          css += `\n${typeof chunk.source === "string" ? chunk.source : Buffer.from(chunk.source).toString("utf8")}`;
        }
      }
    }
    return { js, css };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("@mango-write/ui package exports & static CSS isolation (P1)", () => {
  it("exports and publishConfig.exports share identical keys and every target file exists on disk", () => {
    const exportKeys = Object.keys(pkgJson.exports).sort();
    const publishExportKeys = Object.keys(pkgJson.publishConfig.exports).sort();
    expect(publishExportKeys).toEqual(exportKeys);

    for (const [subpath, target] of Object.entries(pkgJson.exports)) {
      for (const { label, relPath } of collectTargetPaths(target)) {
        expect(existsSync(path.join(pkgRoot, relPath)), `${subpath} [${label}] -> ${relPath}`).toBe(true);
      }
    }

    for (const [subpath, target] of Object.entries(pkgJson.publishConfig.exports)) {
      for (const { label, relPath } of collectTargetPaths(target)) {
        expect(
          existsSync(path.join(pkgRoot, relPath)),
          `publishConfig ${subpath} [${label}] -> ${relPath}`,
        ).toBe(true);
      }
    }
  });

  it("isolates base.css and components.css from primeicons and primevue-theme.css", () => {
    for (const rel of ["src/base.css", "dist/base.css", "src/components.css", "dist/components.css"]) {
      const content = stripCssComments(readFileSync(path.join(pkgRoot, rel), "utf8"));
      expect(content, `${rel} should not import primeicons`).not.toContain("primeicons");
      expect(content, `${rel} should not import primevue-theme`).not.toContain("primevue-theme");
    }

    const distBase = stripCssComments(readFileSync(path.join(pkgRoot, "dist/base.css"), "utf8"));
    expect(distBase).toContain(".mw-toolbar");
    expect(distBase).toContain(".mw-glass");
    expect(distBase).not.toContain("--p-");

    const srcComponents = stripCssComments(readFileSync(path.join(pkgRoot, "src/components.css"), "utf8"));
    expect(srcComponents).toContain(".mw-control");
    expect(srcComponents).not.toContain("--p-");

    const distComponents = stripCssComments(readFileSync(path.join(pkgRoot, "dist/components.css"), "utf8"));
    expect(distComponents).toContain(".mw-control");
    expect(distComponents).toContain(".mw-form-field");

    const themeCss = stripCssComments(readFileSync(path.join(pkgRoot, "dist/theme.css"), "utf8"));
    expect(themeCss).toContain("./base.css");
    expect(themeCss).toContain("./components.css");
    expect(themeCss).not.toContain("primeicons");
    expect(themeCss).not.toContain("primevue-theme");
  });

  it.each([
    ["mango-source (workspace source mode)", true],
    ["dist (standalone package mode)", false],
  ])("tree-shakes legacy PrimeVue theme and unrelated components in %s", async (_label, useMangoSource) => {
    const { js, css } = await bundleConsumer(
      `
        import "@mango-write/ui/base.css";
        import "@mango-write/ui/components.css";
        import FormField from "@mango-write/ui/components/FormField";
        import { PageHeader } from "@mango-write/ui";
        import { initTheme } from "@mango-write/ui/lib/theme";
        console.log(FormField, PageHeader, initTheme);
      `,
      useMangoSource,
    );

    expect(js).toContain("mw-form-field");
    expect(js).toContain("mw-page-header");
    expect(js).toContain("initTheme");
    // Must not pull PrimeVue or @primeuix/themes
    expect(js).not.toContain("@primeuix/themes");
    expect(js).not.toContain("primevue/");
    expect(js).not.toContain("definePreset");
    // Must not pull unrelated components
    expect(js).not.toContain("mw-action-menu");
    expect(js).not.toContain("mw-user-select");
    expect(js).not.toContain("SiteHeader");

    // Static CSS must include Mango base + component styles and zero PrimeIcons / PrimeVue theme overrides
    const cleanCss = stripCssComments(css);
    expect(cleanCss).toContain(".mw-control");
    expect(cleanCss).toContain(".mw-toolbar");
    expect(cleanCss).not.toContain("primeicons");
    expect(cleanCss).not.toContain("primevue-theme");
    if (useMangoSource) {
      expect(cleanCss).not.toContain("--p-");
    }
  });

  it.each([
    ["mango-source (workspace source mode)", true],
    ["dist (standalone package mode)", false],
  ])("bundles P2 Reka + Mango primitives in %s without pulling PrimeVue or global hosts", async (_label, useMangoSource) => {
    const { js } = await bundleConsumer(
      `
        import Button from "@mango-write/ui/components/Button";
        import InputText from "@mango-write/ui/components/InputText";
        import Select from "@mango-write/ui/components/Select";
        import Dialog from "@mango-write/ui/components/Dialog";
        import { Tabs, TabList, Tab, TabPanels, TabPanel, Tag, Avatar, ProgressBar, Message } from "@mango-write/ui";
        console.log(Button, InputText, Select, Dialog, Tabs, TabList, Tab, TabPanels, TabPanel, Tag, Avatar, ProgressBar, Message);
      `,
      useMangoSource,
    );

    expect(js).toContain("mw-btn");
    expect(js).toContain("mw-input-text");
    expect(js).toContain("mw-select");
    expect(js).toContain("mw-dialog");
    expect(js).toContain("mw-tabs");
    // Must not pull PrimeVue or @primeuix/themes
    expect(js).not.toContain("@primeuix/themes");
    expect(js).not.toContain("primevue/");
    expect(js).not.toContain("definePreset");
    // Must not implicitly pull ConfirmHost or ToastHost when not imported
    expect(js).not.toContain("MwConfirmHost");
    expect(js).not.toContain("MwToastHost");
  });
});
