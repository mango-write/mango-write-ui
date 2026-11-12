import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ColorPicker from "./ColorPicker";
import FormField from "./FormField";

describe("ColorPicker", () => {
  it("支持无 # 与带 # 的 hex 格式受控读写，保持输入前缀约定", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();

    const { container, rerender } = render(
      <ColorPicker
        value="ff0000"
        inputId="watermark-color"
        ariaLabel="水印颜色"
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    );

    const root = container.querySelector(".mw-color-picker")!;
    expect(root).not.toBeNull();

    const input = container.querySelector<HTMLInputElement>("input#watermark-color")!;
    expect(input.getAttribute("type")).toBe("color");
    expect(input.classList.contains("mw-color-picker__input")).toBe(true);
    expect(input.value).toBe("#ff0000");

    fireEvent.change(input, { target: { value: "#00ff88" } });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith("00ff88");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: "00ff88" }));

    rerender(
      <ColorPicker
        value="#336699"
        inputId="watermark-color"
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    );
    expect(input.value).toBe("#336699");

    fireEvent.change(input, { target: { value: "#112233" } });
    expect(onValueChange).toHaveBeenLastCalledWith("#112233");
  });

  it("支持 rgb / hsb 输出格式、FormField 联动与 disabled / readonly / inline 状态", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <FormField inputId="brand-color" label="主题色" error="颜色过浅">
        <ColorPicker value="ff0000" format="rgb" inline onValueChange={onValueChange} />
      </FormField>,
    );

    const root = container.querySelector(".mw-color-picker")!;
    expect(root.classList.contains("mw-color-picker--inline")).toBe(true);
    expect(root.getAttribute("data-invalid")).toBe("");
    const input = container.querySelector<HTMLInputElement>('input[type="color"]')!;
    expect(input.getAttribute("id")).toBe("brand-color");
    expect(input.getAttribute("aria-describedby")).toBe("brand-color-error");

    fireEvent.change(input, { target: { value: "#00ff00" } });
    expect(onValueChange).toHaveBeenLastCalledWith("rgb(0, 255, 0)");

    rerender(
      <FormField inputId="brand-color" label="主题色" error="颜色过浅">
        <ColorPicker value="00ff00" format="hsb" onValueChange={onValueChange} />
      </FormField>,
    );
    fireEvent.change(input, { target: { value: "#ff0000" } });
    expect(onValueChange).toHaveBeenLastCalledWith("hsb(0, 100%, 100%)");

    rerender(
      <FormField inputId="brand-color" label="主题色" error="颜色过浅">
        <ColorPicker value="ff0000" disabled onValueChange={onValueChange} />
      </FormField>,
    );
    expect(root.getAttribute("data-disabled")).toBe("");
    fireEvent.change(input, { target: { value: "#0000ff" } });
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });
});
