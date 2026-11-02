import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

import { mountUiComponent } from "../test-utils/mount.js";
import AsyncSearchSelect from "./AsyncSearchSelect.vue";
import type { AsyncSearchOption } from "./async-search-select";

const options: AsyncSearchOption[] = [
  { value: "a", label: "Alpha", description: "alpha@example.test" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", avatar: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" },
];

let mounted: ReturnType<typeof mountUiComponent> | null = null;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", (callback: (time: number) => void) => {
    callback(0);
    return 0;
  });
});

afterEach(() => {
  mounted?.unmount();
  mounted = null;
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function deferred() {
  let resolve!: (value: AsyncSearchOption[]) => void;
  const promise = new Promise<AsyncSearchOption[]>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function mountSelect(props: Record<string, unknown> = {}) {
  const pending: Array<ReturnType<typeof deferred>> = [];
  mounted = mountUiComponent(AsyncSearchSelect, {
    attachTo: document.body,
    props: {
      modelValue: null,
      search: vi.fn(() => {
        const d = deferred();
        pending.push(d);
        return d.promise;
      }),
      placeholder: "搜索选项",
      ...props,
    },
  });
  return { wrapper: mounted, pending };
}

function bodyOptions() {
  return document.body.querySelectorAll('[role="option"]');
}

describe("AsyncSearchSelect", () => {
  it("聚焦即取数，输入经防抖后再取数", async () => {
    const { wrapper, pending } = mountSelect();
    const input = wrapper.get("input");
    await input.trigger("focus");
    expect(pending).toHaveLength(1);
    pending[0].resolve(options);
    await flushPromises();
    expect(bodyOptions()).toHaveLength(3);

    await input.setValue("al");
    expect(pending).toHaveLength(1); // 防抖窗口内不取数
    await vi.advanceTimersByTimeAsync(250);
    expect(pending).toHaveLength(2);
    expect((wrapper.props("search") as ReturnType<typeof vi.fn>).mock.calls.at(-1)).toEqual(["al"]);
    pending[1].resolve([options[0]]);
    await flushPromises();
    expect(bodyOptions()).toHaveLength(1);
  });

  it("过期响应不落：旧结果与 loading 都不回闪", async () => {
    const { wrapper, pending } = mountSelect();
    const input = wrapper.get("input");
    await input.trigger("focus");
    await input.setValue("first");
    await vi.advanceTimersByTimeAsync(250);
    await input.setValue("second");
    await vi.advanceTimersByTimeAsync(250);
    expect(pending).toHaveLength(3);

    pending[2].resolve([options[1]]);
    await flushPromises();
    pending[1].resolve(options); // 慢的旧响应后到
    await flushPromises();
    expect(bodyOptions()).toHaveLength(1);
    expect(bodyOptions()[0].id).toContain("option-0");
    expect(document.querySelector(".mw-ass-overlay")?.getAttribute("aria-busy")).toBe("false");
  });

  it("键盘选择同时发 update:modelValue 与 select，收起时显示所选项", async () => {
    const { wrapper, pending } = mountSelect();
    const input = wrapper.get("input");
    await input.trigger("focus");
    pending[0].resolve(options);
    await flushPromises();

    await input.trigger("keydown", { key: "ArrowDown" });
    expect(input.attributes("aria-activedescendant")).toContain("option-0");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["a"]);
    expect(wrapper.emitted("select")?.at(-1)).toEqual([options[0]]);
    await wrapper.setProps({ modelValue: "a" });
    await flushPromises();
    expect(input.attributes("aria-expanded")).toBe("false");
    expect((input.element as HTMLInputElement).value).toBe("Alpha");
  });

  it("excludeValues 把对应选项从结果里剔除", async () => {
    const { wrapper, pending } = mountSelect({ excludeValues: ["b"] });
    await wrapper.get("input").trigger("focus");
    pending[0].resolve(options);
    await flushPromises();
    expect(bodyOptions()).toHaveLength(2);
    expect(document.body.querySelector('[role="option"]')?.textContent).toContain("Alpha");
  });

  it("清除按钮发空值并作废在途响应", async () => {
    const { wrapper, pending } = mountSelect();
    const input = wrapper.get("input");
    await input.trigger("focus");
    pending[0].resolve(options);
    await flushPromises();
    await input.trigger("keydown", { key: "Enter" }); // 选中 Alpha
    await wrapper.setProps({ modelValue: "a" });
    await flushPromises();

    const clear = wrapper.get("button.mw-ass-clear");
    expect(clear.attributes("aria-label")).toBe("清除选择");
    await input.setValue("x"); // 触发一次防抖取数，让在途请求存在
    await vi.advanceTimersByTimeAsync(250);
    await clear.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([null]);
    await wrapper.setProps({ modelValue: null });
    await flushPromises();
    expect(wrapper.emitted("select")?.at(-1)).toEqual([null]);
    expect((input.element as HTMLInputElement).value).toBe("");

    pending[1].resolve(options); // 在途响应后到，不应复活列表
    await flushPromises();
    expect(bodyOptions()).toHaveLength(0);
  });

  it("空结果与加载中分别呈现空态与加载文案", async () => {
    const { wrapper, pending } = mountSelect();
    const input = wrapper.get("input");
    await input.trigger("focus");
    expect(document.body.querySelector(".mw-ass-note")?.textContent).toBe("正在搜索…");

    pending[0].resolve([]);
    await flushPromises();
    expect(document.body.querySelector(".mw-ass-note")?.textContent).toBe("无匹配项");

    await input.setValue("x");
    await vi.advanceTimersByTimeAsync(250);
    expect(document.body.querySelector(".mw-ass-note")?.textContent).toBe("正在搜索…");
  });

  it("外部设入未见过的 modelValue 时回退显示原始值", async () => {
    const { wrapper } = mountSelect({ modelValue: "ext-1" });
    await flushPromises();
    expect((wrapper.get("input").element as HTMLInputElement).value).toBe("ext-1");
  });
});
