import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Listbox, { Listbox as NamedListbox } from "./Listbox";

const options = [
  { label: "草稿 A", value: "d-1" },
  { label: "草稿 B", value: "d-2" },
  { label: "已锁定草稿", value: "d-3", disabled: true },
  { label: "草稿 D", value: "d-4" },
];

describe("Listbox", () => {
  it("exports named and default Listbox with displayName MwListbox", () => {
    expect(Listbox).toBe(NamedListbox);
    expect(Listbox.displayName).toBe("MwListbox");
  });

  it("supports single selection, ARIA attributes, and ArrowDown/Enter navigation skipping disabled items", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();

    const { container, getByRole, rerender } = render(
      <Listbox
        value={null}
        options={options}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        inputId="draft-list"
        ariaLabel="选择草稿"
        invalid
        listStyle={{ maxHeight: "240px" }}
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    );

    const root = container.querySelector<HTMLElement>(".mw-listbox")!;
    expect(root.getAttribute("data-invalid")).toBe("true");

    const list = getByRole("listbox");
    expect(list.getAttribute("aria-label")).toBe("选择草稿");
    expect(list.getAttribute("aria-invalid")).toBe("true");

    const items = container.querySelectorAll<HTMLElement>(
      ".mw-listbox__option",
    );
    expect(items).toHaveLength(4);
    expect(items[2]?.getAttribute("aria-disabled")).toBe("true");

    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(list.getAttribute("aria-activedescendant")).toBe(
      "draft-list-list-option-0",
    );
    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(list.getAttribute("aria-activedescendant")).toBe(
      "draft-list-list-option-1",
    );
    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(list.getAttribute("aria-activedescendant")).toBe(
      "draft-list-list-option-3",
    );

    fireEvent.keyDown(list, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith("d-4");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: "d-4" }),
    );

    rerender(
      <Listbox
        value="d-4"
        options={options}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        inputId="draft-list"
      />,
    );
    const updatedItems = container.querySelectorAll<HTMLElement>(
      ".mw-listbox__option",
    );
    expect(
      updatedItems[3]?.classList.contains("mw-listbox__option--selected"),
    ).toBe(true);
    expect(updatedItems[3]?.getAttribute("aria-selected")).toBe("true");
  });

  it("supports multiple selection and built-in filter", () => {
    const onValueChange = vi.fn();
    const { container, getByRole } = render(
      <Listbox
        value={["d-1"]}
        options={options}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        multiple
        filter
        filterPlaceholder="搜索草稿"
        emptyFilterMessage="没有找到草稿"
        onValueChange={onValueChange}
      />,
    );

    const list = getByRole("listbox");
    expect(list.getAttribute("aria-multiselectable")).toBe("true");

    const items = container.querySelectorAll<HTMLElement>(
      ".mw-listbox__option",
    );
    fireEvent.click(items[1]!);
    expect(onValueChange).toHaveBeenLastCalledWith(["d-1", "d-2"]);

    const filterInput = container.querySelector<HTMLInputElement>(
      ".mw-listbox__filter",
    )!;
    fireEvent.change(filterInput, { target: { value: "草稿 B" } });
    expect(container.querySelectorAll(".mw-listbox__option")).toHaveLength(1);
    expect(container.querySelector(".mw-listbox__option")?.textContent).toBe(
      "草稿 B",
    );

    fireEvent.change(filterInput, { target: { value: "不存在" } });
    expect(container.querySelectorAll(".mw-listbox__option")).toHaveLength(0);
    expect(container.querySelector(".mw-listbox__empty")?.textContent).toBe(
      "没有找到草稿",
    );
  });

  it("ignores pointer and keyboard selection when disabled or readonly", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Listbox
        value="d-1"
        options={options}
        optionLabel="label"
        optionValue="value"
        disabled
        onValueChange={onValueChange}
      />,
    );

    expect(
      container.querySelector(".mw-listbox")?.getAttribute("data-disabled"),
    ).toBe("true");
    fireEvent.click(container.querySelectorAll(".mw-listbox__option")[1]!);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
