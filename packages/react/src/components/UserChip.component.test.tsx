import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UserProfile } from "./UserCard";
import UserChip from "./UserChip";

const user: UserProfile = {
  id: "u-zhang-san",
  handle: "zhang-san",
  name: "张三",
  avatar: null,
  email: "zhang.san@mango.write",
  badge: "Pro",
  role: "共同作者",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", (callback: (time: number) => void) => {
    callback(0);
    return 0;
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function openHoverCard(container: HTMLElement) {
  const anchor = container.querySelector(".mw-hovercard")!;
  fireEvent.mouseEnter(anchor);
  act(() => {
    vi.advanceTimersByTime(200);
  });
}

describe("UserChip", () => {
  it("渲染 text、tag、person 和 avatar 四种变体", () => {
    const textView = render(<UserChip user={user} />);
    expect(
      textView.container.querySelector(".mw-user-chip__text")?.textContent,
    ).toBe("@张三");

    const tagView = render(
      <UserChip user={user} variant="tag" size="large" />,
    );
    expect(tagView.container.querySelector(".mw-user-chip__tag")).not.toBeNull();
    expect(
      tagView.container
        .querySelector(".mw-user-chip")!
        .classList.contains("mw-user-chip--size-large"),
    ).toBe(true);
    expect(
      tagView.container
        .querySelector(".mw-user-chip")!
        .classList.contains("mw-size-lg"),
    ).toBe(true);

    const personView = render(<UserChip user={user} variant="person" />);
    expect(
      personView.container.querySelector(".mw-user-chip__person-name")
        ?.textContent,
    ).toBe("张三");

    const avatarView = render(<UserChip user={user} variant="avatar" />);
    expect(
      avatarView.container.querySelector(".mw-user-chip__avatar-only"),
    ).not.toBeNull();
    expect(
      avatarView.container.querySelector(".mw-user-chip")?.getAttribute("aria-label"),
    ).toBe("张三");
  });

  it("showCard=false 时不渲染信息卡或额外焦点入口", () => {
    const { container } = render(<UserChip user={user} showCard={false} />);
    expect(
      container.querySelector(".mw-user-chip")?.hasAttribute("tabindex"),
    ).toBe(false);
    openHoverCard(container);
    expect(document.querySelector(".mw-user-card")).toBeNull();
  });

  it("悬停展开 UserCard 展示 handle、badge、角色与邮箱，Escape 关闭", () => {
    const { container } = render(<UserChip user={user} variant="person" />);
    openHoverCard(container);

    const card = document.querySelector(".mw-user-card")!;
    expect(card).not.toBeNull();
    expect(card.textContent).toContain("zhang-san");
    expect(card.textContent).not.toContain("u-zhang-san");
    expect(card.querySelector(".mw-user-card__badge-tag")?.textContent).toBe(
      "Pro",
    );
    expect(card.querySelector(".mw-user-card__role")?.textContent).toBe(
      "共同作者",
    );
    expect(card.textContent).toContain("zhang.san@mango.write");

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(document.querySelector(".mw-user-card")).toBeNull();
  });

  it("href 使用原生 <a> 链接且不重复注入 tabindex", () => {
    const { container } = render(
      <UserChip user={user} variant="person" href="/users/u-zhang-san" />,
    );
    const link = container.querySelector("a.mw-user-chip")!;
    expect(link).not.toBeNull();
    expect(link.getAttribute("href")).toBe("/users/u-zhang-san");
    expect(link.hasAttribute("tabindex")).toBe(false);
  });
});
