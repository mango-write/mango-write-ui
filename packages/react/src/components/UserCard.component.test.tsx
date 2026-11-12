import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import UserCard, { type UserProfile } from "./UserCard";

const fullUser: UserProfile = {
  id: "u-zhang-san",
  handle: "zhang-san",
  name: "张三",
  avatar: null,
  email: "zhang.san@mango.write",
  badge: "Pro",
  role: "共同作者",
  description: "计算语言学实验室",
};

describe("UserCard", () => {
  it("优先展示 handle、首字母缩略、badge、角色、邮箱与简介", () => {
    const { container } = render(<UserCard user={fullUser} />);

    expect(container.querySelector(".mw-user-card__name")?.textContent).toBe("张三");
    expect(container.querySelector(".mw-avatar__label")?.textContent).toBe("张");
    expect(container.querySelector(".mw-user-card__id")?.textContent).toBe(
      "zhang-san",
    );
    expect(container.textContent).not.toContain("u-zhang-san");
    expect(
      container.querySelector(".mw-user-card__badge-tag")?.textContent,
    ).toBe("Pro");
    expect(container.querySelector(".mw-user-card__role")?.textContent).toBe(
      "共同作者",
    );
    expect(container.querySelector(".mw-user-card__email")?.textContent).toBe(
      "zhang.san@mango.write",
    );
    expect(
      container.querySelector(".mw-user-card__description")?.textContent,
    ).toBe("计算语言学实验室");
  });

  it("支持静态大卡、扩展动作区且缺省字段不渲染空行", () => {
    const largeView = render(
      <UserCard
        user={fullUser}
        size="large"
        nameActions={<button type="button" className="edit-name">编辑</button>}
        idActions={<button type="button" className="copy-id">复制</button>}
        card={({ user }) => <p className="extra">{user.name} 扩展区</p>}
      />,
    );

    expect(
      largeView.container.querySelector(".mw-user-card--large"),
    ).not.toBeNull();
    expect(largeView.container.querySelector(".edit-name")).not.toBeNull();
    expect(largeView.container.querySelector(".copy-id")).not.toBeNull();
    expect(largeView.container.querySelector(".extra")?.textContent).toBe(
      "张三 扩展区",
    );

    const minimalView = render(<UserCard user={{ name: "李四" }} />);
    expect(minimalView.container.querySelector(".mw-user-card__id")).toBeNull();
    expect(
      minimalView.container.querySelector(".mw-user-card__badge-tag"),
    ).toBeNull();
    expect(minimalView.container.querySelector(".mw-user-card__role")).toBeNull();
    expect(
      minimalView.container.querySelector(".mw-user-card__detail"),
    ).toBeNull();
  });
});
