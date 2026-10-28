import { h } from "vue";
import { describe, expect, it } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import FormField from "./FormField.vue";

function mountField(props: Record<string, unknown> = {}) {
  return mountUiComponent(FormField, {
    props: { inputId: "paper-title", label: "论文标题", ...props },
    slots: {
      default: (slotProps: Record<string, unknown>) =>
        h("input", {
          id: slotProps.inputId,
          "aria-describedby": slotProps.describedBy,
          "aria-invalid": slotProps.invalid,
          "aria-required": slotProps.required,
        }),
    },
  });
}

describe("FormField", () => {
  it("关联常驻标签、说明和错误，并把状态交给输入控件", () => {
    const wrapper = mountField({
      hint: "使用项目中的正式标题",
      error: "标题不能为空",
      required: true,
    });
    const input = wrapper.get("input");
    const label = wrapper.get("label");

    expect(label.attributes("for")).toBe("paper-title");
    expect(input.attributes("id")).toBe("paper-title");
    expect(input.attributes("aria-describedby")).toBe("paper-title-hint paper-title-error");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("aria-required")).toBe("true");
    expect(wrapper.get("#paper-title-hint").text()).toBe("使用项目中的正式标题");
    expect(wrapper.get("#paper-title-error").attributes("role")).toBe("alert");
  });

  it("没有说明或错误时不产生空的关联 id", () => {
    const wrapper = mountField();
    expect(wrapper.get("input").attributes("aria-describedby")).toBeUndefined();
    expect(wrapper.get("input").attributes("aria-invalid")).toBe("false");
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });
});
