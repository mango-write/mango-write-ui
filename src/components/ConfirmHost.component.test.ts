import { defineComponent, h, nextTick, ref } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountUiComponent } from "../test-utils/mount.js";
import { createConfirmStore, provideConfirm, useConfirm } from "../lib/confirm.js";
import ConfirmHost from "./ConfirmHost.vue";

async function flushDialog() {
  await nextTick();
  await nextTick();
}

describe("ConfirmHost & useConfirm", () => {
  afterEach(() => {
    useConfirm().closeAll();
    document.body.innerHTML = "";
  });

  it("ask() 确认返回 true，取消或 Escape 返回 false，且非破坏性操作默认聚焦确认按钮", async () => {
    const wrapper = mountUiComponent(ConfirmHost, { attachTo: document.body });
    const confirm = useConfirm();

    const p1 = confirm.ask({
      title: "发布问卷",
      message: "确定要立即发布该问卷吗？",
      description: "发布后受访者即可访问。",
    });
    await flushDialog();

    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain("发布问卷");
    expect(dialog?.textContent).toContain("确定要立即发布该问卷吗？");
    expect(dialog?.textContent).toContain("发布后受访者即可访问。");

    const acceptBtn = document.body.querySelector<HTMLButtonElement>("[data-confirm-accept]");
    expect(acceptBtn).not.toBeNull();
    expect(document.activeElement).toBe(acceptBtn);

    acceptBtn!.click();
    await expect(p1).resolves.toBe(true);
    await flushDialog();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    // 取消按钮结算为 false
    const p2 = confirm.ask({ message: "再次确认？" });
    await flushDialog();
    const rejectBtn = document.body.querySelector<HTMLButtonElement>("[data-confirm-reject]");
    rejectBtn!.click();
    await expect(p2).resolves.toBe(false);
    await flushDialog();

    // Escape 结算为 false
    const p3 = confirm.ask({ message: "按 Esc 关闭" });
    await flushDialog();
    const dialog3 = document.body.querySelector<HTMLElement>('[role="dialog"]');
    dialog3!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await expect(p3).resolves.toBe(false);

    wrapper.unmount();
  });

  it("破坏性操作（danger=true）默认聚焦取消按钮，且拦截 Enter 连发穿透", async () => {
    const wrapper = mountUiComponent(ConfirmHost, { attachTo: document.body });
    const confirm = useConfirm();

    const promise = confirm.ask({
      title: "删除项目",
      message: "此操作不可撤销，是否继续？",
      danger: true,
      acceptLabel: "永久删除",
      rejectLabel: "保留",
    });
    await flushDialog();

    const rejectBtn = document.body.querySelector<HTMLButtonElement>("[data-confirm-reject]");
    const acceptBtn = document.body.querySelector<HTMLButtonElement>("[data-confirm-accept]");
    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]');

    expect(rejectBtn?.textContent).toContain("保留");
    expect(acceptBtn?.textContent).toContain("永久删除");
    expect(document.activeElement).toBe(rejectBtn);

    // 模拟触发器残留的 repeat Enter：不应关闭或误接受
    acceptBtn!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", repeat: true, bubbles: true }),
    );
    dialog!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", repeat: false, bubbles: true }),
    );
    await flushDialog();
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();

    // 在当前默认聚焦的取消按钮上按新鲜 Enter，应走取消（false）而非接受
    rejectBtn!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", repeat: false, bubbles: true }),
    );
    await expect(promise).resolves.toBe(false);

    wrapper.unmount();
  });

  it("按 FIFO 顺序排队同一 group 请求，不同 group 独立渲染", async () => {
    const defaultHost = mountUiComponent(ConfirmHost, { attachTo: document.body });
    const customHost = mountUiComponent(ConfirmHost, {
      attachTo: document.body,
      props: { group: "batch" },
    });
    const confirm = useConfirm();

    const p1 = confirm.ask({ message: "第一条确认" });
    const p2 = confirm.ask({ message: "第二条确认" });
    const pBatch = confirm.ask({ group: "batch", message: "批处理确认" });
    await flushDialog();

    const dialogs = document.body.querySelectorAll('[role="dialog"]');
    expect(dialogs).toHaveLength(2);
    expect(dialogs[0]?.textContent).toContain("第一条确认");
    expect(dialogs[1]?.textContent).toContain("批处理确认");

    // 确认第一条后，第二条自动成为队首并展示
    const firstAccept = dialogs[0]!.querySelector<HTMLButtonElement>("[data-confirm-accept]");
    firstAccept!.click();
    await expect(p1).resolves.toBe(true);
    await flushDialog();

    const activeDefaultDialog = document.body.querySelector('[role="dialog"]:not([data-group="batch"])');
    expect(activeDefaultDialog?.textContent).toContain("第二条确认");

    activeDefaultDialog!
      .querySelector<HTMLButtonElement>("[data-confirm-reject]")!
      .click();
    await expect(p2).resolves.toBe(false);

    const batchDialog = document.body.querySelector('[role="dialog"][data-group="batch"]');
    batchDialog!.querySelector<HTMLButtonElement>("[data-confirm-accept]")!.click();
    await expect(pBatch).resolves.toBe(true);

    defaultHost.unmount();
    customHost.unmount();
  });

  it("支持 AbortSignal 取消、调用方组件卸载自动取消与 ConfirmHost 销毁结算 false", async () => {
    const host = mountUiComponent(ConfirmHost, { attachTo: document.body });
    const confirm = useConfirm();

    // 1. AbortSignal 取消
    const controller = new AbortController();
    const pAbort = confirm.ask({ message: "可中止请求", signal: controller.signal });
    await flushDialog();
    controller.abort();
    await expect(pAbort).resolves.toBe(false);
    await flushDialog();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    // 2. 调用方组件卸载时自动结束挂起请求
    const showCaller = ref(true);
    let callerPromise: Promise<boolean> | null = null;

    const CallerChild = defineComponent({
      setup() {
        const localConfirm = useConfirm();
        return () =>
          h(
            "button",
            {
              "data-caller-trigger": "",
              onClick: () => {
                callerPromise = localConfirm.ask({ message: "来自子组件的确认" });
              },
            },
            "Ask",
          );
      },
    });

    const Parent = defineComponent({
      setup() {
        return () => (showCaller.value ? h(CallerChild) : null);
      },
    });

    const parentWrapper = mountUiComponent(Parent, { attachTo: document.body });
    await parentWrapper.get("[data-caller-trigger]").trigger("click");
    await flushDialog();
    expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain("来自子组件的确认");

    // 卸载发起确认的子组件
    showCaller.value = false;
    await flushDialog();
    await expect(callerPromise).resolves.toBe(false);
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    parentWrapper.unmount();

    // 3. ConfirmHost 卸载时结算所有排队中请求为 false
    const pHost1 = confirm.ask({ message: "宿主销毁测试 1" });
    const pHost2 = confirm.ask({ message: "宿主销毁测试 2" });
    await flushDialog();
    host.unmount();
    await expect(pHost1).resolves.toBe(false);
    await expect(pHost2).resolves.toBe(false);
  });

  it("兼容旧 require() 映射，回调至多执行一次，并对不支持的旧配置显式抛错", async () => {
    const wrapper = mountUiComponent(ConfirmHost, { attachTo: document.body });
    const confirm = useConfirm();

    const onAccept = vi.fn();
    const onReject = vi.fn();
    const onHide = vi.fn();

    const reqPromise = confirm.require({
      header: "危险审批",
      message: "确认执行审批？",
      acceptProps: { label: "审批通过", severity: "danger" },
      rejectProps: { label: "暂不处理", severity: "secondary" },
      accept: onAccept,
      reject: onReject,
      onHide,
    });
    await flushDialog();

    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute("data-danger")).toBe("true");
    const acceptBtn = document.body.querySelector<HTMLButtonElement>("[data-confirm-accept]");
    const rejectBtn = document.body.querySelector<HTMLButtonElement>("[data-confirm-reject]");
    expect(acceptBtn?.textContent).toContain("审批通过");
    expect(rejectBtn?.textContent).toContain("暂不处理");
    expect(document.activeElement).toBe(rejectBtn);

    acceptBtn!.click();
    await expect(reqPromise).resolves.toBe(true);
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onReject).not.toHaveBeenCalled();
    expect(onHide).toHaveBeenCalledTimes(1);

    // 不支持的旧配置（如 ConfirmPopup 的 target 或 position）显式抛错
    expect(() =>
      confirm.require({
        message: "Popup",
        // @ts-expect-error testing runtime rejection of unsupported option
        target: document.body,
      }),
    ).toThrow("[useConfirm.require] Unsupported legacy confirm option: target");

    wrapper.unmount();
  });

  it("多 App 实例之间确认队列互不串扰", async () => {
    const storeA = createConfirmStore();
    const storeB = createConfirmStore();

    let askA!: () => Promise<boolean>;
    let askB!: () => Promise<boolean>;

    const AppA = defineComponent({
      setup() {
        provideConfirm(storeA);
        const c = useConfirm();
        askA = () => c.ask({ message: "App A 确认消息" });
        return () => h(ConfirmHost);
      },
    });

    const AppB = defineComponent({
      setup() {
        provideConfirm(storeB);
        const c = useConfirm();
        askB = () => c.ask({ message: "App B 确认消息" });
        return () => h(ConfirmHost);
      },
    });

    const wrapperA = mountUiComponent(AppA, { attachTo: document.body });
    const wrapperB = mountUiComponent(AppB, { attachTo: document.body });

    const pA = askA();
    await flushDialog();

    expect(storeA.queue.value).toHaveLength(1);
    expect(storeB.queue.value).toHaveLength(0);

    const pB = askB();
    await flushDialog();
    expect(storeB.queue.value).toHaveLength(1);

    wrapperA.unmount();
    wrapperB.unmount();
    await expect(pA).resolves.toBe(false);
    await expect(pB).resolves.toBe(false);
  });
});
