import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MultiSelect, { MultiSelect as NamedMultiSelect } from "./MultiSelect";

const options = [
  { label: "Alpha", value: "a" },
  { label: "Beta", value: "b" },
  { label: "Gamma", value: "c", disabled: true },
  { label: "Delta", value: "d" },
];

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: (time: number) => void) => {
    cb(0);
    return 0;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("MultiSelect", () => {
  it("exports named and default MultiSelect with displayName MwMultiSelect", () => {
    expect(MultiSelect).toBe(NamedMultiSelect);
    expect(MultiSelect.displayName).toBe("MwMultiSelect");
  });

  it("exposes combobox/listbox ARIA attributes, skips disabled options on keyboard navigation, and emits show/hide", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    const onShow = vi.fn();
    const onHide = vi.fn();

    const { container, rerender } = render(
      <MultiSelect
        value={[]}
        options={options}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        placeholder="请选择"
        inputId="ms-field"
        ariaLabel="多选字段"
        ariaDescribedby="ms-error"
        invalid
        required
        onValueChange={onValueChange}
        onChange={onChange}
        onShow={onShow}
        onHide={onHide}
      />,
    );

    const root = container.querySelector<HTMLElement>(".mw-multiselect")!;
    expect(root.getAttribute("id")).toBe("ms-field");
    expect(root.getAttribute("role")).toBe("combobox");
    expect(root.getAttribute("aria-label")).toBe("多选字段");
    expect(root.getAttribute("aria-describedby")).toBe("ms-error");
    expect(root.getAttribute("aria-invalid")).toBe("true");
    expect(root.getAttribute("data-invalid")).toBe("true");
    expect(root.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(root);
    expect(root.getAttribute("aria-expanded")).toBe("true");
    expect(onShow).toHaveBeenCalledTimes(1);

    const renderedOptions = document.body.querySelectorAll<HTMLElement>(
      ".mw-multiselect__option",
    );
    expect(renderedOptions).toHaveLength(4);
    expect(renderedOptions[0]?.getAttribute("aria-label")).toBe("Alpha");
    expect(renderedOptions[2]?.getAttribute("aria-disabled")).toBe("true");

    fireEvent.keyDown(root, { key: "ArrowDown" });
    expect(root.getAttribute("aria-activedescendant")).toBe(
      "ms-field-listbox-option-1",
    );
    fireEvent.keyDown(root, { key: "ArrowDown" });
    expect(root.getAttribute("aria-activedescendant")).toBe(
      "ms-field-listbox-option-3",
    );

    fireEvent.keyDown(root, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith(["d"]);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: ["d"] }),
    );

    rerender(
      <MultiSelect
        value={["d"]}
        options={options}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        placeholder="请选择"
        inputId="ms-field"
        onValueChange={onValueChange}
        onChange={onChange}
        onShow={onShow}
        onHide={onHide}
      />,
    );

    fireEvent.click(
      document.body.querySelectorAll<HTMLElement>(".mw-multiselect__option")[0]!,
    );
    expect(onValueChange).toHaveBeenLastCalledWith(["d", "a"]);

    fireEvent.keyDown(root, { key: "Escape" });
    expect(root.getAttribute("aria-expanded")).toBe("false");
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it("supports comma and chip display modes, maxSelectedLabels summary, and showClear", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <MultiSelect
        value={["a", "b"]}
        options={options}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        display="chip"
        maxSelectedLabels={2}
        selectedItemsLabel="已选 {0} 项"
        showClear
        onValueChange={onValueChange}
      />,
    );

    const chips = container.querySelectorAll(
      ".mw-multiselect__label .mw-multiselect__chip",
    );
    expect(chips).toHaveLength(2);
    expect(chips[0]?.textContent).toContain("Alpha");

    fireEvent.click(
      container.querySelector<HTMLButtonElement>(".mw-multiselect__chip-remove")!,
    );
    expect(onValueChange).toHaveBeenLastCalledWith(["b"]);

    rerender(
      <MultiSelect
        value={["a", "b", "d"]}
        options={options}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        display="chip"
        maxSelectedLabels={2}
        selectedItemsLabel="已选 {0} 项"
        showClear
        onValueChange={onValueChange}
      />,
    );
    expect(
      container.querySelectorAll(".mw-multiselect__label .mw-multiselect__chip"),
    ).toHaveLength(3);

    rerender(
      <MultiSelect
        value={["a", "b", "d"]}
        options={options}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        display="comma"
        maxSelectedLabels={2}
        selectedItemsLabel="已选 {0} 项"
        showClear
        onValueChange={onValueChange}
      />,
    );
    expect(container.querySelector(".mw-multiselect__label")?.textContent).toBe(
      "已选 3 项",
    );

    fireEvent.click(
      container.querySelector<HTMLButtonElement>(".mw-multiselect__clear")!,
    );
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("collapses overflow chips into +N with hover tooltip when container width is constrained", () => {
    vi.useFakeTimers();
    const proto = Element.prototype as unknown as Record<string, unknown>;
    const rectDesc = Object.getOwnPropertyDescriptor(
      proto,
      "getBoundingClientRect",
    );
    Object.defineProperty(proto, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        width: 80,
        height: 32,
        top: 0,
        left: 0,
        right: 80,
        bottom: 32,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    try {
      const { container } = render(
        <MultiSelect
          value={["a", "b", "d"]}
          options={options}
          optionLabel="label"
          optionValue="value"
          optionDisabled="disabled"
          display="chip"
        />,
      );

      const chips = container.querySelectorAll<HTMLElement>(
        ".mw-multiselect__label .mw-multiselect__chip",
      );
      expect(chips).toHaveLength(2);
      expect(chips[0]?.textContent).toContain("Alpha");
      expect(chips[1]?.textContent).toBe("+2");
      expect(chips[1]?.getAttribute("data-tooltip")).toBe("Beta, Delta");

      fireEvent.mouseEnter(chips[1]!);
      act(() => {
        vi.advanceTimersByTime(160);
      });
      expect(document.body.querySelector('[role="tooltip"]')?.textContent).toBe(
        "Beta, Delta",
      );

      expect(
        container.querySelectorAll(
          ".mw-multiselect__measure .mw-multiselect__chip",
        ),
      ).toHaveLength(3);
    } finally {
      vi.useRealTimers();
      if (rectDesc) {
        Object.defineProperty(proto, "getBoundingClientRect", rectDesc);
      } else {
        delete proto.getBoundingClientRect;
      }
    }
  });

  it("supports filter and showToggleAll while ignoring disabled options", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <MultiSelect
        value={[]}
        options={options}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        filter
        filterPlaceholder="筛选选项"
        showToggleAll
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(container.querySelector(".mw-multiselect")!);
    const toggleAllBtn = document.body.querySelector<HTMLButtonElement>(
      ".mw-multiselect__toggle-all",
    )!;
    expect(toggleAllBtn).not.toBeNull();
    fireEvent.click(toggleAllBtn);
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b", "d"]);

    const filterInput = document.body.querySelector<HTMLInputElement>(
      ".mw-multiselect__filter",
    )!;
    fireEvent.change(filterInput, { target: { value: "be" } });
    expect(
      document.body.querySelectorAll(".mw-multiselect__option"),
    ).toHaveLength(1);
    expect(
      document.body.querySelector(".mw-multiselect__option")?.textContent,
    ).toContain("Beta");

    fireEvent.change(filterInput, { target: { value: "nonexistent" } });
    expect(
      document.body.querySelector(".mw-multiselect__empty")?.textContent,
    ).toBe("无匹配项");
  });

  it("blocks interaction and hides clear/remove buttons when disabled or readonly", () => {
    const { container } = render(
      <MultiSelect
        value={["a"]}
        options={options}
        optionLabel="label"
        optionValue="value"
        disabled
        showClear
        display="chip"
      />,
    );

    const root = container.querySelector<HTMLElement>(".mw-multiselect")!;
    expect(root.getAttribute("data-disabled")).toBe("true");
    expect(container.querySelector(".mw-multiselect__clear")).toBeNull();
    expect(container.querySelector(".mw-multiselect__chip-remove")).toBeNull();

    fireEvent.click(root);
    expect(document.body.querySelector(".mw-multiselect__overlay")).toBeNull();
  });
});
