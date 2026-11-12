import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AsyncSearchSelect, {
  AsyncSearchSelect as NamedAsyncSearchSelect,
  type AsyncSearchOption,
} from "./AsyncSearchSelect";

const options: AsyncSearchOption[] = [
  { value: "a", label: "Alpha", description: "alpha@example.test" },
  { value: "b", label: "Beta" },
  {
    value: "c",
    label: "Gamma",
    avatar: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
  },
];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function deferred() {
  let resolve!: (value: AsyncSearchOption[]) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<AsyncSearchOption[]>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function bodyOptions() {
  return document.body.querySelectorAll('[role="option"]:not(.mw-ass-empty)');
}

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("AsyncSearchSelect", () => {
  it("exports named and default AsyncSearchSelect with displayName MwAsyncSearchSelect", () => {
    expect(AsyncSearchSelect).toBe(NamedAsyncSearchSelect);
    expect(AsyncSearchSelect.displayName).toBe("MwAsyncSearchSelect");
  });

  it("queries on focus and debounces typed queries", async () => {
    const pending: Array<ReturnType<typeof deferred>> = [];
    const search = vi.fn(() => {
      const d = deferred();
      pending.push(d);
      return d.promise;
    });

    const { container } = render(
      <AsyncSearchSelect value={null} search={search} placeholder="搜索选项" />,
    );
    const input = container.querySelector<HTMLInputElement>("input")!;

    fireEvent.focus(input);
    expect(pending).toHaveLength(1);
    pending[0]!.resolve(options);
    await flushMicrotasks();
    expect(bodyOptions()).toHaveLength(3);

    fireEvent.change(input, { target: { value: "al" } });
    expect(pending).toHaveLength(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(pending).toHaveLength(2);
    expect(search).toHaveBeenLastCalledWith("al");
    pending[1]!.resolve([options[0]!]);
    await flushMicrotasks();
    expect(bodyOptions()).toHaveLength(1);
  });

  it("discards stale out-of-order responses and cancels on unmount", async () => {
    const pending: Array<ReturnType<typeof deferred>> = [];
    const search = vi.fn(() => {
      const d = deferred();
      pending.push(d);
      return d.promise;
    });

    const { container, unmount } = render(
      <AsyncSearchSelect value={null} search={search} />,
    );
    const input = container.querySelector<HTMLInputElement>("input")!;

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "first" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    fireEvent.change(input, { target: { value: "second" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(pending).toHaveLength(3);

    pending[2]!.resolve([options[1]!]);
    await flushMicrotasks();
    pending[1]!.resolve(options);
    await flushMicrotasks();

    expect(bodyOptions()).toHaveLength(1);
    expect(bodyOptions()[0]!.id).toMatch(/_0$/);
    expect(container.querySelector(".mw-ass-loader")).toBeNull();

    fireEvent.change(input, { target: { value: "unmount-q" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(pending).toHaveLength(4);
    unmount();
    pending[3]!.resolve(options);
    await flushMicrotasks();
  });

  it("supports keyboard selection, excludeValues, clear invalidation, and initialOption echo", async () => {
    const pending: Array<ReturnType<typeof deferred>> = [];
    const search = vi.fn(() => {
      const d = deferred();
      pending.push(d);
      return d.promise;
    });
    const onValueChange = vi.fn();
    const onSelect = vi.fn();

    const { container, rerender } = render(
      <AsyncSearchSelect
        value={null}
        search={search}
        excludeValues={["c"]}
        onValueChange={onValueChange}
        onSelect={onSelect}
      />,
    );
    const input = container.querySelector<HTMLInputElement>("input")!;

    fireEvent.focus(input);
    pending[0]!.resolve(options);
    await flushMicrotasks();
    expect(bodyOptions()).toHaveLength(2);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(input.getAttribute("aria-activedescendant")).toMatch(/_0$/);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toMatch(/_1$/);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(onSelect).toHaveBeenLastCalledWith(options[1]);

    rerender(
      <AsyncSearchSelect
        value="b"
        search={search}
        onValueChange={onValueChange}
        onSelect={onSelect}
      />,
    );
    expect(input.value).toBe("Beta");

    const clear =
      container.querySelector<HTMLButtonElement>("button.mw-ass-clear")!;
    expect(clear.getAttribute("aria-label")).toBe("清除选择");
    fireEvent.change(input, { target: { value: "x" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    const inFlight = pending[pending.length - 1]!;
    fireEvent.click(clear);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(onSelect).toHaveBeenLastCalledWith(null);
    inFlight.resolve(options);
    await flushMicrotasks();

    rerender(
      <AsyncSearchSelect
        value="ext-2"
        initialOption={{ value: "ext-2", label: "李初见" }}
        search={search}
      />,
    );
    expect(input.value).toBe("李初见");
  });

  it("handles loading, empty, error, and retry four states", async () => {
    const pending: Array<ReturnType<typeof deferred>> = [];
    const search = vi.fn(() => {
      const d = deferred();
      pending.push(d);
      return d.promise;
    });

    const { container } = render(
      <AsyncSearchSelect value={null} search={search} />,
    );
    const input = container.querySelector<HTMLInputElement>("input")!;

    fireEvent.focus(input);
    expect(container.querySelector(".mw-ass-loader")).not.toBeNull();

    pending[0]!.resolve([]);
    await flushMicrotasks();
    expect(document.body.querySelector(".mw-ass-note")?.textContent).toBe(
      "无匹配项",
    );

    fireEvent.change(input, { target: { value: "err-query" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(document.body.querySelector(".mw-ass-note")?.textContent).toBe(
      "正在搜索…",
    );

    pending[1]!.reject(new Error("network error"));
    await flushMicrotasks();
    expect(document.body.querySelector(".mw-ass-error")?.textContent).toBe(
      "加载失败",
    );

    const retryBtn =
      document.body.querySelector<HTMLButtonElement>(".mw-ass-retry")!;
    expect(retryBtn).not.toBeNull();
    expect(retryBtn.textContent).toBe("重试");

    fireEvent.click(retryBtn);
    expect(pending).toHaveLength(3);
    expect(search).toHaveBeenLastCalledWith("err-query");
    pending[2]!.resolve([options[0]!]);
    await flushMicrotasks();
    expect(bodyOptions()).toHaveLength(1);
    expect(bodyOptions()[0]?.textContent).toContain("Alpha");
  });

  it("restores selected label when dismissing without picking or clearing query text", async () => {
    const pending: Array<ReturnType<typeof deferred>> = [];
    const search = vi.fn(() => {
      const d = deferred();
      pending.push(d);
      return d.promise;
    });
    const onValueChange = vi.fn();

    const { container } = render(
      <AsyncSearchSelect
        value="a"
        initialOption={options[0]}
        search={search}
        onValueChange={onValueChange}
      />,
    );
    const input = container.querySelector<HTMLInputElement>("input")!;
    expect(input.value).toBe("Alpha");

    fireEvent.change(input, { target: { value: "Gam" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    pending[0]!.resolve(options);
    await flushMicrotasks();

    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.blur(input);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input.value).toBe("Alpha");
  });
});
