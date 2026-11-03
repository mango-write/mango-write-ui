// NotFoundPage 契约：纯展示——文案/路径/按钮标签全部来自 props，动作只 emit，
// 不自己跳路由；path 缺省时不渲染路径块，secondaryLabel 缺省时不出次要按钮。
import { mountUiComponent } from "../test-utils/mount";
import { describe, expect, it } from "vitest";

import NotFoundPage from "./NotFoundPage.vue";

const base = {
  title: "页面不存在",
  lead: "你访问的页面不存在或已下线。",
  primaryLabel: "返回首页",
};

describe("NotFoundPage", () => {
  it("渲染标题、说明、路径与两个动作", () => {
    const wrapper = mountUiComponent(NotFoundPage, {
      props: {
        ...base,
        tagline: "芒果写作",
        path: "/en/nope?x=1",
        pathLabel: "请求路径",
        secondaryLabel: "返回上一页",
      },
    });

    expect(wrapper.get("h1").text()).toBe("页面不存在");
    expect(wrapper.text()).toContain("你访问的页面不存在或已下线。");
    expect(wrapper.get(".mw-nf__tagline").text()).toBe("芒果写作");
    expect(wrapper.get(".mw-nf__path-value").text()).toBe("/en/nope?x=1");
    expect(wrapper.get(".mw-nf__path-label").text()).toBe("请求路径");
    expect(wrapper.findAll(".mw-nf__btn")).toHaveLength(2);
  });

  it("动作只 emit，不自行导航", async () => {
    const wrapper = mountUiComponent(NotFoundPage, {
      props: { ...base, secondaryLabel: "返回上一页" },
    });

    const [primary, secondary] = wrapper.findAll(".mw-nf__btn");
    await primary.trigger("click");
    await secondary.trigger("click");

    expect(wrapper.emitted("primary")).toHaveLength(1);
    expect(wrapper.emitted("secondary")).toHaveLength(1);
  });

  it("无 path / secondaryLabel 时不渲染对应块", () => {
    const wrapper = mountUiComponent(NotFoundPage, { props: base });

    expect(wrapper.find(".mw-nf__path").exists()).toBe(false);
    expect(wrapper.find(".mw-nf__tagline").exists()).toBe(false);
    expect(wrapper.findAll(".mw-nf__btn")).toHaveLength(1);
  });
});
