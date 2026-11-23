import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import VirtualList from "./VirtualList.vue";

const items = Array.from({ length: 1000 }, (_, i) => i);
const itemKey = (item: number) => item;

describe("VirtualList", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders the visible range, retains focused and pinned rows, and jumps by key", async () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(160);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(40);
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(40_000);
    const scrollTo = vi.spyOn(HTMLElement.prototype, "scrollTo");
    const list = mount(VirtualList<number>, {
      attachTo: document.body,
      props: { items, itemKey, estimateSize: 40, overscan: 2, pinnedKeys: [999] },
      attrs: { "aria-label": "Records", "data-testid": "records" },
      slots: { default: ({ item }: { item: number }) => h("button", { "data-row": item }, String(item)) },
    });
    await nextTick();

    expect(list.attributes("tabindex")).toBe("0");
    expect(list.attributes("aria-label")).toBe("Records");
    expect(list.attributes("data-testid")).toBe("records");
    expect(list.findAll('[role="listitem"]').length).toBeLessThan(18);
    expect(list.get('[data-row="999"]').element.parentElement?.getAttribute("aria-posinset")).toBe("1000");
    expect(list.find('[data-row="500"]').exists()).toBe(false);
    list.get<HTMLButtonElement>('[data-row="0"]').element.focus();

    expect(list.vm.scrollToKey(500)).toBe(true);
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: "instant" }));
    list.element.scrollTop = 20_000;
    await list.trigger("scroll");
    await nextTick();

    expect(list.find('[data-row="500"]').exists()).toBe(true);
    expect(list.find('[data-row="0"]').exists()).toBe(true);
    expect(list.find('[data-row="1"]').exists()).toBe(false);
    expect(list.find('[data-row="999"]').exists()).toBe(true);
    expect(list.vm.scrollToKey(-1)).toBe(false);
    list.element.focus();
    await nextTick();
    expect(list.find('[data-row="0"]').exists()).toBe(false);
    list.unmount();
  });

  it("renders empty and persistent footer slots", () => {
    const list = mount(VirtualList<number>, {
      props: { items: [], itemKey, estimateSize: 40 },
      slots: { default: () => "", empty: "No records", footer: "Load more" },
    });
    expect(list.text()).toBe("No recordsLoad more");
    expect(list.find('[role="list"]').exists()).toBe(false);
    list.unmount();
  });
});
