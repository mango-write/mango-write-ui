import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Slider from "./Slider";

describe("Slider", () => {
  it("支持单值滑块受控读写、键盘步进以及 onChange / onSlideEnd 事件", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    const onSlideEnd = vi.fn();

    const { container, rerender } = render(
      <Slider
        value={30}
        min={0}
        max={100}
        step={5}
        ariaLabel="不透明度"
        onValueChange={onValueChange}
        onChange={onChange}
        onSlideEnd={onSlideEnd}
      />,
    );

    const root = container.querySelector(".mw-slider")!;
    expect(root).not.toBeNull();
    const input = container.querySelector<HTMLInputElement>('input[type="range"]')!;
    expect(input.getAttribute("aria-label")).toBe("不透明度");
    expect(input.getAttribute("step")).toBe("5");
    expect(input.getAttribute("aria-valuemin")).toBe("0");
    expect(input.getAttribute("aria-valuemax")).toBe("100");
    expect(input.getAttribute("aria-valuenow")).toBe("30");

    fireEvent.change(input, { target: { value: "65" } });
    expect(onValueChange).toHaveBeenLastCalledWith(65);
    expect(onChange).toHaveBeenLastCalledWith(65);
    expect(onSlideEnd).toHaveBeenLastCalledWith(expect.objectContaining({ value: 65 }));

    rerender(
      <Slider
        value={65}
        min={0}
        max={100}
        step={5}
        onValueChange={onValueChange}
        onChange={onChange}
        onSlideEnd={onSlideEnd}
      />,
    );
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith(70);

    rerender(
      <Slider
        value={70}
        min={0}
        max={100}
        step={5}
        onValueChange={onValueChange}
        onChange={onChange}
        onSlideEnd={onSlideEnd}
      />,
    );
    fireEvent.keyDown(input, { key: "ArrowLeft" });
    expect(onValueChange).toHaveBeenLastCalledWith(65);

    fireEvent.keyDown(input, { key: "Home" });
    expect(onValueChange).toHaveBeenLastCalledWith(0);

    fireEvent.keyDown(input, { key: "End" });
    expect(onValueChange).toHaveBeenLastCalledWith(100);
  });

  it("支持 range 双滑块区间模式、vertical 纵向模式与 disabled 禁用拦截", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <Slider
        value={[20, 80]}
        min={0}
        max={100}
        range
        orientation="vertical"
        onValueChange={onValueChange}
      />,
    );

    const root = container.querySelector(".mw-slider")!;
    expect(root.classList.contains("mw-slider--vertical")).toBe(true);
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="range"]');
    expect(inputs).toHaveLength(2);

    fireEvent.change(inputs[0]!, { target: { value: "35" } });
    expect(onValueChange).toHaveBeenLastCalledWith([35, 80]);

    rerender(
      <Slider
        value={[35, 80]}
        min={0}
        max={100}
        range
        orientation="vertical"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(inputs[1]!, { target: { value: "90" } });
    expect(onValueChange).toHaveBeenLastCalledWith([35, 90]);

    rerender(
      <Slider
        value={[35, 90]}
        min={0}
        max={100}
        range
        orientation="vertical"
        disabled
        onValueChange={onValueChange}
      />,
    );
    expect(root.getAttribute("data-disabled")).toBe("");
    fireEvent.keyDown(inputs[0]!, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it("缺省 step 时为连续模式，显式传入 step 时指针拖动按刻度吸附，showTicks 渲染刻度", () => {
    const onContinuous = vi.fn();
    const { container: c1 } = render(
      <Slider value={30} min={0} max={100} showTicks onValueChange={onContinuous} />,
    );
    const input = c1.querySelector<HTMLInputElement>('input[type="range"]')!;
    expect(input.getAttribute("step")).toBe("any");
    expect(c1.querySelector(".mw-slider__ticks")).toBeNull();

    fireEvent.change(input, { target: { value: "33.7" } });
    expect(onContinuous).toHaveBeenLastCalledWith(33.7);

    const onSnapped = vi.fn();
    const onSlideEnd = vi.fn();
    const { container: c2 } = render(
      <Slider
        value={0}
        min={0}
        max={100}
        step={25}
        showTicks
        onValueChange={onSnapped}
        onSlideEnd={onSlideEnd}
      />,
    );
    const ticks = c2.querySelectorAll(".mw-slider__tick");
    expect(ticks).toHaveLength(5);
    expect(ticks[1]!.getAttribute("style")).toContain("left: 25%");

    const root = c2.querySelector<HTMLDivElement>(".mw-slider")!;
    Object.defineProperty(root, "getBoundingClientRect", {
      value: () => ({ left: 0, right: 200, top: 0, bottom: 100, width: 200, height: 100 }),
    });

    fireEvent.pointerDown(root, { clientX: 46, clientY: 50, pointerId: 1, pointerType: "mouse", button: 0 });
    expect(onSnapped).toHaveBeenLastCalledWith(25);

    fireEvent.pointerMove(root, { clientX: 146, clientY: 50, pointerId: 1 });
    expect(onSnapped).toHaveBeenLastCalledWith(75);

    fireEvent.pointerUp(root, { clientX: 146, clientY: 50, pointerId: 1 });
    expect(onSlideEnd).toHaveBeenLastCalledWith(expect.objectContaining({ value: 75 }));
  });

  it("指针拖动：range 模式就近选手柄且不越过另一端，vertical 模式按纵轴取值", () => {
    const onRange = vi.fn();
    const { container: c1 } = render(
      <Slider value={[20, 80]} min={0} max={100} range onValueChange={onRange} />,
    );
    const root1 = c1.querySelector<HTMLDivElement>(".mw-slider")!;
    Object.defineProperty(root1, "getBoundingClientRect", {
      value: () => ({ left: 0, right: 200, top: 0, bottom: 100, width: 200, height: 100 }),
    });

    fireEvent.pointerDown(root1, { clientX: 20, clientY: 50, pointerId: 1, pointerType: "mouse", button: 0 });
    expect(onRange).toHaveBeenLastCalledWith([10, 80]);

    fireEvent.pointerMove(root1, { clientX: 190, clientY: 50, pointerId: 1 });
    expect(onRange).toHaveBeenLastCalledWith([80, 80]);

    const onVertical = vi.fn();
    const { container: c2 } = render(
      <Slider value={50} min={0} max={100} orientation="vertical" onValueChange={onVertical} />,
    );
    const root2 = c2.querySelector<HTMLDivElement>(".mw-slider")!;
    Object.defineProperty(root2, "getBoundingClientRect", {
      value: () => ({ left: 0, right: 18, top: 0, bottom: 100, width: 18, height: 100 }),
    });

    fireEvent.pointerDown(root2, { clientX: 9, clientY: 25, pointerId: 2, pointerType: "mouse", button: 0 });
    expect(onVertical).toHaveBeenLastCalledWith(75);
  });
});
