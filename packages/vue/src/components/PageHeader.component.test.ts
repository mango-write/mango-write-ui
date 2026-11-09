import { describe, expect, it } from "vitest";

import PageHeader from "./PageHeader.vue";
import { mountUiComponent } from "../test-utils/mount";

describe("PageHeader", () => {
  it("渲染标题", () => {
    const wrapper = mountUiComponent(PageHeader, { props: { title: "问卷" } });
    expect(wrapper.find("h1").text()).toBe("问卷");
  });

  it("icon 与 actions 插槽按需渲染", () => {
    const bare = mountUiComponent(PageHeader, { props: { title: "手记" } });
    expect(bare.find(".mw-page-header__icon").exists()).toBe(false);

    const full = mountUiComponent(PageHeader, {
      props: { title: "手记" },
      slots: { icon: '<i class="demo-icon" />', actions: '<button class="demo-action">新建</button>' },
    });
    expect(full.find(".demo-icon").exists()).toBe(true);
    expect(full.find(".demo-action").exists()).toBe(true);
  });
});
