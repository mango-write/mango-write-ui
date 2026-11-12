import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FileDropZone from "./FileDropZone";

function makeFile(name: string): File {
  return new File(["x"], name, { type: "text/plain" });
}

function dragPayload(files: File[], types = ["Files"]) {
  return { dataTransfer: { files, types } };
}

describe("FileDropZone", () => {
  it("drop 带文件：触发 onFiles 回调且高亮复位", () => {
    const onFiles = vi.fn();
    const { container } = render(
      <FileDropZone onFiles={onFiles}>
        <p>hint</p>
      </FileDropZone>,
    );

    const zone = container.querySelector(".mw-filedrop")!;
    fireEvent.dragEnter(zone, dragPayload([]));
    expect(zone.classList.contains("mw-filedrop--over")).toBe(true);

    const file = makeFile("a.pdf");
    fireEvent.drop(zone, dragPayload([file]));
    expect(onFiles).toHaveBeenCalledWith([file]);
    expect(zone.classList.contains("mw-filedrop--over")).toBe(false);
  });

  it("非文件拖拽（纯文本）不点亮高亮", () => {
    const { container } = render(
      <FileDropZone>
        <p>hint</p>
      </FileDropZone>,
    );
    const zone = container.querySelector(".mw-filedrop")!;
    fireEvent.dragEnter(zone, dragPayload([], ["text/plain"]));
    expect(zone.classList.contains("mw-filedrop--over")).toBe(false);
  });

  it("dragenter/leave 按深度计数：进出子元素不丢高亮，离开根才熄灭", () => {
    const { container } = render(
      <FileDropZone multiple>
        <p>hint</p>
      </FileDropZone>,
    );
    const zone = container.querySelector(".mw-filedrop")!;
    const child = container.querySelector("p")!;

    fireEvent.dragEnter(zone, dragPayload([]));
    fireEvent.dragEnter(child, dragPayload([]));
    fireEvent.dragLeave(child);
    expect(zone.classList.contains("mw-filedrop--over")).toBe(true);
    fireEvent.dragLeave(zone);
    expect(zone.classList.contains("mw-filedrop--over")).toBe(false);
  });

  it("点选与键盘触发：打开 file picker，change 归一成 File[] 并清空 value", () => {
    const onFiles = vi.fn();
    const { container } = render(
      <FileDropZone accept=".pdf,application/pdf" multiple onFiles={onFiles}>
        <p>hint</p>
      </FileDropZone>,
    );

    const zone = container.querySelector(".mw-filedrop")!;
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(input.accept).toBe(".pdf,application/pdf");
    expect(input.multiple).toBe(true);

    const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});
    fireEvent.click(zone);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(zone, { key: "Enter" });
    expect(clickSpy).toHaveBeenCalledTimes(2);

    const file = makeFile("b.md");
    Object.defineProperty(input, "files", { configurable: true, value: [file] });
    fireEvent.change(input);
    expect(onFiles).toHaveBeenCalledWith([file]);
    expect(input.value).toBe("");
  });

  it("disabled 时拖入、点选和键盘均不发出文件", () => {
    const onFiles = vi.fn();
    const { container } = render(
      <FileDropZone disabled ariaLabel="暂不可上传" onFiles={onFiles}>
        <p>hint</p>
      </FileDropZone>,
    );

    const zone = container.querySelector(".mw-filedrop")!;
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});

    expect(zone.getAttribute("aria-label")).toBe("暂不可上传");
    expect(zone.getAttribute("tabindex")).toBe("-1");
    expect(input).toHaveProperty("disabled", true);

    fireEvent.dragEnter(zone, dragPayload([]));
    fireEvent.drop(zone, dragPayload([makeFile("blocked.pdf")]));
    fireEvent.click(zone);
    fireEvent.keyDown(zone, { key: "Enter" });

    expect(zone.classList.contains("mw-filedrop--over")).toBe(false);
    expect(clickSpy).not.toHaveBeenCalled();
    expect(onFiles).not.toHaveBeenCalled();
  });
});
