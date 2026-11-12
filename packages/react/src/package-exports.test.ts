import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { build } from "vite";
import { describe, expect, it } from "vitest";

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const vueRoot = path.join(pkgRoot, "..", "vue");
const coreRoot = path.join(pkgRoot, "..", "core");
type ExportTarget = string | { [condition: string]: ExportTarget };

interface PackageManifest {
  exports: Record<string, ExportTarget>;
  publishConfig: {
    exports: Record<string, ExportTarget>;
  };
}

const pkgJson = JSON.parse(readFileSync(path.join(pkgRoot, "package.json"), "utf8")) as PackageManifest;
const vuePkgJson = JSON.parse(readFileSync(path.join(vueRoot, "package.json"), "utf8")) as PackageManifest;

function collectTargetPaths(
  target: ExportTarget,
  trail: string[] = [],
): Array<{ label: string; relPath: string }> {
  if (typeof target === "string") {
    return [{ label: trail.join(".") || "default", relPath: target }];
  }
  const results: Array<{ label: string; relPath: string }> = [];
  for (const [cond, child] of Object.entries(target)) {
    results.push(...collectTargetPaths(child, [...trail, cond]));
  }
  return results;
}

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out.sort();
}

function parseRootExportSymbols(indexSource: string): Set<string> {
  const symbols = new Set<string>();
  for (const match of indexSource.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g)) {
    for (const part of match[1]!.split(",")) {
      const cleaned = part.trim().replace(/^type\s+/, "");
      if (!cleaned) continue;
      const tokens = cleaned.split(/\s+as\s+/);
      const exported = (tokens[1] ?? tokens[0])!.trim();
      if (exported) symbols.add(exported);
    }
  }
  return symbols;
}

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

