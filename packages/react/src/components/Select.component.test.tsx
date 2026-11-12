import { fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormFieldContext } from "./form-field-context";
import Select, { Select as NamedSelect } from "./Select";

const defaultOptions = [
  { label: "Alpha", value: "a" },
  { label: "Beta", value: "b" },
  { label: "Gamma", value: "c" },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Select", () => {
  it("exports named and default Select with displayName MwSelect", () => {
    expect(Select).toBe(NamedSelect);
    expect(Select.displayName).toBe("MwSelect");
  });

  it("exposes combobox/listbox accessibility attributes and validation state", () => {
    const onBeforeShow = vi.fn();
    const { getByRole } = render(
      <Select
        value="a"
        options={defaultOptions}
        optionLabel="label"
        optionValue="value"
        inputId="topic-select"
        ariaLabel="选择主题"
        ariaDescribedby="topic-hint"
        invalid
        required
        data-testid="topic-trigger"
        onBeforeShow={onBeforeShow}
      />,
    );

    const trigger = getByRole("combobox");
    expect(trigger.classList.contains("mw-select")).toBe(true);
    expect(trigger.classList.contains("mw-control")).toBe(true);
    expect(trigger.getAttribute("id")).toBe("topic-select");
    expect(trigger.getAttribute("aria-label")).toBe("选择主题");
    expect(trigger.getAttribute("aria-describedby")).toBe("topic-hint");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-required")).toBe("true");
    expect(trigger.getAttribute("data-invalid")).toBe("true");
    expect(trigger.getAttribute("data-testid")).toBe("topic-trigger");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);

    expect(onBeforeShow).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const listbox = document.body.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(trigger.getAttribute("aria-controls")).toBe(
      listbox?.getAttribute("id"),
    );
  });

  it("supports 0, false, empty string, and object as valid values and clears to null", () => {
    const objOption = { id: 1, name: "Object One" };
    const falsyOptions = [
      { label: "Zero", val: 0 },
      { label: "FalseBool", val: false },
      { label: "EmptyStr", val: "" },
      { label: "ObjectVal", val: objOption },
    ];
    const onValueChange = vi.fn();
    const onChange = vi.fn();

    const { container, rerender } = render(
      <Select<any>
        value={0}
        options={falsyOptions}
        optionLabel="label"
        optionValue="val"
        placeholder="请选择"
        showClear
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    );

    expect(container.querySelector(".mw-select__label")?.textContent).toBe(
      "Zero",
    );
    expect(container.querySelector("button.mw-select__clear")).not.toBeNull();

    rerender(
      <Select<any>
        value={false}
        options={falsyOptions}
        optionLabel="label"
        optionValue="val"
        placeholder="请选择"
        showClear
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    );
    expect(container.querySelector(".mw-select__label")?.textContent).toBe(
      "FalseBool",
    );
    expect(container.querySelector("button.mw-select__clear")).not.toBeNull();

    rerender(
      <Select<any>
        value=""
        options={falsyOptions}
        optionLabel="label"
        optionValue="val"
        placeholder="请选择"
        showClear
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    );
    expect(container.querySelector(".mw-select__label")?.textContent).toBe(
      "EmptyStr",
    );
    expect(container.querySelector("button.mw-select__clear")).not.toBeNull();

    rerender(
      <Select<any>
        value={objOption}
        options={falsyOptions}
        optionLabel="label"
        optionValue="val"
        placeholder="请选择"
        showClear
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    );
    expect(container.querySelector(".mw-select__label")?.textContent).toBe(
      "ObjectVal",
    );

    fireEvent.click(container.querySelector("button.mw-select__clear")!);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: null }),
    );
  });

  it("supports keyboard ArrowDown/ArrowUp/Home/End/Enter/Space/Escape navigation and skips disabled options", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();

    const { getByRole } = render(
      <Select
        value={null}
        options={[
          { label: "First", value: 1 },
          { label: "Disabled", value: 2, disabled: true },
          { label: "Third", value: 3 },
          { label: "Fourth", value: 4 },
        ]}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    );

    const trigger = getByRole("combobox");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-activedescendant")).toContain(
      "-option-0",
    );

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger.getAttribute("aria-activedescendant")).toContain(
      "-option-2",
    );

    fireEvent.keyDown(trigger, { key: "End" });
    expect(trigger.getAttribute("aria-activedescendant")).toContain(
      "-option-3",
    );

    fireEvent.keyDown(trigger, { key: "Home" });
    expect(trigger.getAttribute("aria-activedescendant")).toContain(
      "-option-0",
    );

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(onValueChange).toHaveBeenLastCalledWith(3);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 3 }),
    );
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.keyDown(trigger, { key: " " });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("supports panel filter, function accessors, and custom renderValue/renderOption/header/empty", () => {
    const onFilter = vi.fn();
    const { container, getByRole } = render(
      <Select<string>
        value="a"
        options={defaultOptions}
        filter
        filterPlaceholder="搜索选项"
        optionLabel={(opt: { label: string }) => opt.label.toUpperCase()}
        optionValue={(opt: { value: string }) => opt.value}
        onFilter={onFilter}
        header={<div className="custom-header">Header Slot</div>}
        renderValue={({ value }) => (
          <span className="custom-value">VAL:{value}</span>
        )}
        renderOption={({ option, selected }) => (
          <span className="custom-opt">
            {option.label}:{String(selected)}
          </span>
        )}
        empty={<span className="custom-empty">Nothing Here</span>}
      />,
    );

    expect(container.querySelector(".custom-value")?.textContent).toBe("VAL:a");

    fireEvent.click(getByRole("combobox"));

    expect(document.body.querySelector(".custom-header")?.textContent).toBe(
      "Header Slot",
    );
    expect(document.body.querySelectorAll(".custom-opt")).toHaveLength(3);

    const filterInput = document.body.querySelector<HTMLInputElement>(
      ".mw-select__filter-input",
    );
    expect(filterInput).not.toBeNull();
    fireEvent.change(filterInput!, { target: { value: "gam" } });

    expect(onFilter).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: "gam" }),
    );
    const visibleOptions = document.body.querySelectorAll('[role="option"]');
    expect(visibleOptions).toHaveLength(1);
    expect(visibleOptions[0]?.textContent).toContain("Gamma:false");

    fireEvent.change(filterInput!, { target: { value: "zzz" } });
    expect(document.body.querySelector(".custom-empty")?.textContent).toBe(
      "Nothing Here",
    );
  });

  it("blocks opening and hides clear button when disabled, readonly, or loading", () => {
    const { container, getByRole, rerender } = render(
      <Select
        value="a"
        options={defaultOptions}
        optionLabel="label"
        optionValue="value"
        showClear
        disabled
      />,
    );

    expect(container.querySelector("button.mw-select__clear")).toBeNull();
    fireEvent.click(getByRole("combobox"));
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();

    rerender(
      <Select
        value="a"
        options={defaultOptions}
        optionLabel="label"
        optionValue="value"
        showClear
        readonly
      />,
    );
    expect(container.querySelector("button.mw-select__clear")).toBeNull();
    fireEvent.click(getByRole("combobox"));
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();

    rerender(
      <Select
        value="a"
        options={defaultOptions}
        optionLabel="label"
        optionValue="value"
        showClear
        loading
      />,
    );
    expect(container.querySelector(".mw-select__spinner")).not.toBeNull();
    fireEvent.click(getByRole("combobox"));
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
  });

  it("supports editable trigger input and uncontrolled defaultValue", () => {
    function EditableHost() {
      const [val, setVal] = useState<string | null>("a");
      return (
        <Select
          value={val}
          onValueChange={setVal}
          options={[{ label: "Alpha", value: "a" }]}
          optionLabel="label"
          optionValue="value"
          editable
          inputId="editable-select"
        />
      );
    }

    const { container } = render(<EditableHost />);
    const input =
      container.querySelector<HTMLInputElement>("input#editable-select")!;
    expect(input.value).toBe("Alpha");

    fireEvent.change(input, { target: { value: "Custom Value" } });
    expect(input.value).toBe("Custom Value");
  });

  it("locks fit width to widest candidate and degrades gracefully without canvas", () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue({
        measureText: (text: string) => ({ width: text.length * 10 }),
        letterSpacing: "0px",
      } as unknown as CanvasRenderingContext2D);

    const { getByRole, rerender } = render(
      <Select
        value="a"
        options={[
          { label: "Alpha", value: "a" },
          { label: "Beta", value: "b" },
          { label: "Widest Option Value", value: "w" },
        ]}
        optionLabel="label"
        optionValue="value"
      />,
    );

    const fitOf = () =>
      (getByRole("combobox") as HTMLElement).style.getPropertyValue(
        "--mw-select-fit-text",
      );
    expect(fitOf()).toBe("192px");

    rerender(
      <Select
        value="a"
        options={[
          { label: "Alpha", value: "a" },
          { label: "Beta", value: "b" },
        ]}
        optionLabel="label"
        optionValue="value"
      />,
    );
    expect(fitOf()).toBe("52px");

    spy.mockReturnValue(null);
    rerender(
      <Select
        value="a"
        options={defaultOptions}
        optionLabel="label"
        optionValue="value"
      />,
    );
    expect(fitOf()).toBe("0px");
  });

  it("inherits inputId, invalid, disabled, required, and describedBy from FormFieldContext", () => {
    const { getByRole } = render(
      <FormFieldContext.Provider
        value={{
          inputId: "ctx-select",
          invalid: true,
          disabled: true,
          required: true,
          describedBy: "ctx-help ctx-error",
        }}
      >
        <Select
          value={null}
          options={defaultOptions}
          optionLabel="label"
          optionValue="value"
          ariaDescribedby="extra-desc"
        />
      </FormFieldContext.Provider>,
    );

    const trigger = getByRole("combobox");
    expect(trigger.getAttribute("id")).toBe("ctx-select");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(trigger.getAttribute("data-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-disabled")).toBe("true");
    expect(trigger.getAttribute("data-disabled")).toBe("true");
    expect(trigger.getAttribute("aria-required")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toBe(
      "ctx-help ctx-error extra-desc",
    );
  });
});
