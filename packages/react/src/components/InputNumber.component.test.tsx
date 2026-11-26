import { useState } from "react";
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

  it("在受控千分位数值前部连续输入、替换首位与跨逗号删除时光标不跳到末尾", () => {
    let latest: number | null = 2_000_000;
    function Host() {
      const [val, setVal] = useState<number | null>(2_000_000);
      return (
        <InputNumber
          value={val}
          onValueChange={(next) => {
            latest = next;
            setVal(next);
          }}
          locale="en-US"
          maxFractionDigits={0}
          inputId="tokens-limit"
        />
      );
    }

    const { container } = render(<Host />);
    const input = container.querySelector<HTMLInputElement>("input#tokens-limit")!;
    expect(input.value).toBe("2,000,000");

    fireEvent.focus(input);

    const nativeValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )!.set!;
    const dispatchInputAt = (raw: string, caret: number, init: InputEventInit) => {
      nativeValueSetter.call(input, raw);
      input.setSelectionRange(caret, caret);
      input.dispatchEvent(new InputEvent("input", { bubbles: true, ...init }));
    };

    // 在 2 后依次输入 5、0、0：2,000,000 -> 2,500,000,000
    dispatchInputAt("25,000,000", 2, { inputType: "insertText", data: "5" });
    expect(input.value).toBe("25,000,000");
    expect(input.selectionStart).toBe(2);
    expect(latest).toBe(25_000_000);

    dispatchInputAt("2500,000,000", 4, { inputType: "insertText", data: "0" });
    expect(input.value).toBe("2,500,000,000");
    expect(input.selectionStart).toBe(5);
    expect(latest).toBe(2_500_000_000);

    // 合成 keyPress 在首位插入数字同样保持光标在插入位之后
    input.setSelectionRange(0, 0);
    fireEvent.keyPress(input, { key: "1", charCode: 49 });
    expect(input.value).toBe("12,500,000,000");
    expect(input.selectionStart).toBe(1);
    expect(latest).toBe(12_500_000_000);

    // 贴逗号按 Backspace（12,|500,000,000 -> 删掉逗号后 12500,000,000，caret=2）跨过逗号删掉 2
    dispatchInputAt("12500,000,000", 2, { inputType: "deleteContentBackward" });
    expect(input.value).toBe("1,500,000,000");
    expect(input.selectionStart).toBe(1);
    expect(latest).toBe(1_500_000_000);

    // 删除前部数字留下前导逗号 ,000,000 时，消去悬空逗号并保留前导零 000,000，失焦再规整为 0
    dispatchInputAt(",000,000", 0, { inputType: "deleteContentBackward" });
    expect(input.value).toBe("000,000");
    expect(input.selectionStart).toBe(0);
    expect(latest).toBe(0);

    fireEvent.blur(input);
    expect(input.value).toBe("0");
  });

  it("覆盖 de-DE 整数失焦往返、USD 默认精度同步与 IME 组合态键盘隔离", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <InputNumber
        value={2000}
        locale="de-DE"
        maxFractionDigits={0}
        inputId="de-int"
        onValueChange={onValueChange}
      />,
    );
    const input = container.querySelector<HTMLInputElement>("input#de-int")!;
    expect(input.value).toBe("2.000");

    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(input.value).toBe("2.000");
    expect(onValueChange).not.toHaveBeenCalledWith(2);

    // USD 默认两位小数：输入 $1.234 首次提交即发出 1.23 并显示 $1.23
    rerender(
      <InputNumber
        value={1}
        mode="currency"
        currency="USD"
        locale="en-US"
        inputId="de-int"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "$1.234" } });
    expect(onValueChange).toHaveBeenLastCalledWith(1.23);
    fireEvent.blur(input);
    expect(input.value).toBe("$1.23");

    // IME 组合期 ArrowUp 不触发步进
    onValueChange.mockClear();
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: "ArrowUp", keyCode: 229 });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
  });
});
