import { act, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import VirtualList from "./VirtualList";
import type { VirtualListHandle } from "./virtual-list-defs";

const items = Array.from({ length: 1000 }, (_, i) => i);
const itemKey = (item: number) => item;

describe("VirtualList", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders the visible range, supports pinned items, and jumps by key", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(160);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(40);
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(40_000);
    const scrollTo = vi.spyOn(HTMLElement.prototype, "scrollTo");
    const ref = createRef<VirtualListHandle>();
    const list = render(
      <VirtualList ref={ref} items={items} itemKey={itemKey} estimateSize={40} overscan={2}
        pinnedKeys={[999]} aria-label="Records" data-testid="records">
        {(item) => <button>{item}</button>}
      </VirtualList>,
    );

    const viewport = list.getByTestId("records");
    expect(viewport.getAttribute("tabindex")).toBe("0");
    expect(viewport.getAttribute("aria-label")).toBe("Records");
    expect(list.getAllByRole("listitem").length).toBeLessThan(18);
    expect(list.getByText("999").parentElement?.getAttribute("aria-posinset")).toBe("1000");
    expect(list.queryByText("500")).toBeNull();
    act(() => list.getByText("0").focus());

    expect(ref.current?.scrollToKey(500)).toBe(true);
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: "instant" }));
    viewport.scrollTop = 20_000;
    fireEvent.scroll(viewport);

    expect(list.getByText("500")).toBeTruthy();
    expect(list.getByText("0")).toBeTruthy();
    expect(list.queryByText("1")).toBeNull();
    expect(list.getByText("999")).toBeTruthy();
    expect(ref.current?.scrollToKey(-1)).toBe(false);
    act(() => viewport.focus());
    expect(list.queryByText("0")).toBeNull();
  });

  it("renders empty and persistent footer content", () => {
    const list = render(
      <VirtualList items={[]} itemKey={itemKey} estimateSize={40} empty="No records" footer="Load more">
        {String}
      </VirtualList>,
    );
    expect(list.getByText("No recordsLoad more")).toBeTruthy();
    expect(list.queryByRole("list")).toBeNull();
  });
});
