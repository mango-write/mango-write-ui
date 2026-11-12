import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchableMultiSelect, {
  SearchableMultiSelect as NamedSearchableMultiSelect,
} from "./SearchableMultiSelect";

const options = [
  { label: "Alpha", value: "a" },
  { label: "Beta", value: "b" },
  { label: "Gamma", value: "c" },
];

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (callback: (time: number) => void) => {
    callback(0);
    return 0;
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SearchableMultiSelect", () => {
  it("exports named and default component with displayName MwSearchableMultiSelect", () => {
    expect(SearchableMultiSelect).toBe(NamedSearchableMultiSelect);
    expect(SearchableMultiSelect.displayName).toBe("MwSearchableMultiSelect");
  });

  it("locks fit width from widest candidate and placeholder and recalculates when options change", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      measureText: (text: string) => ({ width: text.length * 10 }),
      letterSpacing: "0px",
    } as unknown as CanvasRenderingContext2D);

    const { container, rerender } = render(
      <SearchableMultiSelect
        value={[]}
        placeholder="Quartile"
        options={[
          { label: "Alpha", value: "a" },
          { label: "Widest Option Value", value: "w" },
        ]}
        optionLabel="label"
        optionValue="value"
      />,
    );

    const fitOf = () =>
      container
        .querySelector<HTMLElement>(".mw-ms")!
        .style.getPropertyValue("--mw-ms-fit-text");
    expect(fitOf()).toBe("192px");

    const input = container.querySelector<HTMLInputElement>(".mw-ms input")!;
    fireEvent.change(input, { target: { value: "Q" } });
    expect(fitOf()).toBe("192px");

    rerender(
      <SearchableMultiSelect
        value={[]}
        options={options}
        optionLabel="label"
        optionValue="value"
      />,
    );
    expect(fitOf()).toBe("52px");
  });

  it("exposes multiselect combobox ARIA semantics and toggles options with ArrowDown + Enter", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <SearchableMultiSelect
        value={["a"]}
        onValueChange={onValueChange}
        options={options}
        optionLabel="label"
        optionValue="value"
        inputId="topics"
        ariaLabel="研究主题"
        ariaDescribedby="topics-hint"
        invalid
        required
      />,
    );

    const input = container.querySelector<HTMLInputElement>("input")!;
    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-label")).toBe("研究主题");
    expect(input.getAttribute("aria-describedby")).toBe("topics-hint");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-required")).toBe("true");

    fireEvent.focus(input);
    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox?.getAttribute("aria-multiselectable")).toBe("true");
    expect(
      document.body
        .querySelector('[role="option"]')
        ?.getAttribute("aria-selected"),
    ).toBe("true");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toBe(
      "topics-listbox-option-1",
    );
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b"]);
  });

  it("renders accessible remove button on chips and supports custom renderChip / renderOption + +N collapse", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <SearchableMultiSelect
        value={["a"]}
        onValueChange={onValueChange}
        options={options}
        optionLabel="label"
        optionValue="value"
      />,
    );

    const remove = container.querySelector<HTMLButtonElement>(
      "button.mw-ms-chip-remove",
    )!;
    expect(remove.getAttribute("aria-label")).toBe("移除 Alpha");
    fireEvent.click(remove);
    expect(onValueChange).toHaveBeenLastCalledWith([]);

    rerender(
      <SearchableMultiSelect
        value={["a", "b"]}
        onValueChange={onValueChange}
        options={options}
        optionLabel="label"
        optionValue="value"
        renderChip={({ label, remove: onRemove }) => (
          <span className="custom-chip">
            {label}
            <button type="button" className="custom-remove" onClick={onRemove}>
              x
            </button>
          </span>
        )}
        renderOption={({ label, selected }) => (
          <span className="custom-opt">
            {label}-{String(selected)}
          </span>
        )}
      />,
    );

    expect(
      container.querySelectorAll(".mw-ms-label .custom-chip"),
    ).toHaveLength(1);
    expect(container.querySelector(".mw-ms-chip-more")?.textContent).toBe("+1");
    expect(
      container.querySelectorAll(".mw-ms-measure .custom-chip"),
    ).toHaveLength(2);
  });

  it("blocks opening and hides chip remove button when disabled, and shows emptyMessage when no match", () => {
    const { container, rerender } = render(
      <SearchableMultiSelect
        value={["a"]}
        options={options}
        optionLabel="label"
        optionValue="value"
        disabled
      />,
    );

    expect(container.querySelector("button.mw-ms-chip-remove")).toBeNull();
    fireEvent.focus(container.querySelector("input")!);
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();

    rerender(
      <SearchableMultiSelect
        value={["a"]}
        options={options}
        optionLabel="label"
        optionValue="value"
      />,
    );
    const input = container.querySelector<HTMLInputElement>("input")!;
    fireEvent.change(input, { target: { value: "not-found" } });
    expect(document.body.querySelector(".mw-ms-empty")?.textContent).toBe(
      "无匹配项",
    );
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(0);
  });
});
