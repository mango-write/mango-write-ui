import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchableSelect, {
  SearchableSelect as NamedSearchableSelect,
} from "./SearchableSelect";

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
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SearchableSelect", () => {
  it("exports named and default SearchableSelect with displayName MwSearchableSelect", () => {
    expect(SearchableSelect).toBe(NamedSearchableSelect);
    expect(SearchableSelect.displayName).toBe("MwSearchableSelect");
  });

  it("exposes combobox/listbox ARIA semantics, measures mirror width, and supports keyboard selection", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <SearchableSelect
        value="a"
        onValueChange={onValueChange}
        options={options}
        optionLabel="label"
        optionValue="value"
        showClear
        inputId="discipline"
        ariaLabelledby="discipline-label"
        ariaDescribedby="discipline-error"
        invalid
        required
      />,
    );

    const input = container.querySelector<HTMLInputElement>("input")!;
    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-labelledby")).toBe("discipline-label");
    expect(input.getAttribute("aria-describedby")).toBe("discipline-error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("required")).toBe(true);
    expect(container.querySelector(".mw-ss-mirror")?.textContent).toBe("Alpha");

    fireEvent.focus(input);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(3);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toBe(
      "discipline-listbox-option-1",
    );
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("clears selection via accessible native clear button", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <SearchableSelect
        value="a"
        onValueChange={onValueChange}
        options={options}
        optionLabel="label"
        optionValue="value"
        showClear
      />,
    );

    const clear =
      container.querySelector<HTMLButtonElement>("button.mw-ss-clear")!;
    expect(clear.getAttribute("aria-label")).toBe("清除选择");
    fireEvent.click(clear);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("does not open panel or expose clear action when disabled, and shows emptyMessage when no match", () => {
    const { container, rerender } = render(
      <SearchableSelect
        value="a"
        options={options}
        optionLabel="label"
        optionValue="value"
        showClear
        disabled
      />,
    );

    expect(container.querySelector("button.mw-ss-clear")).toBeNull();
    fireEvent.focus(container.querySelector("input")!);
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();

    rerender(
      <SearchableSelect
        value={null}
        options={options}
        optionLabel="label"
        optionValue="value"
      />,
    );
    const input = container.querySelector<HTMLInputElement>("input")!;
    fireEvent.change(input, { target: { value: "not-found" } });
    expect(document.body.querySelector(".mw-ss-empty")?.textContent).toBe(
      "无匹配项",
    );
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(0);
  });
});
