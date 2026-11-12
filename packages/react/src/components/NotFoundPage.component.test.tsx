import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NotFoundPage from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("渲染厚霜 404 壳、AppLogo、标题、路径块并触发主次动作回调", () => {
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();

    const { container } = render(
      <NotFoundPage
        title="页面不存在"
        lead="链接可能已过期或地址输入有误。"
        tagline="AI，你的科研伙伴"
        path="/drafts/unknown"
        pathLabel="请求路径"
        primaryLabel="返回首页"
        secondaryLabel="返回上一页"
        onPrimary={onPrimary}
        onSecondary={onSecondary}
      />,
    );

    expect(container.querySelector(".mw-nf")).not.toBeNull();
    const card = container.querySelector(".mw-nf__card")!;
    expect(card.classList.contains("mw-frost")).toBe(true);
    expect(card.classList.contains("mw-frost--thick")).toBe(true);
    expect(container.querySelector("svg.mw-logo.mw-nf__logo")).not.toBeNull();
    expect(container.querySelector(".mw-nf__tagline")?.textContent).toBe(
      "AI，你的科研伙伴",
    );
    expect(container.querySelector(".mw-nf__code")?.textContent).toBe("404");
    expect(container.querySelector("h1.mw-nf__title")?.textContent).toBe(
      "页面不存在",
    );
    expect(container.querySelector(".mw-nf__lead")?.textContent).toBe(
      "链接可能已过期或地址输入有误。",
    );
    expect(container.querySelector(".mw-nf__path-label")?.textContent).toBe(
      "请求路径",
    );
    expect(container.querySelector(".mw-nf__path-value")?.textContent).toBe(
      "/drafts/unknown",
    );

    fireEvent.click(container.querySelector(".mw-btn-site")!);
    expect(onPrimary).toHaveBeenCalledTimes(1);

    fireEvent.click(container.querySelector(".mw-nf__btn--text")!);
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  it("省略可选属性时不渲染 tagline、path 与次动作按钮", () => {
    const { container } = render(
      <NotFoundPage
        title="Not Found"
        lead="Nothing here."
        primaryLabel="Go Home"
      />,
    );

    expect(container.querySelector(".mw-nf__tagline")).toBeNull();
    expect(container.querySelector(".mw-nf__path")).toBeNull();
    expect(container.querySelector(".mw-nf__btn--text")).toBeNull();
  });
});
