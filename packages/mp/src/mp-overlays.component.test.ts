import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import MpActionSheet from "./components/MpActionSheet.vue";
import MpConfirmHost from "./components/MpConfirmHost.vue";
import MpSelectSheet from "./components/MpSelectSheet.vue";
import MpSheet from "./components/MpSheet.vue";
import MpToastHost from "./components/MpToastHost.vue";
import { provideMpConfirm } from "./lib/mp-confirm.js";
import { createMpNotifyService, provideMpNotify, useMpNotify } from "./lib/mp-notify.js";

describe("@mango-write/ui-mp overlays", () => {
  it("closes the innermost sheet on Escape, restores trigger focus immediately, and unmounts after exit animation", async () => {
    vi.useFakeTimers();
    try {
      const Host = defineComponent({
        components: { MpSheet },
        setup() { return { open: ref(false) }; },
        template: `<button id="sheet-trigger" @click="open = true">打开</button><MpSheet v-model:open="open" contained title="文献详情"><button id="sheet-action">摘录</button></MpSheet>`,
      });
      const wrapper = mount(Host, { attachTo: document.body });
      const trigger = wrapper.find("#sheet-trigger");
      (trigger.element as HTMLElement).focus();
      await trigger.trigger("click");
      await nextTick();
      await nextTick();
      expect(document.activeElement?.getAttribute("data-testid")).toBe("mp-sheet-close");
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await nextTick();
      expect(document.activeElement).toBe(trigger.element);
      expect(wrapper.find('[data-testid="mp-sheet-backdrop"]').classes()).toContain("mw-mp-sheet-backdrop--closing");
      expect(wrapper.find(".mw-mp-sheet").classes()).toContain("mw-mp-sheet--closing");
      vi.advanceTimersByTime(180);
      await nextTick();
      expect(wrapper.find('[data-testid="mp-sheet-backdrop"]').exists()).toBe(false);
      wrapper.unmount();
    } finally {
      vi.useRealTimers();
    }
  });

  it("retains confirm dialog content during exit transition before unmounting", async () => {
    vi.useFakeTimers();
    try {
      let decision: Promise<boolean> | undefined;
      const Host = defineComponent({
        components: { MpConfirmHost },
        setup() {
          const confirm = provideMpConfirm();
          decision = confirm.ask({ title: "确认删除？", message: "删除后不可恢复", danger: true });
          return { confirm };
        },
        template: "<MpConfirmHost contained />",
      });
      const wrapper = mount(Host);
      await nextTick();
      expect(wrapper.find(".mw-mp-dialog__title").text()).toBe("确认删除？");
      await wrapper.find('[data-testid="mp-confirm-accept"]').trigger("click");
      await expect(decision).resolves.toBe(true);
      expect(wrapper.find('[data-testid="mp-confirm-dialog"]').classes()).toContain("mw-mp-dialog-backdrop--closing");
      expect(wrapper.find(".mw-mp-dialog").classes()).toContain("mw-mp-dialog--closing");
      expect(wrapper.find(".mw-mp-dialog__title").text()).toBe("确认删除？");
      vi.advanceTimersByTime(110);
      await nextTick();
      expect(wrapper.find('[data-testid="mp-confirm-dialog"]').exists()).toBe(false);
      wrapper.unmount();
    } finally {
      vi.useRealTimers();
    }
  });

  it("renders default and footer slots once in their own regions", () => {
    const sheet = mount(MpSheet, {
      props: { open: true, contained: true, title: "详情" },
      slots: { default: "<p id='sheet-body'>正文</p>", footer: "<button id='sheet-save'>保存</button>" },
    });
    expect(sheet.findAll(".mw-mp-sheet__body #sheet-body")).toHaveLength(1);
    expect(sheet.findAll(".mw-mp-sheet__footer #sheet-save")).toHaveLength(1);
    expect(sheet.find(".mw-mp-sheet__footer").text()).not.toContain("正文");
    sheet.unmount();
  });

  it("keeps action commands separate from single selection", async () => {
    const actions = mount(MpActionSheet, {
      props: {
        open: true,
        contained: true,
        options: [{ value: "delete", label: "删除", danger: true }],
      },
    });
    await actions.find('[data-testid="mp-action-option-delete"]').trigger("click");
    expect(actions.emitted("select")?.[0]?.[1]).toBe("delete");
    expect(actions.emitted("update:modelValue")).toBeUndefined();
    actions.unmount();

    const select = mount(MpSelectSheet, {
      props: {
        open: true,
        contained: true,
        modelValue: 0,
        options: [{ value: 0, label: "零" }, { value: false, label: "否" }],
      },
    });
    const options = select.findAll('[role="option"]');
    expect(options[0].attributes("aria-selected")).toBe("true");
    await options[1].trigger("click");
    expect(select.emitted("update:modelValue")?.[0]).toEqual([false]);
    expect(select.emitted("select")?.[0]?.[1]).toBe(false);
    select.unmount();
  });

  it("shows only the latest toast and animates exit before unmounting", async () => {
    vi.useFakeTimers();
    try {
      const Host = defineComponent({
        components: { MpToastHost },
        setup() {
          const notify = provideMpNotify();
          notify.push({ summary: "第一条", life: 0 });
          notify.push({ summary: "最新反馈", life: 0 });
          return { notify };
        },
        template: "<MpToastHost contained />",
      });
      const wrapper = mount(Host);
      await nextTick();
      expect(wrapper.findAll('[data-testid="mp-toast-item"]')).toHaveLength(1);
      expect(wrapper.text()).toContain("最新反馈");
      await wrapper.find(".mw-mp-toast__close").trigger("click");
      expect(wrapper.find('[data-testid="mp-toast-item"]').classes()).toContain("mw-mp-toast--closing");
      vi.advanceTimersByTime(110);
      await nextTick();
      expect(wrapper.find('[data-testid="mp-toast-item"]').exists()).toBe(false);
      wrapper.unmount();
    } finally {
      vi.useRealTimers();
    }
  });

  it("renders messages from an explicitly supplied page service", async () => {
    const service = createMpNotifyService();
    service.success("跨页面保存成功", undefined, 0);
    const wrapper = mount(MpToastHost, { props: { contained: true, service } });
    await nextTick();
    expect(wrapper.find('[data-testid="mp-toast-item"]').text()).toContain("跨页面保存成功");
    wrapper.unmount();
  });

  it("keeps fallback useMpNotify reactive after the first consumer page unmounts (reLaunch)", async () => {
    const FirstPage = defineComponent({
      setup() {
        useMpNotify();
        return {};
      },
      template: "<div />",
    });
    const first = mount(FirstPage);
    first.unmount();

    const SecondPage = defineComponent({
      components: { MpToastHost },
      setup() {
        const service = useMpNotify();
        return { service };
      },
      template: "<MpToastHost contained :service='service' />",
    });
    const second = mount(SecondPage);
    useMpNotify().success("重启动后仍可提示", undefined, 0);
    await nextTick();
    expect(second.find('[data-testid="mp-toast-item"]').text()).toContain("重启动后仍可提示");
    useMpNotify().clear();
    second.unmount();
  });
});
