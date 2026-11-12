import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FormField from "./FormField";
import InputNumber from "./InputNumber";

describe("InputNumber", () => {
  it("支持受控数值读写、非受控 defaultValue、小数输入与清空归 null（绝不产出 0 或 NaN）", () => {
    const onValueChange = vi.fn();
    const onInput = vi.fn();
    const onBlur = vi.fn();

    const { container, rerender, unmount } = render(
      <InputNumber
        value={10}
        inputId="price-input"
        useGrouping={false}
        maxFractionDigits={2}
        onValueChange={onValueChange}
        onInput={onInput}
        onBlur={onBlur}
      />,
    );

    const root = container.querySelector(".mw-input-number")!;
    expect(root).not.toBeNull();
    const input = container.querySelector<HTMLInputElement>("input#price-input")!;
    expect(input.classList.contains("mw-input-number__input")).toBe(true);
    expect(input.classList.contains("mw-control")).toBe(true);
    expect(input.classList.contains("mw-input")).toBe(true);
    expect(input.value).toBe("10");

    fireEvent.change(input, { target: { value: "2.75" } });
    expect(onValueChange).toHaveBeenLastCalledWith(2.75);
    expect(onInput).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 2.75, formattedValue: "2.75" }),
    );

    rerender(
      <InputNumber
        value={2.75}
        inputId="price-input"
        useGrouping={false}
        maxFractionDigits={2}
        onValueChange={onValueChange}
        onInput={onInput}
        onBlur={onBlur}
      />,
    );
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
    const afterClear = onValueChange.mock.calls.at(-1)?.[0];
    expect(afterClear).toBeNull();
    expect(afterClear).not.toBe(0);
    expect(Number.isNaN(afterClear)).toBe(false);

    unmount();

    const { container: c2 } = render(
      <InputNumber defaultValue={1234.5} locale="en-US" prefix="$" showClear />,
    );
    const groupedInput = c2.querySelector<HTMLInputElement>("input")!;
    expect(groupedInput.value).toBe("$1,234.5");
    fireEvent.click(c2.querySelector(".mw-input-number__clear")!);
    expect(groupedInput.value).toBe("");
  });

  it("支持失焦与步进按钮时按 [min, max] 边界钳制，支持 ArrowUp/ArrowDown 步进", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <InputNumber
        value={5}
        min={1}
        max={10}
        step={2}
        showButtons
        useGrouping={false}
        onValueChange={onValueChange}
      />,
    );

    const incBtn = container.querySelector(".mw-input-number__button--up")!;
    const decBtn = container.querySelector(".mw-input-number__button--down")!;

    fireEvent.click(incBtn);
    expect(onValueChange).toHaveBeenLastCalledWith(7);

    rerender(
      <InputNumber
        value={9}
        min={1}
        max={10}
        step={2}
        showButtons
        useGrouping={false}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(incBtn);
    expect(onValueChange).toHaveBeenLastCalledWith(10);

    rerender(
      <InputNumber
        value={2}
        min={1}
        max={10}
        step={2}
        showButtons
        useGrouping={false}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(decBtn);
    expect(onValueChange).toHaveBeenLastCalledWith(1);

    const input = container.querySelector<HTMLInputElement>("input")!;
    rerender(
      <InputNumber
        value={5}
        min={1}
        max={10}
        step={2}
        showButtons
        useGrouping={false}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(7);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onValueChange).toHaveBeenLastCalledWith(5);

    fireEvent.change(input, { target: { value: "999" } });
    fireEvent.blur(input);
    expect(onValueChange).toHaveBeenLastCalledWith(10);
    expect(input.value).toBe("10");
  });

  it("支持合成 keypress 事件直写 0 以及前后缀格式化", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <InputNumber
        value={null}
        inputId="hours"
        useGrouping={false}
        onValueChange={onValueChange}
      />,
    );

    const input = container.querySelector<HTMLInputElement>("input#hours")!;
    fireEvent.keyPress(input, { key: "0", charCode: 48 });
    expect(input.value).toBe("0");
    expect(onValueChange).toHaveBeenLastCalledWith(0);

    rerender(
      <InputNumber
        value={50}
        inputId="hours"
        useGrouping={false}
        suffix=" %"
        onValueChange={onValueChange}
      />,
    );
    expect(input.value).toBe("50 %");
  });

  it("支持 disabled / readonly / invalid 状态并与 FormField Context 联动", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <FormField inputId="seats-input" label="席位数" error="席位数超限" required>
        <InputNumber value={5} disabled showButtons onValueChange={onValueChange} />
      </FormField>,
    );

    const input = container.querySelector<HTMLInputElement>("input#seats-input")!;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("data-invalid")).toBe("");
    expect(input.getAttribute("data-disabled")).toBe("");
    expect(input.getAttribute("aria-describedby")).toBe("seats-input-error");

    fireEvent.click(container.querySelector(".mw-input-number__button--up")!);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
