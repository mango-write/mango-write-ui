import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import UserChip from "./UserChip.vue";
import UserCard from "./UserCard.vue";
import { mountUiComponent } from "../test-utils/mount";

const user = {
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
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect() {}
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function openCard(wrapper: ReturnType<typeof mountUiComponent>) {
  await wrapper.find(".mw-hovercard").trigger("mouseenter");
  await vi.runAllTimersAsync();
  await nextTick();
}

describe("UserChip", () => {
  it("渲染文本、tag、person 和 avatar 变体", () => {
    const text = mountUiComponent(UserChip, { props: { user } });
    expect(text.find(".mw-user-chip__text").text()).toBe("@张三");

    const tag = mountUiComponent(UserChip, { props: { user, variant: "tag", size: "large" } });
    expect(tag.find(".mw-user-chip__tag").exists()).toBe(true);
    expect(tag.find(".mw-user-chip").classes()).toContain("mw-user-chip--size-large");

    const person = mountUiComponent(UserChip, { props: { user, variant: "person" } });
    expect(person.find(".mw-user-chip__person-name").text()).toBe("张三");

    const avatar = mountUiComponent(UserChip, { props: { user, variant: "avatar" } });
    expect(avatar.find(".mw-user-chip__avatar-only").exists()).toBe(true);
    expect(avatar.find(".mw-user-chip").attributes("aria-label")).toBe("张三");
  });

  it("showCard=false 不渲染信息卡或额外焦点入口", () => {
    const wrapper = mountUiComponent(UserChip, { props: { user, showCard: false } });
    expect(wrapper.find(".mw-user-chip").attributes("tabindex")).toBeUndefined();
    expect(document.querySelector(".mw-user-card")).toBeNull();
  });

  it("信息卡展示 handle、badge、角色和邮箱，Escape 关闭", async () => {
    const wrapper = mountUiComponent(UserChip, {
      props: { user, variant: "person" },
      attachTo: document.body,
      global: { stubs: { transition: false } },
    });
    await openCard(wrapper);

    const card = document.querySelector(".mw-user-card");
    expect(card?.textContent).toContain("zhang-san");
    expect(card?.textContent).not.toContain("u-zhang-san");
    expect(card?.querySelector(".mw-user-card__badge-tag")?.textContent).toBe("Pro");
    expect(card?.querySelector(".mw-user-card__role")?.textContent).toBe("共同作者");
    expect(card?.textContent).toContain("zhang.san@mango.write");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();
    expect(document.querySelector(".mw-user-card")).toBeNull();
  });

  it("无 id 和 badge 时不渲染对应行", async () => {
    const wrapper = mountUiComponent(UserChip, {
      props: { user: { name: "李四" }, variant: "person" },
      attachTo: document.body,
    });
    await openCard(wrapper);

    expect(document.querySelector(".mw-user-card__id")).toBeNull();
    expect(document.querySelector(".mw-user-card__badge-tag")).toBeNull();
  });

  it("href 使用原生链接，不需要 vue-router", () => {
    const wrapper = mountUiComponent(UserChip, {
      props: { user, variant: "person", href: "/users/u-zhang-san" },
    });
    const link = wrapper.find("a.mw-user-chip");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("/users/u-zhang-san");
    expect(link.attributes("tabindex")).toBeUndefined();
  });

  it("UserCard 支持静态大卡和扩展槽", () => {
    const wrapper = mountUiComponent(UserCard, {
      props: { user, size: "large" },
      slots: { "id-actions": '<button class="copy-id">复制</button>', card: '<p class="extra">扩展信息</p>' },
    });
    expect(wrapper.find(".mw-user-card--large").exists()).toBe(true);
    expect(wrapper.find(".copy-id").exists()).toBe(true);
    expect(wrapper.find(".extra").exists()).toBe(true);
  });
});
