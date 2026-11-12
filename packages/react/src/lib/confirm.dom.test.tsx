import { useState } from "react";
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ConfirmProvider,
  createConfirmStore,
  defaultConfirmStore,
  useConfirm,
  useConfirmQueue,
  validateLegacyConfirmOptions,
} from "./confirm";

describe("react confirm store & useConfirm", () => {
  afterEach(() => {
    defaultConfirmStore.closeAll();
  });

  it("queues requests, resolves accept=true / reject=false, and normalizes danger focus", async () => {
    const store = createConfirmStore();

    const p1 = store.ask({
      title: "发布问卷",
      message: "确定要立即发布该问卷吗？",
    });
    expect(store.queue).toHaveLength(1);
    expect(store.queue[0]!.request.defaultFocus).toBe("accept");
    expect(store.queue[0]!.request.acceptSeverity).toBe("primary");

    store.accept(store.queue[0]!.request.id);
    await expect(p1).resolves.toBe(true);
    expect(store.queue).toHaveLength(0);

    const p2 = store.ask({
      message: "删除操作不可撤销",
      danger: true,
    });
    expect(store.queue[0]!.request.defaultFocus).toBe("reject");
    expect(store.queue[0]!.request.acceptSeverity).toBe("danger");

    store.reject(store.queue[0]!.request.id);
    await expect(p2).resolves.toBe(false);
  });

  it("cancels pending confirm automatically on AbortSignal or when calling component unmounts", async () => {
    const controller = new AbortController();
    const pAbort = defaultConfirmStore.ask({
      message: "可中止请求",
      signal: controller.signal,
    });
    expect(defaultConfirmStore.queue).toHaveLength(1);
    controller.abort();
    await expect(pAbort).resolves.toBe(false);
    expect(defaultConfirmStore.queue).toHaveLength(0);

    let callerPromise: Promise<boolean> | null = null;
    let setShowCaller!: (v: boolean) => void;

    function CallerChild() {
      const confirm = useConfirm();
      return (
        <button
          type="button"
          data-testid="ask-btn"
          onClick={() => {
            callerPromise = confirm.ask({ message: "来自子组件的确认" });
          }}
        >
          Ask
        </button>
      );
    }

    function Parent() {
      const [show, setShow] = useState(true);
      setShowCaller = setShow;
      const queue = useConfirmQueue();
      return (
        <div>
          {show ? <CallerChild /> : null}
          <span data-testid="queue-len">{queue.length}</span>
        </div>
      );
    }

    const { getByTestId } = render(<Parent />);
    act(() => {
      getByTestId("ask-btn").click();
    });
    expect(getByTestId("queue-len").textContent).toBe("1");

    act(() => {
      setShowCaller(false);
    });
    expect(getByTestId("queue-len").textContent).toBe("0");
    await expect(callerPromise).resolves.toBe(false);
  });

  it("supports legacy require() callbacks and rejects unsupported legacy keys", async () => {
    const store = createConfirmStore();
    const onAccept = vi.fn();
    const onReject = vi.fn();
    const onHide = vi.fn();

    const p = store.require({
      header: "危险审批",
      message: "确认执行审批？",
      acceptProps: { label: "审批通过", severity: "danger" },
      rejectProps: { label: "暂不处理", severity: "secondary" },
      accept: onAccept,
      reject: onReject,
      onHide,
    });

    expect(store.queue[0]!.request.danger).toBe(true);
    expect(store.queue[0]!.request.acceptLabel).toBe("审批通过");
    expect(store.queue[0]!.request.rejectLabel).toBe("暂不处理");

    store.accept(store.queue[0]!.request.id);
    await expect(p).resolves.toBe(true);
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onReject).not.toHaveBeenCalled();
    expect(onHide).toHaveBeenCalledTimes(1);

    expect(() =>
      validateLegacyConfirmOptions({ message: "Popup", target: document.body }),
    ).toThrow("[useConfirm.require] Unsupported legacy confirm option: target");
  });

  it("isolates multiple ConfirmProvider trees and groups cleanly", async () => {
    const storeA = createConfirmStore();
    const storeB = createConfirmStore();

    function View({ label }: { label: string }) {
      const entries = useConfirmQueue();
      return (
        <div data-testid={`view-${label}`}>
          {entries.map((e) => e.request.message).join(",")}
        </div>
      );
    }

    const { getByTestId } = render(
      <>
        <ConfirmProvider store={storeA}>
          <View label="a" />
        </ConfirmProvider>
        <ConfirmProvider store={storeB}>
          <View label="b" />
        </ConfirmProvider>
      </>,
    );

    let pA!: Promise<boolean>;
    let pB!: Promise<boolean>;
    act(() => {
      pA = storeA.ask({ message: "仅 A" });
      pB = storeB.ask({ message: "仅 B" });
    });

    expect(getByTestId("view-a").textContent).toBe("仅 A");
    expect(getByTestId("view-b").textContent).toBe("仅 B");

    act(() => {
      storeA.closeAll();
      storeB.closeGroup();
    });
    await expect(pA).resolves.toBe(false);
    await expect(pB).resolves.toBe(false);
  });
});
