// FileDropZone 契约：drop 与点选两条路都归一成 File[] 走 files 事件；高亮只跟
// 「文件拖拽」走（纯文本拖拽不点亮），嵌套深度计数保证进子元素再出来不闪烁。
import { mountUiComponent } from "../test-utils/mount";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";

import FileDropZone from "./FileDropZone.vue";

function makeFile(name: string): File {
  return new File(["x"], name, { type: "text/plain" });
}

function mountZone(props: Record<string, unknown> = {}) {
  return mountUiComponent(FileDropZone, {
    props,
    slots: { default: () => h("p", "hint") },
    attachTo: document.body,
  });
}

/** jsdom 没有 DataTransfer，直接给 trigger 塞一个最小形状。 */
function dragPayload(files: File[], types = ["Files"]) {
  return { dataTransfer: { files, types } };
}

describe("FileDropZone", () => {
  it("drop 带文件：emit files，高亮复位", async () => {
    const wrapper = mountZone();
    const zone = wrapper.find(".mw-filedrop");
    await zone.trigger("dragenter", dragPayload([]));
    expect(zone.classes()).toContain("mw-filedrop--over");

    const file = makeFile("a.pdf");
    await zone.trigger("drop", dragPayload([file]));
    expect(wrapper.emitted("files")![0]![0]).toEqual([file]);
    expect(wrapper.find(".mw-filedrop").classes()).not.toContain("mw-filedrop--over");
  });

  it("非文件拖拽（纯文本）不点亮高亮", async () => {
    const wrapper = mountZone();
    await wrapper.find(".mw-filedrop").trigger("dragenter", dragPayload([], ["text/plain"]));
    expect(wrapper.find(".mw-filedrop").classes()).not.toContain("mw-filedrop--over");
  });

  it("dragenter/leave 按深度计数：进出子元素不丢高亮，离开根才熄灭", async () => {
    const wrapper = mountZone({ multiple: true });
    const zone = wrapper.find(".mw-filedrop");
    await zone.trigger("dragenter", dragPayload([]));
    await wrapper.find("p").trigger("dragenter", dragPayload([]));
    await wrapper.find("p").trigger("dragleave");
    expect(zone.classes()).toContain("mw-filedrop--over");
    await zone.trigger("dragleave");
    expect(zone.classes()).not.toContain("mw-filedrop--over");
  });

  it("点选：click 打开 file picker，change 归一成 File[]", async () => {
    const wrapper = mountZone();
    const input = wrapper.find('input[type="file"]');
    const click = vi.spyOn(input.element as HTMLInputElement, "click").mockImplementation(() => {});
    await wrapper.find(".mw-filedrop").trigger("click");
    expect(click).toHaveBeenCalledOnce();

    const file = makeFile("b.md");
    Object.defineProperty(input.element, "files", { value: [file] });
    await input.trigger("change");
    expect(wrapper.emitted("files")![0]![0]).toEqual([file]);
    // input 已清空，重选同一文件仍会触发 change。
    expect((input.element as HTMLInputElement).value).toBe("");
  });

  it("accept 与 multiple 透传给隐藏 input", () => {
    const wrapper = mountZone({ accept: ".pdf,application/pdf", multiple: true });
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    expect(input.accept).toBe(".pdf,application/pdf");
    expect(input.multiple).toBe(true);
  });

  it("disabled 时拖入、点选和键盘均不发出文件", async () => {
    const wrapper = mountZone({ disabled: true, ariaLabel: "暂不可上传" });
    const zone = wrapper.find(".mw-filedrop");
    const input = wrapper.find('input[type="file"]');
    const click = vi.spyOn(input.element as HTMLInputElement, "click").mockImplementation(() => {});

    expect(zone.attributes("aria-label")).toBe("暂不可上传");
    expect(zone.attributes("tabindex")).toBe("-1");
    expect(input.attributes("disabled")).toBeDefined();
    await zone.trigger("dragenter", dragPayload([]));
    await zone.trigger("drop", dragPayload([makeFile("blocked.pdf")]));
    await zone.trigger("click");
    await zone.trigger("keydown", { key: "Enter" });

    expect(zone.classes()).not.toContain("mw-filedrop--over");
    expect(click).not.toHaveBeenCalled();
    expect(wrapper.emitted("files")).toBeUndefined();
  });
});
