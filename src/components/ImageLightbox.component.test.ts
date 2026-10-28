import { nextTick } from "vue";
import { afterEach, describe, expect, it } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import ImageLightbox from "./ImageLightbox.vue";

let mounted: ReturnType<typeof mountUiComponent> | null = null;

afterEach(() => {
  mounted?.unmount();
  mounted = null;
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

function mountLightbox(visible = false) {
  mounted = mountUiComponent(ImageLightbox, {
    attachTo: document.body,
    props: {
      visible,
      src: "/figure.png",
      alt: "实验结果图",
      caption: "图 1 实验结果",
    },
    global: { stubs: { transition: false } },
  });
  return mounted;
}

describe("ImageLightbox", () => {
  it("打开时命名对话框、聚焦关闭按钮并锁定背景", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.append(trigger);
    trigger.focus();
    document.body.style.overflow = "auto";
    const wrapper = mountLightbox();

    await wrapper.setProps({ visible: true });
    await nextTick();
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute("aria-label")).toBe("图 1 实验结果");
    expect(document.body.style.overflow).toBe("hidden");
    expect((document.activeElement as HTMLElement).getAttribute("aria-label")).toBe("关闭");

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    expect((document.activeElement as HTMLElement).getAttribute("aria-label")).toBe("放大");

    await wrapper.setProps({ visible: false });
    await nextTick();
    expect(document.body.style.overflow).toBe("auto");
    expect(document.activeElement).toBe(trigger);
  });

  it("初始 visible=true 也安装键盘监听", async () => {
    const wrapper = mountLightbox(true);
    await nextTick();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(wrapper.emitted("update:visible")?.at(-1)).toEqual([false]);
  });
});
