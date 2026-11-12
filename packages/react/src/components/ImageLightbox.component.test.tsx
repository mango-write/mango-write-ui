import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ImageLightbox } from "./ImageLightbox";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

function parseScaleAndRotate(transform: string): {
  tx: number;
  ty: number;
  scale: number;
  rotate: number;
} {
  const m = transform.match(
    /translate\(([-\d.]+)px,\s*([-\d.]+)px\)\s*scale\(([-\d.]+)\)\s*rotate\(([-\d.]+)deg\)/,
  );
  if (!m) {
    throw new Error(`Unexpected transform: ${transform}`);
  }
  return {
    tx: Number(m[1]),
    ty: Number(m[2]),
    scale: Number(m[3]),
    rotate: Number(m[4]),
  };
}

describe("ImageLightbox", () => {
  it("打开时命名对话框、聚焦关闭按钮、锁定背景并在关闭后恢复焦点与滚动", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.append(trigger);
    trigger.focus();
    document.body.style.overflow = "auto";

    const { rerender } = render(
      <ImageLightbox
        visible={false}
        src="/figure.png"
        alt="实验结果图"
        caption="图 1 实验结果"
      />,
    );

    rerender(
      <ImageLightbox
        visible={true}
        src="/figure.png"
        alt="实验结果图"
        caption="图 1 实验结果"
      />,
    );

    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialog?.getAttribute("aria-label")).toBe("图 1 实验结果");
    expect(dialog?.style.zIndex).toMatch(/^calc\(var\(--z-overlay\)\s*\+\s*\d+\)$/);
    expect(document.body.style.overflow).toBe("hidden");
    expect((document.activeElement as HTMLElement)?.getAttribute("aria-label")).toBe("关闭");
    expect(document.body.querySelector(".mw-lightbox__caption")?.textContent).toBe(
      "图 1 实验结果",
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    expect((document.activeElement as HTMLElement)?.getAttribute("aria-label")).toBe("放大");

    rerender(
      <ImageLightbox
        visible={false}
        src="/figure.png"
        alt="实验结果图"
        caption="图 1 实验结果"
      />,
    );

    expect(document.body.style.overflow).toBe("auto");
    expect(document.activeElement).toBe(trigger);
  });

  it("初始 visible=true 安装键盘监听并支持 Escape 关闭", () => {
    const onVisibleChange = vi.fn();
    render(
      <ImageLightbox
        visible={true}
        src="/figure.png"
        alt="实验结果图"
        onVisibleChange={onVisibleChange}
      />,
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });

  it("支持 0.2x–8x 滚轮与按钮缩放钳制、90° 步进旋转、指针拖拽平移与重置", () => {
    render(
      <ImageLightbox
        visible={true}
        src="/figure.png"
        alt="实验结果图"
        caption="图 2 谱分析"
      />,
    );

    const stage = document.querySelector<HTMLElement>(".mw-lightbox__stage")!;
    const img = document.querySelector<HTMLImageElement>(".mw-lightbox__img")!;
    const zoomInBtn = document.querySelector<HTMLButtonElement>('[aria-label="放大"]')!;
    const zoomOutBtn = document.querySelector<HTMLButtonElement>('[aria-label="缩小"]')!;
    const rotateRightBtn = document.querySelector<HTMLButtonElement>(
      '[aria-label="向右旋转"]',
    )!;
    const rotateLeftBtn = document.querySelector<HTMLButtonElement>(
      '[aria-label="向左旋转"]',
    )!;
    const resetBtn = document.querySelector<HTMLButtonElement>(
      '[aria-label="复位"]',
    )!;

    // 连续放大直至触碰 8x 上界
    for (let i = 0; i < 20; i += 1) {
      fireEvent.click(zoomInBtn);
    }
    expect(parseScaleAndRotate(img.style.transform).scale).toBe(8);

    // 滚轮连续缩小直至触碰 0.2x 下界
    for (let i = 0; i < 40; i += 1) {
      fireEvent.wheel(stage, { deltaY: 120 });
    }
    expect(parseScaleAndRotate(img.style.transform).scale).toBe(0.2);

    // 按钮缩小在 0.2x 下界保持钳制
    fireEvent.click(zoomOutBtn);
    expect(parseScaleAndRotate(img.style.transform).scale).toBe(0.2);

    // 90° 步进旋转与指针拖拽平移
    fireEvent.click(rotateRightBtn);
    fireEvent.click(rotateRightBtn);
    fireEvent.click(rotateLeftBtn);

    fireEvent.pointerDown(img, { clientX: 100, clientY: 120, pointerId: 1 });
    fireEvent.pointerMove(img, { clientX: 145, clientY: 90, pointerId: 1 });
    fireEvent.pointerUp(img, { pointerId: 1 });

    const moved = parseScaleAndRotate(img.style.transform);
    expect(moved.rotate).toBe(90);
    expect(moved.tx).toBe(45);
    expect(moved.ty).toBe(-30);

    // 重置恢复初始变换
    fireEvent.click(resetBtn);
    expect(parseScaleAndRotate(img.style.transform)).toEqual({
      tx: 0,
      ty: 0,
      scale: 1,
      rotate: 0,
    });
  });
});
