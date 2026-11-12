import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FormField from "./FormField";
import ToggleSwitch from "./ToggleSwitch";

describe("ToggleSwitch", () => {
  it("基于 Radix Switch 渲染并支持受控 checked 与非受控 defaultChecked 切换", () => {
    const onCheckedChange = vi.fn();
    const onChange = vi.fn();
    const { rerender, unmount } = render(
      <ToggleSwitch
        checked={false}
        inputId="dark-mode-switch"
        onCheckedChange={onCheckedChange}
        onChange={onChange}
      />,
    );

    const sw = screen.getByRole("switch");
    expect(sw.getAttribute("id")).toBe("dark-mode-switch");
    expect(sw.getAttribute("aria-checked")).toBe("false");
    expect(sw.getAttribute("data-state")).toBe("unchecked");

    fireEvent.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(
      <ToggleSwitch
        checked
        inputId="dark-mode-switch"
        onCheckedChange={onCheckedChange}
        onChange={onChange}
      />,
    );
    expect(sw.getAttribute("aria-checked")).toBe("true");
    expect(sw.getAttribute("data-state")).toBe("checked");

    unmount();

    render(<ToggleSwitch defaultChecked />);
    const uncontrolled = screen.getByRole("switch");
    expect(uncontrolled.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(uncontrolled);
    expect(uncontrolled.getAttribute("aria-checked")).toBe("false");
  });

  it("disabled 与 readonly 状态下不改变开关状态并与 FormField 联动输出无障碍属性", () => {
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <FormField inputId="notify-switch" label="邮件通知" error="配置冲突">
        <ToggleSwitch checked={false} disabled onCheckedChange={onCheckedChange} />
      </FormField>,
    );

    const sw = screen.getByRole("switch");
    expect(sw.getAttribute("id")).toBe("notify-switch");
    expect(sw.getAttribute("aria-describedby")).toBe("notify-switch-error");
    expect(sw.getAttribute("aria-invalid")).toBe("true");
    expect(sw.getAttribute("data-invalid")).toBe("");
    expect(sw.getAttribute("data-disabled")).toBe("");

    fireEvent.click(sw);
    expect(onCheckedChange).not.toHaveBeenCalled();

    rerender(
      <FormField inputId="notify-switch" label="邮件通知" error="配置冲突">
        <ToggleSwitch checked={false} readOnly onCheckedChange={onCheckedChange} />
      </FormField>,
    );
    fireEvent.click(sw);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(sw.getAttribute("data-state")).toBe("unchecked");
  });
});
