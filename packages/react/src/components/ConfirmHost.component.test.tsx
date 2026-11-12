import { useState } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ConfirmProvider,
  createConfirmStore,
  defaultConfirmStore,
  useConfirm,
} from "../lib/confirm";
import ConfirmHost from "./ConfirmHost";

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("ConfirmHost & useConfirm", () => {
  afterEach(() => {
    defaultConfirmStore.closeAll();
  });

  it("resolves true on accept, false on reject or Escape, and focuses accept button by default when not danger", async () => {
    const { unmount } = render(<ConfirmHost />);

    let p1!: Promise<boolean>;
    act(() => {
      p1 = defaultConfirmStore.ask({
        title: "发布问卷",
        message: "确定要立即发布该问卷吗？",
        description: "发布后受访者即可访问。",
      });
    });
    await flushMicrotasks();

    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.classList.contains("mw-frost--thick")).toBe(true);
    expect(dialog?.textContent).toContain("发布问卷");
    expect(dialog?.textContent).toContain("确定要立即发布该问卷吗？");
    expect(dialog?.textContent).toContain("发布后受访者即可访问。");

    const acceptBtn = document.body.querySelector<HTMLButtonElement>("[data-confirm-accept]");
    expect(acceptBtn).not.toBeNull();
    expect(document.activeElement).toBe(acceptBtn);

    act(() => {
      acceptBtn!.click();
    });
    await expect(p1).resolves.toBe(true);
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    // Reject settles false
    let p2!: Promise<boolean>;
    act(() => {
      p2 = defaultConfirmStore.ask({ message: "再次确认？" });
    });
    await flushMicrotasks();
    act(() => {
      document.body.querySelector<HTMLButtonElement>("[data-confirm-reject]")!.click();
    });
    await expect(p2).resolves.toBe(false);

    // Escape settles false
    let p3!: Promise<boolean>;
    act(() => {
      p3 = defaultConfirmStore.ask({ message: "按 Esc 关闭" });
    });
    await flushMicrotasks();
    fireEvent.keyDown(document.body.querySelector('[role="dialog"]')!, { key: "Escape" });
    await expect(p3).resolves.toBe(false);

    unmount();
  });

  it("focuses reject button by default on danger=true and blocks repeat/unhandled Enter penetration", async () => {
    const { unmount } = render(<ConfirmHost />);

    let promise!: Promise<boolean>;
    act(() => {
      promise = defaultConfirmStore.ask({
        title: "删除项目",
        message: "此操作不可撤销，是否继续？",
        danger: true,
        acceptLabel: "永久删除",
        rejectLabel: "保留",
      });
    });
    await flushMicrotasks();

    const rejectBtn = document.body.querySelector<HTMLButtonElement>("[data-confirm-reject]")!;
    const acceptBtn = document.body.querySelector<HTMLButtonElement>("[data-confirm-accept]")!;
    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!;

    expect(rejectBtn.textContent).toContain("保留");
    expect(acceptBtn.textContent).toContain("永久删除");
    expect(document.activeElement).toBe(rejectBtn);

    // Repeat Enter or unhandled Enter on dialog container must NOT accept
    fireEvent.keyDown(acceptBtn, { key: "Enter", repeat: true });
    fireEvent.keyDown(dialog, { key: "Enter", repeat: false });
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();

    // Fresh Enter on focused reject button rejects (false)
    fireEvent.keyDown(rejectBtn, { key: "Enter", repeat: false });
    await expect(promise).resolves.toBe(false);

    unmount();
  });

  it("queues requests FIFO per group and supports custom rendering", async () => {
    const { unmount } = render(
      <>
        <ConfirmHost />
        <ConfirmHost
          group="batch"
          children={({ request, accept }) => (
            <div data-custom-batch="">
              <span>{request.message}</span>
              <button type="button" data-batch-ok="" onClick={accept}>
                批量执行
              </button>
            </div>
          )}
        />
      </>,
    );

    let p1!: Promise<boolean>;
    let p2!: Promise<boolean>;
    let pBatch!: Promise<boolean>;
    act(() => {
      p1 = defaultConfirmStore.ask({ message: "第一条确认" });
      p2 = defaultConfirmStore.ask({ message: "第二条确认" });
      pBatch = defaultConfirmStore.ask({ group: "batch", message: "批处理确认" });
    });
    await flushMicrotasks();

    const dialogs = document.body.querySelectorAll('[role="dialog"]');
    expect(dialogs).toHaveLength(2);
    expect(dialogs[0]?.textContent).toContain("第一条确认");
    expect(dialogs[1]?.textContent).toContain("批处理确认");

    act(() => {
      dialogs[0]!.querySelector<HTMLButtonElement>("[data-confirm-accept]")!.click();
    });
    await expect(p1).resolves.toBe(true);
    await flushMicrotasks();

    const nextDefault = document.body.querySelector('[role="dialog"]:not([data-group="batch"])')!;
    expect(nextDefault.textContent).toContain("第二条确认");
    act(() => {
      nextDefault.querySelector<HTMLButtonElement>("[data-confirm-reject]")!.click();
    });
    await expect(p2).resolves.toBe(false);

    act(() => {
      document.body.querySelector<HTMLButtonElement>("[data-batch-ok]")!.click();
    });
    await expect(pBatch).resolves.toBe(true);

    unmount();
  });

  it("cancels pending requests on AbortSignal, caller unmount, or ConfirmHost unmount, and isolates ConfirmProvider stores", async () => {
    let callerPromise: Promise<boolean> | null = null;

    function Caller() {
      const confirm = useConfirm();
      return (
        <button
          type="button"
          data-caller-btn=""
          onClick={() => {
            callerPromise = confirm.ask({ message: "来自子组件的确认" });
          }}
        >
          Ask
        </button>
      );
    }

    function App() {
      const [showCaller, setShowCaller] = useState(true);
      return (
        <>
          <ConfirmHost />
          {showCaller ? <Caller /> : null}
          <button type="button" data-unmount-caller="" onClick={() => setShowCaller(false)}>
            Unmount
          </button>
        </>
      );
    }

    const { unmount } = render(<App />);

    // 1. AbortSignal
    const controller = new AbortController();
    let pAbort!: Promise<boolean>;
    act(() => {
      pAbort = defaultConfirmStore.ask({ message: "可中止请求", signal: controller.signal });
    });
    await flushMicrotasks();
    act(() => {
      controller.abort();
    });
    await expect(pAbort).resolves.toBe(false);

    // 2. Caller unmount
    fireEvent.click(document.querySelector("[data-caller-btn]")!);
    await flushMicrotasks();
    expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain("来自子组件的确认");
    fireEvent.click(document.querySelector("[data-unmount-caller]")!);
    await expect(callerPromise).resolves.toBe(false);

    // 3. Host unmount settles queued requests false
    let pHost1!: Promise<boolean>;
    let pHost2!: Promise<boolean>;
    act(() => {
      pHost1 = defaultConfirmStore.ask({ message: "宿主销毁 1" });
      pHost2 = defaultConfirmStore.ask({ message: "宿主销毁 2" });
    });
    await flushMicrotasks();
    unmount();
    await expect(pHost1).resolves.toBe(false);
    await expect(pHost2).resolves.toBe(false);

    // 4. Isolated ConfirmProvider stores
    const storeA = createConfirmStore();
    const storeB = createConfirmStore();
    const onAccept = vi.fn();
    const { unmount: unmountAB } = render(
      <>
        <ConfirmProvider store={storeA}>
          <ConfirmHost />
        </ConfirmProvider>
        <ConfirmProvider store={storeB}>
          <ConfirmHost />
        </ConfirmProvider>
      </>,
    );

    let pReq!: Promise<boolean>;
    act(() => {
      pReq = storeA.require({
        header: "危险审批",
        message: "确认执行审批？",
        acceptProps: { label: "审批通过", severity: "danger" },
        accept: onAccept,
      });
    });
    await flushMicrotasks();
    expect(storeA.queue).toHaveLength(1);
    expect(storeB.queue).toHaveLength(0);
    expect(document.activeElement).toBe(
      document.body.querySelector("[data-confirm-reject]"),
    );

    act(() => {
      document.body.querySelector<HTMLButtonElement>("[data-confirm-accept]")!.click();
    });
    await expect(pReq).resolves.toBe(true);
    expect(onAccept).toHaveBeenCalledTimes(1);
    unmountAB();
  });
});
