import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_TOAST_LIFE,
  NotifyProvider,
  createNotifyStore,
  defaultNotifyStore,
  useNotify,
  useNotifyMessages,
} from "./notify";

describe("react notify store & useNotify", () => {
  beforeEach(() => {
    document.documentElement.className = "";
  });

  afterEach(() => {
    defaultNotifyStore.removeAllGroups();
    document.documentElement.className = "";
  });

  it("supports severity shortcuts, default lifetimes, and stable announceKey on in-place id update", () => {
    const store = createNotifyStore();
    store.success("保存成功", "已同步");
    store.warn("配额预警");
    store.error("网络超时");

    expect(store.messages).toHaveLength(3);
    expect(store.messages[0]!.life).toBe(DEFAULT_TOAST_LIFE.success);
    expect(store.messages[1]!.life).toBe(DEFAULT_TOAST_LIFE.warn);
    expect(store.messages[2]!.life).toBe(DEFAULT_TOAST_LIFE.error);

    const id = store.add({
      id: "export-job",
      severity: "info",
      summary: "导出 30%",
    });
    const initialKey = store.messages.find((m) => m.id === id)!.announceKey;

    store.add({
      id: "export-job",
      severity: "success",
      summary: "导出 100%",
    });
    expect(store.messages).toHaveLength(4);
    const updated = store.messages.find((m) => m.id === id)!;
    expect(updated.summary).toBe("导出 100%");
    expect(updated.severity).toBe("success");
    expect(updated.announceKey).toBe(initialKey);
  });

  it("defers incoming toasts while route transition class is active on documentElement", async () => {
    document.documentElement.classList.add("vt-workbench");

    function Host() {
      const messages = useNotifyMessages();
      return (
        <div data-testid="toast-list">
          {messages.map((m) => m.summary).join("|")}
        </div>
      );
    }

    const { getByTestId } = render(<Host />);
    act(() => {
      defaultNotifyStore.success("转场后显示");
    });
    expect(getByTestId("toast-list").textContent).toBe("");

    await act(async () => {
      document.documentElement.classList.remove("vt-workbench");
      await Promise.resolve();
    });
    expect(getByTestId("toast-list").textContent).toBe("转场后显示");
  });

  it("isolates multiple NotifyProvider trees and filters by group", () => {
    const storeA = createNotifyStore();
    const storeB = createNotifyStore();

    function AppPane({ label, group }: { label: string; group?: string }) {
      const notify = useNotify();
      const messages = useNotifyMessages(undefined, group);
      return (
        <div>
          <button
            type="button"
            data-testid={`emit-${label}`}
            onClick={() => notify.info(`msg-${label}`, undefined, { group })}
          >
            Emit
          </button>
          <span data-testid={`out-${label}`}>
            {messages.map((m) => m.summary).join(",")}
          </span>
        </div>
      );
    }

    const { getByTestId } = render(
      <>
        <NotifyProvider store={storeA}>
          <AppPane label="a-default" />
          <AppPane label="a-upload" group="upload" />
        </NotifyProvider>
        <NotifyProvider store={storeB}>
          <AppPane label="b-default" />
        </NotifyProvider>
      </>,
    );

    act(() => {
      getByTestId("emit-a-default").click();
      getByTestId("emit-a-upload").click();
      getByTestId("emit-b-default").click();
    });

    expect(getByTestId("out-a-default").textContent).toBe("msg-a-default");
    expect(getByTestId("out-a-upload").textContent).toBe("msg-a-upload");
    expect(getByTestId("out-b-default").textContent).toBe("msg-b-default");

    act(() => {
      storeA.removeGroup("upload");
    });
    expect(getByTestId("out-a-upload").textContent).toBe("");
    expect(getByTestId("out-a-default").textContent).toBe("msg-a-default");
  });
});
