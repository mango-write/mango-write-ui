import { defineComponent, h, nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountUiComponent } from "../test-utils/mount.js";
import { createNotifyStore, provideNotify, useNotify } from "../lib/notify.js";
import ToastHost from "./ToastHost.vue";

describe("ToastHost & useNotify", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.documentElement.className = "";
  });

  afterEach(() => {
    useNotify().removeAllGroups();
    document.documentElement.className = "";
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  it("支持 success/info/warn/error 语义、无障碍 live 角色，且不抢占当前焦点", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Trigger";
    document.body.appendChild(trigger);
    trigger.focus();

    const wrapper = mountUiComponent(ToastHost, { attachTo: document.body });
    const notify = useNotify();

    notify.success("保存成功", "文档已同步至云端");
    notify.info("提示", "后台索引完成");
    notify.warn("注意", "即将达到配额上限");
    notify.error("保存失败", "网络连接超时");
    await nextTick();

    expect(document.activeElement).toBe(trigger);

    const toasts = wrapper.findAll(".mw-toast");
    expect(toasts).toHaveLength(4);

    expect(toasts[0]!.attributes("role")).toBe("status");
    expect(toasts[0]!.attributes("aria-live")).toBe("polite");
    expect(toasts[0]!.text()).toContain("保存成功");
    expect(toasts[0]!.text()).toContain("文档已同步至云端");

    expect(toasts[1]!.attributes("role")).toBe("status");
    expect(toasts[1]!.attributes("aria-live")).toBe("polite");

    expect(toasts[2]!.attributes("role")).toBe("status");
    expect(toasts[2]!.attributes("aria-live")).toBe("polite");

    expect(toasts[3]!.attributes("role")).toBe("alert");
    expect(toasts[3]!.attributes("aria-live")).toBe("assertive");
    expect(toasts[3]!.text()).toContain("保存失败");

    wrapper.unmount();
  });

  it("相同 id 的通知原地更新且保持 announceKey 稳定，避免重复挂载播报", async () => {
    const wrapper = mountUiComponent(ToastHost);
    const notify = useNotify();

    const id = notify.add({
      id: "export-task",
      severity: "info",
      summary: "正在导出",
      detail: "进度 30%",
    });
    expect(id).toBe("export-task");
    await nextTick();

    const firstEl = wrapper.get('[data-toast-id="export-task"]').element;
    const firstAnnounceKey = firstEl.getAttribute("data-announce-key");
    expect(firstAnnounceKey).toBeTruthy();

    notify.add({
      id: "export-task",
      severity: "success",
      summary: "导出完成",
      detail: "进度 100%",
    });
    await nextTick();

    const toasts = wrapper.findAll(".mw-toast");
    expect(toasts).toHaveLength(1);
    const updatedEl = wrapper.get('[data-toast-id="export-task"]').element;
    expect(updatedEl).toBe(firstEl);
    expect(updatedEl.getAttribute("data-announce-key")).toBe(firstAnnounceKey);
    expect(updatedEl.textContent).toContain("导出完成");
    expect(updatedEl.textContent).toContain("进度 100%");

    wrapper.unmount();
  });

  it("按 life 自动消失，并在悬停或聚焦时暂停计时、移开后恢复", async () => {
    const wrapper = mountUiComponent(ToastHost);
    const notify = useNotify();

    notify.info("自动消失通知", undefined, { life: 1000 });
    await nextTick();
    expect(wrapper.findAll(".mw-toast")).toHaveLength(1);

    vi.advanceTimersByTime(600);
    await wrapper.get(".mw-toast").trigger("mouseenter");

    // 悬停期间超过原定剩余时间也不会消失
    vi.advanceTimersByTime(1000);
    await nextTick();
    expect(wrapper.findAll(".mw-toast")).toHaveLength(1);

    await wrapper.get(".mw-toast").trigger("mouseleave");
    vi.advanceTimersByTime(350);
    await nextTick();
    expect(wrapper.findAll(".mw-toast")).toHaveLength(1);

    vi.advanceTimersByTime(100);
    await nextTick();
    expect(wrapper.findAll(".mw-toast")).toHaveLength(0);

    wrapper.unmount();
  });

  it("支持 group 过滤、action 按钮、关闭按钮与 #message 自定义插槽", async () => {
    const onAction = vi.fn();
    const defaultHost = mountUiComponent(ToastHost);
    const uploadHost = mountUiComponent(ToastHost, {
      props: { group: "upload", position: "bottom-right" },
      slots: {
        message: ({ message, close }: { message: { summary?: string }; close: () => void }) =>
          h("div", { class: "custom-upload-toast", onClick: close }, message.summary),
      },
    });

    const notify = useNotify();
    notify.add({
      severity: "info",
      summary: "主通道消息",
      action: { label: "撤销", onClick: onAction },
    });
    notify.add({
      severity: "success",
      group: "upload",
      summary: "上传通道消息",
    });
    await nextTick();

    expect(defaultHost.findAll(".mw-toast")).toHaveLength(1);
    expect(defaultHost.text()).toContain("主通道消息");
    expect(uploadHost.findAll(".mw-toast")).toHaveLength(1);
    expect(uploadHost.find(".custom-upload-toast").text()).toBe("上传通道消息");

    await defaultHost.get(".mw-toast__action-btn").trigger("click");
    expect(onAction).toHaveBeenCalledTimes(1);

    const closeBtn = defaultHost.get(".mw-toast__close");
    expect(closeBtn.attributes("aria-label")).toBe("关闭");
    await closeBtn.trigger("click");
    expect(defaultHost.findAll(".mw-toast")).toHaveLength(0);

    await uploadHost.get(".custom-upload-toast").trigger("click");
    expect(uploadHost.findAll(".mw-toast")).toHaveLength(0);

    defaultHost.unmount();
    uploadHost.unmount();
  });

  it("路由转场期间（vt-workbench）推迟入屏，转场结束后再显示", async () => {
    document.documentElement.classList.add("vt-workbench");
    const wrapper = mountUiComponent(ToastHost);
    const notify = useNotify();

    notify.success("转场后显示");
    await nextTick();
    expect(wrapper.findAll(".mw-toast")).toHaveLength(0);

    document.documentElement.classList.remove("vt-workbench");
    await nextTick();
    await nextTick();
    expect(wrapper.findAll(".mw-toast")).toHaveLength(1);
    expect(wrapper.text()).toContain("转场后显示");

    wrapper.unmount();
  });

  it("多 App 实例之间通知队列互不串扰", async () => {
    const storeA = createNotifyStore();
    const storeB = createNotifyStore();

    const AppA = defineComponent({
      setup() {
        provideNotify(storeA);
        const notify = useNotify();
        notify.success("仅在 App A 显示");
        return () => h(ToastHost);
      },
    });

    const AppB = defineComponent({
      setup() {
        provideNotify(storeB);
        const notify = useNotify();
        notify.error("仅在 App B 显示");
        return () => h(ToastHost);
      },
    });

    const wrapperA = mountUiComponent(AppA);
    const wrapperB = mountUiComponent(AppB);
    await nextTick();

    expect(wrapperA.text()).toContain("仅在 App A 显示");
    expect(wrapperA.text()).not.toContain("仅在 App B 显示");
    expect(wrapperB.text()).toContain("仅在 App B 显示");
    expect(wrapperB.text()).not.toContain("仅在 App A 显示");

    wrapperA.unmount();
    wrapperB.unmount();
  });
});
