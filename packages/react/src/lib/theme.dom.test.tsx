import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { initTheme, resolveTheme, toggleTheme, useThemePreference } from "./theme";

describe("react theme runtime & useThemePreference", () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.themeTransition;
  });

  it("reads mango-write:theme by default and syncs documentElement[data-theme]", () => {
    window.localStorage.setItem("mango-write:theme", "dark");
    initTheme({
      storageKey: "mango-write:theme",
      rootEl: () => document.documentElement,
    });

    function Probe() {
      const { preference, resolved } = useThemePreference();
      return (
        <div
          data-testid="probe"
          data-pref={preference}
          data-resolved={resolved}
        />
      );
    }

    const { getByTestId } = render(<Probe />);
    const el = getByTestId("probe");
    expect(el.getAttribute("data-pref")).toBe("dark");
    expect(el.getAttribute("data-resolved")).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("supports custom storageKey and reactive updates in React components", () => {
    window.localStorage.setItem("host-react:theme", "light");
    window.localStorage.setItem("mango-write:theme", "dark");
    initTheme({
      storageKey: "host-react:theme",
      rootEl: () => document.documentElement,
    });

    function Switcher() {
      const { preference, resolved, setTheme } = useThemePreference();
      return (
        <button
          type="button"
          data-testid="btn"
          data-pref={preference}
          data-resolved={resolved}
          onClick={() => setTheme("dark", { animate: false })}
        >
          Switch
        </button>
      );
    }

    const { getByTestId } = render(<Switcher />);
    const btn = getByTestId("btn");
    expect(btn.getAttribute("data-pref")).toBe("light");
    expect(btn.getAttribute("data-resolved")).toBe("light");

    act(() => {
      btn.click();
    });

    expect(btn.getAttribute("data-pref")).toBe("dark");
    expect(btn.getAttribute("data-resolved")).toBe("dark");
    expect(window.localStorage.getItem("host-react:theme")).toBe("dark");
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("supports custom rootEl without mutating documentElement", () => {
    const host = document.createElement("div");
    document.body.append(host);
    initTheme({
      storageKey: "mango-write:theme",
      rootEl: () => host,
    });

    act(() => {
      toggleTheme({ animate: false });
    });

    expect(host.dataset.theme).toBeDefined();
    expect(document.documentElement.dataset.theme).toBeUndefined();
    host.remove();
  });

  it("runs radial View Transition when startViewTransition is supported and cleans up css vars", async () => {
    initTheme({
      storageKey: "mango-write:theme",
      rootEl: () => document.documentElement,
    });

    act(() => {
      window.localStorage.setItem("mango-write:theme", "light");
      initTheme();
    });
    expect(document.documentElement.dataset.theme).toBe("light");

    let resolveFinished!: () => void;
    const finished = new Promise<void>((r) => {
      resolveFinished = r;
    });

    const docWithVT = document as unknown as {
      startViewTransition?: (cb: () => void) => {
        ready: Promise<void>;
        finished: Promise<void>;
        skipTransition: () => void;
      };
    };
    const prevVT = docWithVT.startViewTransition;
    let capturedBeforeCallback: string | undefined;
    docWithVT.startViewTransition = (cb: () => void) => {
      capturedBeforeCallback = document.documentElement.dataset.theme;
      cb();
      return {
        ready: Promise.resolve(),
        finished,
        skipTransition: () => {},
      };
    };

    try {
      let next!: string;
      act(() => {
        next = toggleTheme({ clientX: 120, clientY: 40 });
      });
      expect(next).toBe("dark");
      expect(capturedBeforeCallback).toBe("light");
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(document.documentElement.dataset.themeTransition).toBe("radial");
      expect(document.documentElement.style.getPropertyValue("--mw-vt-x")).toBe("120px");
      expect(document.documentElement.style.getPropertyValue("--mw-vt-y")).toBe("40px");
      expect(document.documentElement.style.getPropertyValue("--mw-vt-r")).toMatch(/^\d+px$/);

      resolveFinished();
      await finished;
      await Promise.resolve();
      expect(document.documentElement.dataset.themeTransition).toBeUndefined();
      expect(document.documentElement.style.getPropertyValue("--mw-vt-x")).toBe("");
    } finally {
      docWithVT.startViewTransition = prevVT;
    }
  });
});
