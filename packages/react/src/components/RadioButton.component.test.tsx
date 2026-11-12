import { fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import FormField from "./FormField";
import RadioButton from "./RadioButton";

describe("RadioButton", () => {
  it("渲染原生 input[type=radio]，支持受控值选中与外部 label[htmlFor] 联动点击且不重复派发", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();

    function Host() {
      const [selected, setSelected] = useState("opt-a");
      return (
        <div>
          <RadioButton modelValue={selected} value="opt-a" inputId="radio-a" name="group-1" />
          <label htmlFor="radio-a" id="label-a">
            选项 A
          </label>
          <RadioButton
            modelValue={selected}
            value="opt-b"
            inputId="radio-b"
            name="group-1"
            onValueChange={(val) => {
              setSelected(val);
              onValueChange(val);
            }}
            onChange={onChange}
          />
          <label htmlFor="radio-b" id="label-b">
            选项 B
          </label>
        </div>
      );
    }

    const { container } = render(<Host />);
    const radios = container.querySelectorAll(".mw-radio");
    expect(radios).toHaveLength(2);
    expect(radios[0]!.classList.contains("mw-radio--checked")).toBe(true);
    expect(radios[1]!.classList.contains("mw-radio--checked")).toBe(false);

    const inputB = container.querySelector<HTMLInputElement>("input#radio-b")!;
    expect(inputB.getAttribute("type")).toBe("radio");
    expect(inputB.getAttribute("name")).toBe("group-1");

    fireEvent.click(container.querySelector("label#label-b")!);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("opt-b");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "opt-b" }));
    expect(radios[1]!.classList.contains("mw-radio--checked")).toBe(true);
  });

  it("支持 binary 二值模式、空格键切换、FormField 联动以及 disabled / readonly / invalid 状态", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <FormField inputId="binary-radio" label="启用" error="需要选择">
        <RadioButton modelValue={false} binary onValueChange={onValueChange} />
      </FormField>,
    );

    const root = container.querySelector(".mw-radio")!;
    const input = container.querySelector<HTMLInputElement>("input#binary-radio")!;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("binary-radio-error");
    expect(root.getAttribute("data-invalid")).toBe("");

    fireEvent.keyDown(input, { key: " " });
    expect(onValueChange).toHaveBeenLastCalledWith(true);

    rerender(
      <FormField inputId="binary-radio" label="启用" error="需要选择">
        <RadioButton modelValue={false} binary disabled onValueChange={onValueChange} />
      </FormField>,
    );
    expect(root.getAttribute("data-disabled")).toBe("");
    fireEvent.click(input);
    expect(onValueChange).toHaveBeenCalledTimes(1);

    rerender(
      <FormField inputId="binary-radio" label="启用" error="需要选择">
        <RadioButton modelValue={false} binary readOnly onValueChange={onValueChange} />
      </FormField>,
    );
    expect(root.getAttribute("data-readonly")).toBe("");
    fireEvent.click(input);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
});
