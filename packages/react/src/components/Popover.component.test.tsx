import { useRef, useState } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Popover, { type PopoverHandle } from "./Popover";

describe("Popover", () => {
  it("supports controlled open + declarative trigger prop and dynamic overlay z-index", () => {
    function Host() {
      const [open, setOpen] = useState(false);
      return (
        <Popover
          open={open}
          onOpenChange={setOpen}
          appendTo="self"
          ariaLabel="文献详情浮层"
          data-testid="decl-popover"
          trigger={
            <button type="button" className="trigger-btn">
              打开浮层
            </button>
          }
        >
          <div className="popover-body">浮层正文内容</div>
        </Popover>
      );
    }

    const { container } = render(<Host />);
    expect(container.querySelector(".popover-body")).toBeNull();

    fireEvent.click(container.querySelector(".trigger-btn")!);

    const content = container.querySelector<HTMLElement>('[data-testid="decl-popover"]')!;
    expect(content).not.toBeNull();
    expect(content.classList.contains("mw-popover")).toBe(true);
    expect(content.classList.contains("mw-frost")).toBe(true);
    expect(content.getAttribute("aria-label")).toBe("文献详情浮层");
    expect(content.style.zIndex).toMatch(/^calc\(var\(--z-overlay\)\s*\+\s*\d+\)$/);
    expect(container.querySelector(".popover-body")?.textContent).toBe("浮层正文内容");

    fireEvent.keyDown(content, { key: "Escape" });
    expect(container.querySelector(".popover-body")).toBeNull();
  });

  it("supports imperative ref { toggle, show, hide } anchoring arbitrary event targets", () => {
    const events: string[] = [];
    let popHandle: PopoverHandle | null = null;
    let buttonAEl: HTMLButtonElement | null = null;

    function Host() {
      const popRef = useRef<PopoverHandle | null>(null);
      const btnBRef = useRef<HTMLButtonElement | null>(null);
      popHandle = popRef.current;

      return (
        <div>
          <button
            ref={(node) => {
              buttonAEl = node;
            }}
            type="button"
            className="btn-a"
            onClick={(e) => popRef.current?.toggle(e)}
          >
            按钮 A
          </button>
          <button
            ref={btnBRef}
            type="button"
            className="btn-b"
            onClick={(e) => popRef.current?.toggle(e, btnBRef.current)}
          >
            按钮 B
          </button>
          <Popover
            ref={(handle) => {
              popRef.current = handle;
              popHandle = handle;
            }}
            appendTo="self"
            onShow={() => events.push("show")}
            onHide={() => events.push("hide")}
          >
            {({ close }) => (
              <button type="button" className="inner-close" onClick={close}>
                内部关闭
              </button>
            )}
          </Popover>
        </div>
      );
    }

    const { container } = render(<Host />);
    expect(container.querySelector(".inner-close")).toBeNull();

    // Click button A -> opens
    fireEvent.click(container.querySelector(".btn-a")!);
    expect(container.querySelector(".inner-close")).not.toBeNull();
    expect(events).toEqual(["show"]);

    // Click different anchor button B while open -> switches anchor and stays open
    fireEvent.click(container.querySelector(".btn-b")!);
    expect(container.querySelector(".inner-close")).not.toBeNull();
    expect(events).toEqual(["show"]);

    // Click same anchor button B again -> closes
    fireEvent.click(container.querySelector(".btn-b")!);
    expect(container.querySelector(".inner-close")).toBeNull();
    expect(events).toEqual(["show", "hide"]);

    // Imperative show(btnA) & close
    act(() => {
      popHandle?.show(buttonAEl);
    });
    expect(container.querySelector(".inner-close")).not.toBeNull();
    expect(events).toEqual(["show", "hide", "show"]);

    fireEvent.click(container.querySelector(".inner-close")!);
    expect(container.querySelector(".inner-close")).toBeNull();
    expect(events).toEqual(["show", "hide", "show", "hide"]);
  });

  it("does not close on Escape when closeOnEscape={false}", () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <Popover open={true} closeOnEscape={false} appendTo="self" onOpenChange={onOpenChange}>
        <p>固定内容</p>
      </Popover>,
    );

    fireEvent.keyDown(container.querySelector(".mw-popover")!, { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
