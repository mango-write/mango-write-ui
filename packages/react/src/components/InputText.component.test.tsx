import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FormField from "./FormField";
import InputText from "./InputText";

describe("InputText", () => {
  it("支持受控 value 读写、非受控 defaultValue 与原生焦点/键盘事件", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onKeyDown = vi.fn();

    const { container, unmount } = render(
      <InputText
        value="初始标题"
        inputId="doc-title"
        name="title"
        placeholder="请输入标题"
        onValueChange={onValueChange}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />,
    );

    const input = container.querySelector("input")!;
    expect(input.getAttribute("id")).toBe("doc-title");
    expect(input.getAttribute("name")).toBe("title");
    expect(input.classList.contains("mw-input-text")).toBe(true);
    expect(input.classList.contains("mw-control")).toBe(true);
    expect(input.classList.contains("mw-input")).toBe(true);
    expect(input.value).toBe("初始标题");

    fireEvent.change(input, { target: { value: "更新后的标题" } });
    expect(onValueChange).toHaveBeenCalledWith("更新后的标题");
    expect(onChange).toHaveBeenCalledTimes(1);

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onKeyDown).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);

    unmount();

    const { container: c2 } = render(<InputText defaultValue="默认文案" />);
    const uncontrolled = c2.querySelector("input")!;
    expect(uncontrolled.value).toBe("默认文案");
    fireEvent.change(uncontrolled, { target: { value: "新文案" } });
    expect(uncontrolled.value).toBe("新文案");
  });

  it("IME 组合输入期间不提前发出 onValueChange，compositionend 时提交最终值", () => {
    const onValueChange = vi.fn();
    const { container } = render(<InputText value="" onValueChange={onValueChange} />);

    const input = container.querySelector("input")!;
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "zhong" } });
    expect(input.value).toBe("zhong");
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "中文" } });
    fireEvent.compositionEnd(input);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("中文");
  });

  it("正确反映 invalid / disabled / readonly 状态并与 FormField Context 联动", () => {
    const { container } = render(
      <FormField
        inputId="email-input"
        label="邮箱"
        hint="用于接收通知"
        error="邮箱格式不正确"
        required
      >
        <InputText disabled readOnly />
      </FormField>,
    );

    const input = container.querySelector("input")!;
    expect(input.getAttribute("id")).toBe("email-input");
    expect(input.getAttribute("aria-describedby")).toBe("email-input-hint email-input-error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("data-invalid")).toBe("");
    expect(input.getAttribute("data-disabled")).toBe("");
    expect(input.getAttribute("data-readonly")).toBe("");
    expect(input.hasAttribute("required")).toBe(true);
  });
});
