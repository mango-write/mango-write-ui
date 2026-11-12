import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Avatar from "./Avatar";

describe("Avatar", () => {
  it("渲染 label、icon、自定义 children 及 shape/size 类名", () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();

    const { container } = render(
      <Avatar
        label="张"
        shape="circle"
        size="large"
        ariaLabel="张三"
        onClick={onClick}
        onKeyDown={onKeyDown}
      />,
    );

    const root = container.querySelector(".mw-avatar")!;
    expect(root.classList.contains("mw-avatar--circle")).toBe(true);
    expect(root.classList.contains("mw-avatar--large")).toBe(true);
    expect(root.classList.contains("mw-size-lg")).toBe(true);
    expect(root.getAttribute("aria-label")).toBe("张三");
    expect(container.querySelector(".mw-avatar__label")?.textContent).toBe("张");

    fireEvent.click(root);
    fireEvent.keyDown(root, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);

    function CustomIcon({ className }: { className?: string }) {
      return <svg className={`avatar-svg ${className ?? ""}`} />;
    }

    const iconView = render(<Avatar icon={CustomIcon} size="xlarge" />);
    expect(iconView.container.querySelector(".avatar-svg")).not.toBeNull();
    expect(
      iconView.container.querySelector(".mw-avatar")!.classList.contains("mw-avatar--xlarge"),
    ).toBe(true);
  });

  it("image 加载失败时触发 onError 并自动回退到 label 或 icon，更换 image 后恢复", () => {
    const onError = vi.fn();
    const { container, rerender } = render(
      <Avatar
        image="https://example.com/broken.png"
        label="M"
        shape="circle"
        onError={onError}
      />,
    );

    const img = container.querySelector("img.mw-avatar__image")!;
    expect(img).not.toBeNull();
    expect(container.querySelector(".mw-avatar")!.classList.contains("mw-avatar--image")).toBe(
      true,
    );

    fireEvent.error(img);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(container.querySelector("img.mw-avatar__image")).toBeNull();
    expect(container.querySelector(".mw-avatar__label")?.textContent).toBe("M");
    expect(container.querySelector(".mw-avatar")!.classList.contains("mw-avatar--image")).toBe(
      false,
    );

    rerender(
      <Avatar
        image="https://example.com/recovered.png"
        label="M"
        shape="circle"
        onError={onError}
      />,
    );
    expect(container.querySelector("img.mw-avatar__image")?.getAttribute("src")).toBe(
      "https://example.com/recovered.png",
    );
  });
});
