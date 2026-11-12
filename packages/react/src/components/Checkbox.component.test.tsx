import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Checkbox from "./Checkbox";
import FormField from "./FormField";

describe("Checkbox", () => {
  it("支持布尔 checked / defaultChecked / onCheckedChange 与自定义 trueValue/falseValue 及空格键切换", () => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    const onChange = vi.fn();

    const { rerender, unmount } = render(
      <Checkbox
        modelValue="no"
        binary
        trueValue="yes"
        falseValue="no"
        inputId="agree-terms"
        onCheckedChange={onCheckedChange}
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    );

    const box = screen.getByRole("checkbox");
    expect(box.getAttribute("id")).toBe("agree-terms");
    expect(box.getAttribute("aria-checked")).toBe("false");
    expect(box.getAttribute("data-state")).toBe("unchecked");

    fireEvent.click(box);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(onValueChange).toHaveBeenCalledWith("yes");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: "yes", checked: true }),
    );

    rerender(
      <Checkbox
        modelValue="yes"
        binary
        trueValue="yes"
        falseValue="no"
        inputId="agree-terms"
        onCheckedChange={onCheckedChange}
        onValueChange={onValueChange}
      />,
    );
    expect(box.getAttribute("aria-checked")).toBe("true");
    expect(box.getAttribute("data-state")).toBe("checked");

    fireEvent.keyDown(box, { key: " " });
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(onValueChange).toHaveBeenLastCalledWith("no");

    unmount();

    render(<Checkbox defaultChecked onCheckedChange={onCheckedChange} />);
    const uncontrolled = screen.getByRole("checkbox");
    expect(uncontrolled.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(uncontrolled);
    expect(uncontrolled.getAttribute("aria-checked")).toBe("false");
  });

  it("支持数组多选组模式（Array.isArray(modelValue)）增删条目", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Checkbox modelValue={["a"]} value="b" onValueChange={onValueChange} />,
    );

    const box = screen.getByRole("checkbox");
    expect(box.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(box);
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b"]);

    rerender(<Checkbox modelValue={["a", "b"]} value="b" onValueChange={onValueChange} />);
    expect(box.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(box);
    expect(onValueChange).toHaveBeenLastCalledWith(["a"]);
  });

  it("支持 indeterminate 半选态、FormField 联动与 disabled / readonly / invalid 拦截", () => {
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <FormField inputId="policy-check" label="协议" error="请勾选协议" required>
        <Checkbox checked={false} indeterminate disabled onCheckedChange={onCheckedChange} />
      </FormField>,
    );

    const box = screen.getByRole("checkbox");
    expect(box.getAttribute("id")).toBe("policy-check");
    expect(box.getAttribute("aria-checked")).toBe("mixed");
    expect(box.getAttribute("data-state")).toBe("indeterminate");
    expect(box.getAttribute("aria-invalid")).toBe("true");
    expect(box.getAttribute("data-invalid")).toBe("");
    expect(box.getAttribute("data-disabled")).toBe("");
    expect(box.getAttribute("aria-describedby")).toBe("policy-check-error");

    fireEvent.click(box);
    expect(onCheckedChange).not.toHaveBeenCalled();

    rerender(
      <FormField inputId="policy-check" label="协议" error="请勾选协议" required>
        <Checkbox checked={false} readOnly onCheckedChange={onCheckedChange} />
      </FormField>,
    );
    fireEvent.click(box);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
