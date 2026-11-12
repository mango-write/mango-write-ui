import { useState } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { defaultConfirmStore } from "../lib/confirm";
import { ConfirmHost } from "./ConfirmHost";
import { Dialog } from "./Dialog";
import { ImageLightbox } from "./ImageLightbox";
import { Popover } from "./Popover";

function inlineZ(el: Element | null): number {
  const z = (el as HTMLElement | null)?.style?.zIndex ?? "";
  const m = z.match(/^calc\(var\(--z-overlay\)\s*\+\s*(\d+)\)$/);
  return m ? Number(m[1]) : -1;
}

describe("浮层堆叠顺序（overlay-layer 动态层级）", () => {
  afterEach(() => {
    defaultConfirmStore.closeAll();
    cleanup();
    document.body.innerHTML = "";
    document.body.style.overflow = "";
  });

  it("ConfirmHost 先挂载、业务 Dialog 后打开时，后触发的确认框层级高于 Dialog，Esc 逐层只关最内层且全关后槽位归零", () => {
    function App() {
      const [opOpen, setOpOpen] = useState(false);
      return (
        <>
          <ConfirmHost />
          <button
            type="button"
            data-open-op=""
            onClick={() => setOpOpen(true)}
          >
            打开业务弹窗
          </button>
          <Dialog open={opOpen} onOpenChange={setOpOpen} title="赠送积分">
            <button type="button" data-op-submit="">
              赠送
            </button>
          </Dialog>
        </>
      );
    }

    render(<App />);

    // 1. 业务 Dialog 先打开 -> 拿到槽位 1
    fireEvent.click(document.querySelector<HTMLButtonElement>("[data-open-op]")!);
    const opContent = document.querySelector(".mw-dialog");
    expect(opContent, "业务 Dialog 内容应已挂载").not.toBeNull();
    const firstDialogZ = inlineZ(opContent);
    expect(firstDialogZ).toBe(1);

    // 2. 全局先挂载的 ConfirmHost 后触发 -> 动态层级必须高于已开 Dialog
    act(() => {
      void defaultConfirmStore.ask({
        header: "确认赠送",
        message: "确认为该用户赠送积分？",
      });
    });

    const confirmContent = document.querySelector(".mw-confirm");
    expect(confirmContent, "确认框内容应已挂载").not.toBeNull();
    expect(inlineZ(confirmContent)).toBeGreaterThan(firstDialogZ);

    // 3. 第一次按 Esc：只关闭最内层的 ConfirmHost，业务 Dialog 保持打开
    fireEvent.keyDown(document.activeElement ?? document, {
      key: "Escape",
      bubbles: true,
    });
    expect(document.querySelector(".mw-confirm")).toBeNull();
    expect(document.querySelector(".mw-dialog")).not.toBeNull();

    // 4. 第二次按 Esc：关闭外层业务 Dialog
    fireEvent.keyDown(document.activeElement ?? document, {
      key: "Escape",
      bubbles: true,
    });
    expect(document.querySelector(".mw-dialog")).toBeNull();

    // 5. 全部关闭后槽位归零，重新打开业务 Dialog 再次从槽位 1 起算
    fireEvent.click(document.querySelector<HTMLButtonElement>("[data-open-op]")!);
    expect(inlineZ(document.querySelector(".mw-dialog"))).toBe(1);
  });

  it("Dialog 内打开 Popover 与 ImageLightbox 时层级递增高于 Dialog，Esc 逐层只关最内层且全关后槽位归零", () => {
    function App() {
      const [opOpen, setOpOpen] = useState(true);
      const [popOpen, setPopOpen] = useState(false);
      const [lightboxVisible, setLightboxVisible] = useState(false);
      return (
        <>
          <button
            type="button"
            data-reopen-dialog=""
            onClick={() => setOpOpen(true)}
          >
            重开宿主弹窗
          </button>
          <Dialog open={opOpen} onOpenChange={setOpOpen} title="宿主弹窗">
            <Popover
              open={popOpen}
              onOpenChange={setPopOpen}
              trigger={
                <button type="button" data-open-pop="">
                  打开浮层
                </button>
              }
            >
              <div data-pop-body="">浮层内容</div>
            </Popover>
            <button
              type="button"
              data-open-lb=""
              onClick={() => setLightboxVisible(true)}
            >
              打开灯箱
            </button>
            <ImageLightbox
              visible={lightboxVisible}
              onVisibleChange={setLightboxVisible}
              src="/x.png"
            />
          </Dialog>
        </>
      );
    }

    render(<App />);

    const opContent = document.querySelector(".mw-dialog");
    expect(opContent).not.toBeNull();
    const dialogZ = inlineZ(opContent);
    expect(dialogZ).toBe(1);

    // 从 Dialog 内打开 Popover -> 层级高于 Dialog
    fireEvent.click(document.querySelector<HTMLButtonElement>("[data-open-pop]")!);
    const popContent = document.querySelector(".mw-popover");
    expect(popContent).not.toBeNull();
    const popZ = inlineZ(popContent);
    expect(popZ).toBeGreaterThan(dialogZ);

    // 再打开 ImageLightbox -> 层级高于 Popover 与 Dialog
    fireEvent.click(document.querySelector<HTMLButtonElement>("[data-open-lb]")!);
    const lightbox = document.querySelector(".mw-lightbox");
    expect(lightbox).not.toBeNull();
    const lbZ = inlineZ(lightbox);
    expect(lbZ).toBeGreaterThan(popZ);

    // 第一次按 Esc：仅关闭最内层 ImageLightbox，Popover 与 Dialog 仍在
    fireEvent.keyDown(document.activeElement ?? document, {
      key: "Escape",
      bubbles: true,
    });
    expect(document.querySelector(".mw-lightbox")).toBeNull();
    expect(document.querySelector(".mw-popover")).not.toBeNull();
    expect(document.querySelector(".mw-dialog")).not.toBeNull();

    // 第二次按 Esc：仅关闭次内层 Popover，Dialog 仍在
    fireEvent.keyDown(document.activeElement ?? document, {
      key: "Escape",
      bubbles: true,
    });
    expect(document.querySelector(".mw-popover")).toBeNull();
    expect(document.querySelector(".mw-dialog")).not.toBeNull();

    // 第三次按 Esc：关闭最外层 Dialog
    fireEvent.keyDown(document.activeElement ?? document, {
      key: "Escape",
      bubbles: true,
    });
    expect(document.querySelector(".mw-dialog")).toBeNull();

    // 全关后重新打开宿主弹窗，动态层级槽位已归零复位到 1
    fireEvent.click(
      document.querySelector<HTMLButtonElement>("[data-reopen-dialog]")!,
    );
    expect(inlineZ(document.querySelector(".mw-dialog"))).toBe(1);
  });
});
