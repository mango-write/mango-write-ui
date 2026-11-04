import { defineComponent, h, markRaw } from "vue";
import { describe, expect, it } from "vitest";
import { mountUiComponent } from "../test-utils/mount.js";
import Message from "./Message.vue";

describe("Message", () => {
  it("默认以 info 语义与 status 角色渲染横幅内容", () => {
    const wrapper = mountUiComponent(Message, {
      slots: { default: "系统正在同步您的文献索引" },
    });

    const root = wrapper.get(".mw-message");
    expect(root.classes()).toContain("mw-message--info");
    expect(root.attributes("role")).toBe("status");
    expect(root.attributes("data-severity")).toBe("info");
    expect(root.text()).toContain("系统正在同步您的文献索引");
    expect(wrapper.find(".mw-message__close").exists()).toBe(false);
  });

  it("按 severity 映射无障碍角色，并将 warning 归一为 warn", () => {
    const errorWrapper = mountUiComponent(Message, {
      props: { severity: "error" },
      slots: { default: "保存失败" },
    });
    expect(errorWrapper.get(".mw-message").attributes("role")).toBe("alert");
    expect(errorWrapper.get(".mw-message").classes()).toContain("mw-message--error");

    const warnWrapper = mountUiComponent(Message, {
      props: { severity: "warn" },
      slots: { default: "请注意配额剩余" },
    });
    expect(warnWrapper.get(".mw-message").attributes("role")).toBe("alert");
    expect(warnWrapper.get(".mw-message").classes()).toContain("mw-message--warn");

    const warningWrapper = mountUiComponent(Message, {
      props: { severity: "warning" },
      slots: { default: "兼容旧 warning 枚举" },
    });
    expect(warningWrapper.get(".mw-message").attributes("role")).toBe("alert");
    expect(warningWrapper.get(".mw-message").classes()).toContain("mw-message--warn");
    expect(warningWrapper.get(".mw-message").attributes("data-severity")).toBe("warn");

    for (const severity of ["success", "secondary", "contrast"] as const) {
      const w = mountUiComponent(Message, {
        props: { severity },
        slots: { default: severity },
      });
      expect(w.get(".mw-message").attributes("role")).toBe("status");
      expect(w.get(".mw-message").classes()).toContain(`mw-message--${severity}`);
    }
  });

  it("支持字符串 icon、组件 icon 与 #icon 插槽", () => {
    const strWrapper = mountUiComponent(Message, {
      props: { icon: "pi pi-check" },
      slots: { default: "完成" },
    });
    expect(strWrapper.find(".mw-message__icon i.pi.pi-check").exists()).toBe(true);

    const CustomIcon = markRaw(
      defineComponent({
        render() {
          return h("svg", { "data-testid": "custom-svg-icon" });
        },
      }),
    );
    const compWrapper = mountUiComponent(Message, {
      props: { icon: CustomIcon },
      slots: { default: "自定义图标组件" },
    });
    expect(compWrapper.find('[data-testid="custom-svg-icon"]').exists()).toBe(true);

    const slotWrapper = mountUiComponent(Message, {
      slots: {
        default: "插槽图标",
        icon: () => h("span", { "data-testid": "slot-icon" }, "!"),
      },
    });
    expect(slotWrapper.find('[data-testid="slot-icon"]').exists()).toBe(true);
  });

  it("closable=true 时提供带国际化标签的关闭按钮并触发 close 事件", async () => {
    const wrapper = mountUiComponent(Message, {
      props: { severity: "error", closable: true },
      slots: { default: "可关闭错误提示" },
    });

    const closeBtn = wrapper.get(".mw-message__close");
    expect(closeBtn.attributes("aria-label")).toBe("关闭");

    await closeBtn.trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(wrapper.emitted("close")?.[0]?.[0]).toBeInstanceOf(MouseEvent);
    expect(wrapper.find(".mw-message").exists()).toBe(false);
  });

  it("透传 id、data-*、aria-* 并合并 class 与 style", () => {
    const wrapper = mountUiComponent(Message, {
      attrs: {
        id: "sync-banner",
        "data-testid": "banner-node",
        "aria-live": "polite",
        class: "custom-banner",
        style: "margin-top: 8px",
      },
      slots: { default: "透传检查" },
    });

    const root = wrapper.get("#sync-banner");
    expect(root.attributes("data-testid")).toBe("banner-node");
    expect(root.attributes("aria-live")).toBe("polite");
    expect(root.classes()).toContain("mw-message");
    expect(root.classes()).toContain("custom-banner");
    expect(root.attributes("style")).toContain("margin-top: 8px");
  });
});
