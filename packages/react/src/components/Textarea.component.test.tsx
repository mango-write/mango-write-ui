import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FormField from "./FormField";
import Textarea from "./Textarea";

describe("Textarea", () => {
  it("支持受控读写、非受控 defaultValue、rows 配置与类名落点", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Textarea
        value="第一段"
        inputId="abstract-field"
        rows={5}
        onValueChange={onValueChange}
      />,
    );

    const textarea = container.querySelector("textarea")!;
    expect(textarea.getAttribute("id")).toBe("abstract-field");
    expect(textarea.getAttribute("rows")).toBe("5");
    expect(textarea.classList.contains("mw-textarea")).toBe(true);
    expect(textarea.classList.contains("mw-control")).toBe(true);
    expect(textarea.value).toBe("第一段");

    fireEvent.change(textarea, { target: { value: "第一段\n第二段" } });
    expect(onValueChange).toHaveBeenCalledWith("第一段\n第二段");
  });

  it("IME 组合输入期间不提前提交，compositionend 时发出最终字符串", () => {
    const onValueChange = vi.fn();
    const { container } = render(<Textarea value="" onValueChange={onValueChange} />);

    const textarea = container.querySelector("textarea")!;
    fireEvent.compositionStart(textarea);
    fireEvent.change(textarea, { target: { value: "zhai" } });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(textarea, { target: { value: "摘要" } });
    fireEvent.compositionEnd(textarea);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("摘要");
  });

  it("支持 autoResize、FormField 联动及 invalid / disabled / readonly 属性落点", () => {
    const { container, rerender } = render(
      <FormField inputId="summary-input" label="摘要" error="摘要过短" required>
        <Textarea value="内容" autoResize disabled readOnly />
      </FormField>,
    );

    const textarea = container.querySelector("textarea")!;
    expect(textarea.getAttribute("id")).toBe("summary-input");
    expect(textarea.getAttribute("aria-describedby")).toBe("summary-input-error");
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(textarea.getAttribute("data-invalid")).toBe("");
    expect(textarea.getAttribute("data-disabled")).toBe("");
    expect(textarea.getAttribute("data-readonly")).toBe("");

    Object.defineProperty(textarea, "scrollHeight", {
      configurable: true,
      value: 96,
    });
    rerender(
      <FormField inputId="summary-input" label="摘要" error="摘要过短" required>
        <Textarea value="更长的多行内容" autoResize disabled readOnly />
      </FormField>,
    );
    expect(textarea.style.height).toBe("96px");
  });
});
