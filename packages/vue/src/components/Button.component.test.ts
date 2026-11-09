import { defineComponent, h, markRaw } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Plus } from "lucide-vue-next";

import { mountUiComponent } from "../test-utils/mount.js";
import Button from "./Button.vue";

const DummyIcon = markRaw(
  defineComponent({
    name: "DummyIcon",
    render() {
      return h("svg", { class: "dummy-svg-icon" });
    },
  }),
);

describe("Button", () => {
  it("默认渲染为 type=button 的原生按钮并支持 label 与点击事件", async () => {
    const onClick = vi.fn();
    const wrapper = mountUiComponent(Button, {
      props: {
        label: "保存修改",
        onClick,
      },
    });

    const btn = wrapper.get("button");
    expect(btn.attributes("type")).toBe("button");
    expect(btn.classes()).toContain("mw-btn");
    expect(btn.text()).toBe("保存修改");

    await btn.trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 与 loading 状态下禁止触发点击并暴露无障碍与状态属性", async () => {
    const onClick = vi.fn();
    const wrapper = mountUiComponent(Button, {
      props: {
        label: "提交",
        disabled: true,
        onClick,
      },
    });

    const btn = wrapper.get("button");
    expect(btn.attributes("disabled")).toBeDefined();
    expect(btn.attributes("aria-disabled")).toBe("true");
    expect(btn.attributes("data-disabled")).toBe("");

    await btn.trigger("click");
    expect(onClick).not.toHaveBeenCalled();

    await wrapper.setProps({ disabled: false, loading: true });
    expect(btn.attributes("disabled")).toBeDefined();
    expect(btn.attributes("aria-disabled")).toBe("true");
    expect(btn.attributes("aria-busy")).toBe("true");
    expect(btn.attributes("data-disabled")).toBe("");
    expect(btn.attributes("data-loading")).toBe("");
    expect(wrapper.find(".mw-btn__spinner").exists()).toBe(true);

    await btn.trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("纯图标按钮自动挂载 .mw-btn--icon-only，有文案或默认插槽时不挂载", () => {
    const iconOnly = mountUiComponent(Button, {
      props: {
        icon: Plus,
        "aria-label": "新建",
      },
    });
    expect(iconOnly.classes()).toContain("mw-btn--icon-only");
    expect(iconOnly.attributes("aria-label")).toBe("新建");
    expect(iconOnly.find("svg.mw-btn__icon").exists()).toBe(true);

    const withLabel = mountUiComponent(Button, {
      props: {
        icon: DummyIcon,
        label: "新建文档",
      },
    });
    expect(withLabel.classes()).not.toContain("mw-btn--icon-only");
    expect(withLabel.find(".dummy-svg-icon").exists()).toBe(true);

    const withSlot = mountUiComponent(Button, {
      props: {
        icon: Plus,
      },
      slots: {
        default: () => "插槽文本",
      },
    });
    expect(withSlot.classes()).not.toContain("mw-btn--icon-only");
    expect(withSlot.text()).toContain("插槽文本");
  });

  it("支持 href 或 as 渲染为链接并映射 variant / severity / size / badge", async () => {
    const onClick = vi.fn();
    const wrapper = mountUiComponent(Button, {
      props: {
        href: "https://example.com",
        target: "_blank",
        rel: "noopener",
        label: "查看文档",
        severity: "warn",
        outlined: true,
        size: "small",
        badge: 3,
        onClick,
      },
    });

    const link = wrapper.get("a");
    expect(link.attributes("href")).toBe("https://example.com");
    expect(link.attributes("target")).toBe("_blank");
    expect(link.attributes("type")).toBeUndefined();
    expect(link.attributes("data-variant")).toBe("outlined");
    expect(link.attributes("data-severity")).toBe("warning");
    expect(link.attributes("data-size")).toBe("sm");
    expect(wrapper.get(".mw-btn__badge").text()).toBe("3");

    await wrapper.setProps({ disabled: true });
    await link.trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });
});
