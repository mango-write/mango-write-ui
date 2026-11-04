import { describe, expect, it } from "vitest";
import { defineComponent, h, markRaw } from "vue";
import { Info } from "lucide-vue-next";
import { mountUiComponent } from "../test-utils/mount.js";
import Tag from "./Tag.vue";

describe("Tag", () => {
  it("渲染 value 属性、默认插槽与各语义色及 rounded 类名", () => {
    const wrapper = mountUiComponent(Tag, {
      props: {
        value: "Beta",
        severity: "success",
        rounded: true,
        "data-testid": "status-tag",
      },
    });

    const el = wrapper.get(".mw-tag");
    expect(el.text()).toBe("Beta");
    expect(el.classes()).toContain("mw-tag--success");
    expect(el.classes()).toContain("mw-tag--rounded");
    expect(el.attributes("data-testid")).toBe("status-tag");

    const warnWrapper = mountUiComponent(Tag, {
      props: { severity: "warning" },
      slots: { default: () => "Custom Slot" },
    });
    expect(warnWrapper.get(".mw-tag").classes()).toContain("mw-tag--warning");
    expect(warnWrapper.get(".mw-tag").text()).toBe("Custom Slot");
  });

  it("支持 Lucide 图标组件、自定义图标组件与 #icon 插槽，并转发 click 事件", async () => {
    const CustomIcon = markRaw(
      defineComponent({
        render() {
          return h("svg", { class: "custom-svg-icon" });
        },
      }),
    );

    const lucideIcon = mountUiComponent(Tag, {
      props: { value: "Info", icon: Info },
    });
    expect(lucideIcon.find("svg.mw-tag__icon").exists()).toBe(true);

    const compIcon = mountUiComponent(Tag, {
      props: { value: "Comp", icon: CustomIcon },
    });
    expect(compIcon.find(".custom-svg-icon").exists()).toBe(true);

    const slotIcon = mountUiComponent(Tag, {
      props: { value: "Slot" },
      slots: { icon: () => h("span", { class: "slot-icon" }, "*") },
    });
    expect(slotIcon.find(".slot-icon").exists()).toBe(true);

    await slotIcon.trigger("click");
    expect(slotIcon.emitted("click")).toHaveLength(1);
  });
});
