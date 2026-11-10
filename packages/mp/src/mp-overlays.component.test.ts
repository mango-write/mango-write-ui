import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";
import MpActionSheet from "./components/MpActionSheet.vue";
import MpSelectSheet from "./components/MpSelectSheet.vue";
import MpSheet from "./components/MpSheet.vue";
import MpToastHost from "./components/MpToastHost.vue";
import { createMpNotifyService, provideMpNotify } from "./lib/mp-notify.js";

describe("@mango-write/ui-mp overlays", () => {
  it("closes the innermost sheet on Escape and restores trigger focus", async () => {
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
    expect(wrapper.find('[data-testid="mp-sheet-backdrop"]').exists()).toBe(false);
    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it("renders default and footer slots once in their own regions", () => {
    const sheet = mount(MpSheet, {
      props: { open: true, contained: true, title: "详情" },
      slots: { default: "<p id='sheet-body'>正文</p>", footer: "<button id='sheet-save'>保存</button>" },
    });
    expect(sheet.findAll(".mw-mp-sheet__body #sheet-body")).toHaveLength(1);
    expect(sheet.findAll(".mw-mp-sheet__footer #sheet-save")).toHaveLength(1);
    expect(sheet.find(".mw-mp-sheet__footer").text()).not.toContain("正文");
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
  });

  it("shows only the latest toast and closes it accessibly", async () => {
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
    expect(wrapper.find('[data-testid="mp-toast-item"]').exists()).toBe(false);
  });

  it("renders messages from an explicitly supplied page service", async () => {
    const service = createMpNotifyService();
    service.success("跨页面保存成功", undefined, 0);
    const wrapper = mount(MpToastHost, { props: { contained: true, service } });
    await nextTick();
    expect(wrapper.find('[data-testid="mp-toast-item"]').text()).toContain("跨页面保存成功");
  });
});
