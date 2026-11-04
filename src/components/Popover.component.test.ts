import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import Popover from "./Popover.vue";

describe("Popover", () => {
  it("支持受控 v-model:open 与 #trigger 插槽声明式交互", async () => {
    const Host = defineComponent({
      setup() {
        const open = ref(false);
        return () =>
          h(
            Popover,
            {
              open: open.value,
              "onUpdate:open": (v: boolean) => {
                open.value = v;
              },
              appendTo: "self",
              ariaLabel: "文献详情浮层",
              "data-testid": "decl-popover",
            },
            {
              trigger: () =>
                h("button", { type: "button", class: "trigger-btn" }, "打开浮层"),
              default: () => h("div", { class: "popover-body" }, "浮层正文内容"),
            },
          );
      },
    });

    const wrapper = mountUiComponent(Host);
    expect(wrapper.find(".popover-body").exists()).toBe(false);

    await wrapper.get(".trigger-btn").trigger("click");
    await nextTick();

    const content = wrapper.get('[data-testid="decl-popover"]');
    expect(content.classes()).toContain("mw-popover");
    expect(content.classes()).toContain("mw-frost");
    expect(content.attributes("aria-label")).toBe("文献详情浮层");
    expect(wrapper.get(".popover-body").text()).toBe("浮层正文内容");

    await content.trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(wrapper.find(".popover-body").exists()).toBe(false);
  });

  it("支持命令式 ref.toggle / show / hide 调用并触发 show 与 hide 事件", async () => {
    const events: string[] = [];
    const Host = defineComponent({
      setup(_, { expose }) {
        const popRef = ref<InstanceType<typeof Popover> | null>(null);
        const btnA = ref<HTMLButtonElement | null>(null);
        const btnB = ref<HTMLButtonElement | null>(null);
        expose({ popRef, btnA, btnB });
        return () =>
          h("div", [
            h(
              "button",
              {
                ref: btnA,
                type: "button",
                class: "btn-a",
                onClick: (e: MouseEvent) => popRef.value?.toggle(e),
              },
              "按钮 A",
            ),
            h(
              "button",
              {
                ref: btnB,
                type: "button",
                class: "btn-b",
                onClick: (e: MouseEvent) => popRef.value?.toggle(e, btnB.value),
              },
              "按钮 B",
            ),
            h(
              Popover,
              {
                ref: popRef,
                appendTo: "self",
                onShow: () => events.push("show"),
                onHide: () => events.push("hide"),
              },
              {
                default: ({ close }: { close: () => void }) =>
                  h(
                    "button",
                    { type: "button", class: "inner-close", onClick: close },
                    "内部关闭",
                  ),
              },
            ),
          ]);
      },
    });

    const wrapper = mountUiComponent(Host);
    expect(wrapper.find(".inner-close").exists()).toBe(false);

    // 点击按钮 A 打开
    await wrapper.get(".btn-a").trigger("click");
    await nextTick();
    expect(wrapper.find(".inner-close").exists()).toBe(true);
    expect(events).toEqual(["show"]);

    // 已打开时点击另一个锚点按钮 B：切换锚点并保持打开
    await wrapper.get(".btn-b").trigger("click");
    await nextTick();
    expect(wrapper.find(".inner-close").exists()).toBe(true);
    expect(events).toEqual(["show"]);

    // 再次点击同一锚点按钮 B：关闭
    await wrapper.get(".btn-b").trigger("click");
    await nextTick();
    expect(wrapper.find(".inner-close").exists()).toBe(false);
    expect(events).toEqual(["show", "hide"]);

    // 命令式 show / hide
    const vm = wrapper.vm as unknown as {
      popRef: { show: (e?: Event | HTMLElement | null) => void; hide: () => void };
      btnA: HTMLButtonElement;
    };
    vm.popRef.show(vm.btnA);
    await nextTick();
    expect(wrapper.find(".inner-close").exists()).toBe(true);
    expect(events).toEqual(["show", "hide", "show"]);

    await wrapper.get(".inner-close").trigger("click");
    await nextTick();
    expect(wrapper.find(".inner-close").exists()).toBe(false);
    expect(events).toEqual(["show", "hide", "show", "hide"]);
  });

  it("closeOnEscape=false 时按下 Escape 不关闭浮层", async () => {
    const wrapper = mountUiComponent(Popover, {
      props: {
        open: true,
        closeOnEscape: false,
        appendTo: "self",
      },
      slots: {
        default: () => h("p", "固定内容"),
      },
    });

    await nextTick();
    await wrapper.get(".mw-popover").trigger("keydown", { key: "Escape" });
    expect(wrapper.emitted("update:open")).toBeUndefined();
  });
});
