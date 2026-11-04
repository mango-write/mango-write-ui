import { h, nextTick } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";

import { mountUiComponent } from "../test-utils/mount.js";
import Dialog from "./Dialog.vue";

const wrappers: VueWrapper[] = [];

function mountDialog(options: Record<string, unknown> = {}) {
  const wrapper = mountUiComponent(Dialog, {
    attachTo: document.body,
    ...options,
  });
  wrappers.push(wrapper);
  return wrapper;
}

afterEach(() => {
  while (wrappers.length > 0) {
    wrappers.pop()?.unmount();
  }
});

describe("Dialog", () => {
  it("渲染标题、说明、内容与页脚插槽，并关联无障碍标题与描述", async () => {
    const wrapper = mountDialog({
      props: {
        open: true,
        title: "编辑项目",
        description: "修改项目的基础元数据",
        width: "28rem",
        appendTo: "self",
        "data-testid": "project-dialog",
      },
      slots: {
        lead: () => h("div", { class: "lead-banner" }, "顶部提示"),
        default: () => h("p", "表单正文"),
        footer: () => h("button", { type: "button" }, "保存"),
      },
    });

    await nextTick();
    const dialog = wrapper.get('[role="dialog"]');
    expect(dialog.classes()).toContain("mw-dialog");
    expect(dialog.classes()).toContain("mw-frost");
    expect(dialog.attributes("data-testid")).toBe("project-dialog");
    expect(dialog.attributes("style")).toContain("width: 28rem");

    const titleEl = wrapper.get(".mw-dialog__title");
    const descEl = wrapper.get(".mw-dialog__description");
    expect(titleEl.text()).toBe("编辑项目");
    expect(descEl.text()).toBe("修改项目的基础元数据");
    expect(dialog.attributes("aria-labelledby")).toBe(titleEl.attributes("id"));
    expect(dialog.attributes("aria-describedby")).toBe(descEl.attributes("id"));
    expect(wrapper.get(".lead-banner").text()).toBe("顶部提示");
    expect(wrapper.get(".mw-dialog__body").text()).toContain("表单正文");
    expect(wrapper.get(".mw-dialog__footer").text()).toContain("保存");
  });

  it("支持旧调用点 visible 与 header 别名，关闭时同时发出 update:open 与 update:visible", async () => {
    const wrapper = mountDialog({
      props: {
        visible: true,
        header: "确认删除",
        appendTo: "self",
      },
      slots: {
        default: () => h("p", "删除后不可恢复"),
      },
    });

    await nextTick();
    expect(wrapper.get(".mw-dialog__title").text()).toBe("确认删除");

    await wrapper.get(".mw-dialog__close").trigger("click");
    expect(wrapper.emitted("update:open")).toEqual([[false]]);
    expect(wrapper.emitted("update:visible")).toEqual([[false]]);
  });

  it("仅在受控状态真正变为 false 后触发 afterLeave 与 hide，点击关闭按钮但受控状态未变时不误发", async () => {
    const wrapper = mountDialog({
      props: {
        open: true,
        title: "未保存拦截",
        appendTo: "self",
      },
      slots: {
        default: () => h("p", "内容"),
      },
    });

    await nextTick();
    await wrapper.get(".mw-dialog__close").trigger("click");
    expect(wrapper.emitted("update:open")).toEqual([[false]]);
    // 父组件尚未把 open 置为 false，不得提前冒充离场完成
    expect(wrapper.emitted("afterLeave")).toBeUndefined();
    expect(wrapper.emitted("hide")).toBeUndefined();

    await wrapper.setProps({ open: false });
    await nextTick();
    expect(wrapper.emitted("afterLeave")).toHaveLength(1);
    expect(wrapper.emitted("hide")).toHaveLength(1);
  });

  it("默认 Esc 可关闭、遮罩点击不可关闭；显式配置 closeOnEscape 与 dismissableMask 优先", async () => {
    const wrapper = mountDialog({
      props: {
        open: true,
        title: "默认遮罩策略",
        appendTo: "self",
      },
      slots: {
        default: () => h("p", "内容"),
      },
    });

    await nextTick();
    const overlay = wrapper.get(".mw-dialog__overlay");
    await overlay.trigger("click");
    expect(wrapper.emitted("update:open")).toBeUndefined();

    const dialog = wrapper.get('[role="dialog"]');
    await dialog.trigger("keydown", { key: "Escape" });
    expect(wrapper.emitted("update:open")).toEqual([[false]]);

    // 显式关闭 Esc、开启遮罩关闭
    const wrapper2 = mountDialog({
      props: {
        open: true,
        title: "自定义策略",
        closeOnEscape: false,
        dismissableMask: true,
        appendTo: "self",
      },
      slots: {
        default: () => h("p", "内容"),
      },
    });

    await nextTick();
    await wrapper2.get('[role="dialog"]').trigger("keydown", { key: "Escape" });
    expect(wrapper2.emitted("update:open")).toBeUndefined();

    // 起于内容区而结束于遮罩的点击不误关
    await wrapper2.get('[role="dialog"]').trigger("pointerdown");
    await wrapper2.get(".mw-dialog__overlay").trigger("click");
    expect(wrapper2.emitted("update:open")).toBeUndefined();

    // 直接点击遮罩可关闭
    await wrapper2.get(".mw-dialog__overlay").trigger("pointerdown");
    await wrapper2.get(".mw-dialog__overlay").trigger("click");
    expect(wrapper2.emitted("update:open")).toEqual([[false]]);
  });

  it("支持 maximizable 切换最大化与还原，并在无可见头部时保持无障碍标题", async () => {
    const wrapper = mountDialog({
      props: {
        open: true,
        title: "最大化弹窗",
        maximizable: true,
        appendTo: "self",
      },
      slots: {
        default: () => h("p", "内容"),
      },
    });

    await nextTick();
    const maxBtn = wrapper.get(".mw-dialog__maximize");
    expect(maxBtn.attributes("aria-pressed")).toBe("false");

    await maxBtn.trigger("click");
    const dialog = wrapper.get('[role="dialog"]');
    expect(dialog.classes()).toContain("mw-dialog--maximized");
    expect(dialog.attributes("data-maximized")).toBe("true");
    expect(maxBtn.attributes("aria-pressed")).toBe("true");
    expect(wrapper.emitted("maximize")).toHaveLength(1);

    await maxBtn.trigger("click");
    expect(dialog.classes()).not.toContain("mw-dialog--maximized");
    expect(wrapper.emitted("unmaximize")).toHaveLength(1);

    const headless = mountDialog({
      props: {
        open: true,
        showHeader: false,
        ariaLabel: "隐藏头部弹窗",
        appendTo: "self",
      },
      slots: {
        default: () => h("p", "无头内容"),
      },
    });
    await nextTick();
    expect(headless.find(".mw-dialog__header").exists()).toBe(false);
    expect(headless.get(".mw-dialog__sr-only").text()).toBe("隐藏头部弹窗");
  });
});
