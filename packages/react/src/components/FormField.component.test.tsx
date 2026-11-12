import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormField, { useFormFieldContext } from "./FormField";

function ContextProbeInput() {
  const ctx = useFormFieldContext();
  return (
    <input
      id={ctx.inputId}
      aria-describedby={ctx.describedBy}
      aria-invalid={ctx.invalid}
      aria-required={ctx.required}
      disabled={ctx.disabled}
    />
  );
}

describe("FormField", () => {
  it("通过 render-prop 关联常驻标签、说明和错误，并把状态交给输入控件", () => {
    const { container } = render(
      <FormField
        inputId="paper-title"
        label="论文标题"
        hint="使用项目中的正式标题"
        error="标题不能为空"
        required
      >
        {(slotProps) => (
          <input
            id={slotProps.inputId}
            aria-describedby={slotProps.describedBy}
            aria-invalid={slotProps.invalid}
            aria-required={slotProps.required}
          />
        )}
      </FormField>,
    );

    const input = container.querySelector("input")!;
    const label = container.querySelector("label")!;

    expect(label.getAttribute("for")).toBe("paper-title");
    expect(input.getAttribute("id")).toBe("paper-title");
    expect(input.getAttribute("aria-describedby")).toBe("paper-title-hint paper-title-error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-required")).toBe("true");
    expect(container.querySelector("#paper-title-hint")?.textContent).toBe("使用项目中的正式标题");
    expect(container.querySelector("#paper-title-error")?.getAttribute("role")).toBe("alert");
  });

  it("支持普通 JSX 子节点通过 FormFieldContext 自动联动且无提示时不产生空关联 id", () => {
    const { container, rerender } = render(
      <FormField inputId="author-name" label="作者">
        <ContextProbeInput />
      </FormField>,
    );

    const input = container.querySelector("input")!;
    expect(input.getAttribute("id")).toBe("author-name");
    expect(input.getAttribute("aria-describedby")).toBeNull();
    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(container.querySelector('[role="alert"]')).toBeNull();

    rerender(
      <FormField inputId="author-name" label="作者" error="必填" disabled required>
        <ContextProbeInput />
      </FormField>,
    );
    expect(input.getAttribute("aria-describedby")).toBe("author-name-error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-required")).toBe("true");
    expect(input).toHaveProperty("disabled", true);
  });
});
