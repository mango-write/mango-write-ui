import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SelectButton from "./SelectButton";

describe("SelectButton", () => {
  it("支持单选模式、allowEmpty 控制与原始值/对象选项", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    const opts = [
      { label: "选项 A", value: "a" },
      { label: "选项 B", value: "b" },
      { label: "禁用项", value: "c", disabled: true },
    ];

    const { container, rerender } = render(
      <SelectButton
        value="a"
        options={opts}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        allowEmpty={false}
        ariaLabel="切换模式"
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    );

    const group = screen.getByRole("group", { name: "切换模式" });
    expect(group.classList.contains("mw-select-button")).toBe(true);

    const buttons = container.querySelectorAll<HTMLButtonElement>("button.mw-select-button__item");
    expect(buttons).toHaveLength(3);
    expect(buttons[0]!.getAttribute("aria-pressed")).toBe("true");
    expect(buttons[0]!.classList.contains("mw-select-button__item--active")).toBe(true);
    expect(buttons[1]!.getAttribute("aria-pressed")).toBe("false");
    expect(buttons[2]!).toHaveProperty("disabled", true);

    fireEvent.click(buttons[0]!);
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.click(buttons[1]!);
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: "b" }));

    fireEvent.click(buttons[2]!);
    expect(onValueChange).toHaveBeenCalledTimes(1);

    rerender(
      <SelectButton
        value="b"
        options={opts}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        allowEmpty
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(buttons[1]!);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("支持 multiple 多选模式、renderOption 自定义渲染与键盘左右方向键焦点导航", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <SelectButton
        value={["bold"]}
        options={["bold", "italic", "underline"]}
        multiple
        onValueChange={onValueChange}
        renderOption={(option: string, index: number) => (
          <span className="custom-opt">{`${index}:${option.toUpperCase()}`}</span>
        )}
      />,
    );

    const buttons = container.querySelectorAll<HTMLButtonElement>("button.mw-select-button__item");
    expect(buttons[0]!.querySelector(".custom-opt")?.textContent).toBe("0:BOLD");

    fireEvent.click(buttons[1]!);
    expect(onValueChange).toHaveBeenLastCalledWith(["bold", "italic"]);

    rerender(
      <SelectButton
        value={["bold", "italic"]}
        options={["bold", "italic", "underline"]}
        multiple
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(buttons[0]!);
    expect(onValueChange).toHaveBeenLastCalledWith(["italic"]);

    buttons[0]!.focus();
    fireEvent.keyDown(buttons[0]!, { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[1]);

    fireEvent.keyDown(buttons[1]!, { key: "End" });
    expect(document.activeElement).toBe(buttons[2]);

    fireEvent.keyDown(buttons[2]!, { key: "Home" });
    expect(document.activeElement).toBe(buttons[0]);
  });
});