async function bundleConsumer(
  entryCode: string,
  useMangoSource: boolean,
): Promise<{ js: string; css: string }> {
  const scratchParent = path.join(pkgRoot, "node_modules", ".cache");
  mkdirSync(scratchParent, { recursive: true });
  const tempDir = mkdtempSync(path.join(scratchParent, "mw-ui-react-consumer-"));
  const entryFile = path.join(tempDir, "entry.tsx");
  writeFileSync(entryFile, entryCode, "utf8");

  try {
    const result = await build({
      root: tempDir,
      logLevel: "silent",
      plugins: [react()],
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
            "react",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
            "react-dom",
            /^lucide-react(\/.*)?$/,
            /^radix-ui(\/.*)?$/,
            /^@radix-ui\/.*$/,
            /^@tanstack\/react-table(\/.*)?$/,
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

describe("@mango-write/ui-react package exports, desktop parity & declaration isolation", () => {
  it("Calendar component and public contract declarations stay distinct on case-insensitive filesystems", () => {
    const targets = (key: string) =>
      collectTargetPaths(pkgJson.exports[key]!)
        .filter(({ label }) => label.endsWith("types"))
        .map(({ relPath }) => relPath.toLowerCase());
    const component = targets("./components/Calendar");
    const contract = targets("./components/calendar");
    expect(component.length).toBeGreaterThan(0);
    expect(contract.length).toBeGreaterThan(0);
    expect(component.filter((target) => contract.includes(target))).toEqual([]);
  });

  it("exports and publishConfig.exports share identical keys and every source/dist file exists on disk", () => {
    const exportKeys = Object.keys(pkgJson.exports).sort();
    const publishExportKeys = Object.keys(pkgJson.publishConfig.exports).sort();
    expect(publishExportKeys).toEqual(exportKeys);

    for (const [subpath, target] of Object.entries(pkgJson.exports)) {
      for (const { label, relPath } of collectTargetPaths(target)) {
        expect(
          existsSync(path.join(pkgRoot, relPath)),
          `${subpath} [${label}] -> ${relPath}`,
        ).toBe(true);
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

  it("maintains 100% subpath and root-symbol parity with @mango-write/ui-vue", () => {
    const reactExportKeys = new Set(Object.keys(pkgJson.exports));
    const missingSubpaths = Object.keys(vuePkgJson.exports).filter(
      (key) => !reactExportKeys.has(key),
    );
    expect(missingSubpaths).toEqual([]);

    const vueSymbols = parseRootExportSymbols(
      readFileSync(path.join(vueRoot, "src", "index.ts"), "utf8"),
    );
    const reactSymbols = parseRootExportSymbols(
      readFileSync(path.join(pkgRoot, "src", "index.ts"), "utf8"),
    );
    const vueFrameworkOnly = new Set([
      "vTooltip",
      "vScrollFade",
      "provideConfirm",
      "provideNotify",
    ]);
    const missingRootSymbols = [...vueSymbols].filter(
      (sym) => !vueFrameworkOnly.has(sym) && !reactSymbols.has(sym),
    );
    expect(missingRootSymbols).toEqual([]);

    for (const reactBinding of [
      "Tooltip",
      "useTooltipProps",
      "attachTooltip",
      "useScrollFade",
      "ConfirmProvider",
      "useConfirm",
      "NotifyProvider",
      "useNotify",
      "UiLocaleProvider",
      "useUiLocale",
      "useOverlayZIndex",
      "FormFieldContext",
      "useFormFieldContext",
    ]) {
      expect(reactSymbols.has(reactBinding), `missing React binding ${reactBinding}`).toBe(true);
    }
  });

  it("emits clean .d.ts public contracts without leaking upstream primitives and keeps runtime exports aligned", () => {
    const distDir = path.join(pkgRoot, "dist");
    const dtsFiles = walkFiles(distDir).filter((file) => file.endsWith(".d.ts"));
    expect(dtsFiles.length).toBeGreaterThan(80);

    const forbiddenPatterns: Array<{ label: string; pattern: RegExp }> = [
      { label: "vue", pattern: /from\s+["']vue(?:\/[^"']*)?["']|import\(["']vue/ },
      { label: "reka-ui", pattern: /reka-ui/ },
      { label: "radix-ui", pattern: /from\s+["']radix-ui["']|import\(["']radix-ui/ },
      { label: "@radix-ui/*", pattern: /@radix-ui\// },
      { label: "@tanstack/react-table", pattern: /@tanstack\/react-table/ },
    ];

    for (const file of dtsFiles) {
      const content = readFileSync(file, "utf8");
      const rel = path.relative(pkgRoot, file);
      for (const { label, pattern } of forbiddenPatterns) {
        expect(pattern.test(content), `${rel} leaked ${label}`).toBe(false);
      }
    }

    for (const [subpath, target] of Object.entries(pkgJson.exports)) {
      if (typeof target === "string" || typeof target.types !== "string" || typeof target.default !== "string") {
        continue;
      }
      const dts = readFileSync(path.join(pkgRoot, target.types), "utf8");
      const js = readFileSync(path.join(pkgRoot, target.default), "utf8");
      const declaredRuntimeValues = [
        ...dts.matchAll(/^export declare (?:const|function|class)\s+([A-Za-z0-9_$]+)/gm),
      ].map((m) => m[1]!);
      if (declaredRuntimeValues.length === 0) continue;

      const exportedInJs = new Set<string>();
      for (const match of js.matchAll(/export\s*\{([^}]+)\}/g)) {
        for (const item of match[1]!.split(",")) {
          const parts = item.trim().split(/\s+as\s+/);
          const name = (parts[1] ?? parts[0])!.trim();
          if (name) exportedInJs.add(name);
        }
      }
      for (const sym of declaredRuntimeValues) {
        expect(exportedInJs.has(sym), `${subpath} missing runtime export ${sym}`).toBe(true);
      }
    }
  });

  it("isolates base.css and components.css from legacy icon font and theme css", () => {
    const legacyIconFont = ["prime", "icons"].join("");
    for (const rel of [
      "src/base.css",
      "dist/base.css",
      "src/components.css",
      "dist/components.css",
      "dist/theme.css",
      "dist/var.css",
    ]) {
      const content = stripCssComments(readFileSync(path.join(pkgRoot, rel), "utf8"));
      expect(content.length).toBeGreaterThan(0);
      expect(content, `${rel} should not import legacy icon font`).not.toContain(legacyIconFont);
      expect(content, `${rel} should not import primevue-theme`).not.toContain("primevue-theme");
      expect(content, `${rel} should not reference --p-`).not.toContain("--p-");
    }

    const distBase = stripCssComments(readFileSync(path.join(pkgRoot, "dist/base.css"), "utf8"));
    expect(distBase).toContain(".mw-toolbar");
    expect(distBase).toContain(".mw-glass");

    const distComponents = stripCssComments(
      readFileSync(path.join(pkgRoot, "dist/components.css"), "utf8"),
    );
    expect(distComponents).toContain(".mw-control");
    expect(distComponents).toContain(".mw-form-field");
    expect(distComponents.indexOf(".mw-control")).toBeLessThan(
      distComponents.indexOf(".mw-checkbox"),
    );
    expect(distComponents.indexOf(".mw-control")).toBeLessThan(
      distComponents.indexOf(".mw-toggle-switch"),
    );

    const coreDistComponents = stripCssComments(
      readFileSync(path.join(coreRoot, "dist/components.css"), "utf8"),
    );
    expect(coreDistComponents.indexOf(".mw-control")).toBeLessThan(
      coreDistComponents.indexOf(".mw-checkbox"),
    );

    const themeCss = stripCssComments(readFileSync(path.join(pkgRoot, "dist/theme.css"), "utf8"));
    expect(themeCss).toContain("./base.css");
    expect(themeCss).toContain("./components.css");
  });

  it.each([
    ["mango-source (workspace source mode)", true],
    ["dist (standalone package mode)", false],
  ])("tree-shakes unrelated components and runtime hosts in %s", async (_label, useMangoSource) => {
    const { js, css } = await bundleConsumer(
      `
        import "@mango-write/ui-react/base.css";
        import "@mango-write/ui-react/components.css";
        import FormField from "@mango-write/ui-react/components/FormField";
        import { PageHeader } from "@mango-write/ui-react";
        import { initTheme } from "@mango-write/ui-react/lib/theme";
        console.log(FormField, PageHeader, initTheme);
      `,
      useMangoSource,
    );

    expect(js).toContain("mw-form-field");
    expect(js).toContain("mw-page-header");
    expect(js).toContain("initTheme");
    expect(js).not.toContain("mw-action-menu");
    expect(js).not.toContain("mw-user-select");
    expect(js).not.toContain("MwSiteHeader");
    expect(js).not.toContain("MwDataTable");

    const cleanCss = stripCssComments(css);
    expect(cleanCss).toContain(".mw-control");
    expect(cleanCss).toContain(".mw-toolbar");
    expect(cleanCss).not.toContain("--p-");
  });

  it.each([
    ["mango-source (workspace source mode)", true],
    ["dist (standalone package mode)", false],
  ])("bundles Radix + Mango React primitives in %s without pulling global hosts", async (_label, useMangoSource) => {
    const { js } = await bundleConsumer(
      `
        import Button from "@mango-write/ui-react/components/Button";
        import InputText from "@mango-write/ui-react/components/InputText";
        import Select from "@mango-write/ui-react/components/Select";
        import Dialog from "@mango-write/ui-react/components/Dialog";
        import { Tabs, TabList, Tab, TabPanels, TabPanel, Tag, Avatar, ProgressBar, Message } from "@mango-write/ui-react";
        console.log(Button, InputText, Select, Dialog, Tabs, TabList, Tab, TabPanels, TabPanel, Tag, Avatar, ProgressBar, Message);
      `,
      useMangoSource,
    );

    expect(js).toContain("mw-btn");
    expect(js).toContain("mw-input-text");
    expect(js).toContain("mw-select");
    expect(js).toContain("mw-dialog");
    expect(js).toContain("mw-tabs");
    expect(js).not.toContain("MwConfirmHost");
    expect(js).not.toContain("MwToastHost");
  });
});
