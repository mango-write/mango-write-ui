import { describe, expect, it } from "vitest";
import { defineComponent, h, markRaw } from "vue";
import { mountUiComponent } from "../test-utils/mount.js";
import Avatar from "./Avatar.vue";

describe("Avatar", () => {
  it("渲染 label、icon、自定义插槽及 shape/size 类名", async () => {
    const labelAvatar = mountUiComponent(Avatar, {
      props: {
        label: "张",
        shape: "circle",
        size: "large",
        ariaLabel: "张三",
      },
    });

    const root = labelAvatar.get(".mw-avatar");
    expect(root.classes()).toContain("mw-avatar--circle");
    expect(root.classes()).toContain("mw-avatar--large");
    expect(root.attributes("aria-label")).toBe("张三");
    expect(labelAvatar.get(".mw-avatar__label").text()).toBe("张");

    await root.trigger("click");
    await root.trigger("keydown", { key: "Enter" });
    expect(labelAvatar.emitted("click")).toHaveLength(1);
    expect(labelAvatar.emitted("keydown")).toHaveLength(1);

    const CustomIcon = markRaw(
      defineComponent({
        render() {
          return h("svg", { class: "avatar-svg" });
        },
      }),
    );
    const iconAvatar = mountUiComponent(Avatar, {
      props: { icon: CustomIcon, size: "xlarge" },
    });
    expect(iconAvatar.find(".avatar-svg").exists()).toBe(true);
    expect(iconAvatar.get(".mw-avatar").classes()).toContain("mw-avatar--xlarge");
  });

  it("image 加载失败时触发 error 事件并自动回退到 label 或 icon", async () => {
    const wrapper = mountUiComponent(Avatar, {
      props: {
        image: "https://example.com/broken.png",
        label: "M",
        shape: "circle",
      },
    });

    const img = wrapper.find("img.mw-avatar__image");
    expect(img.exists()).toBe(true);

    await img.trigger("error");
    expect(wrapper.emitted("error")).toHaveLength(1);
    expect(wrapper.find("img.mw-avatar__image").exists()).toBe(false);
    expect(wrapper.get(".mw-avatar__label").text()).toBe("M");

    // 更新 image 后恢复尝试加载
    await wrapper.setProps({ image: "https://example.com/recovered.png" });
    expect(wrapper.find("img.mw-avatar__image").exists()).toBe(true);
  });
});
