import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import MpButton from "./components/MpButton.vue";
import MpCell from "./components/MpCell.vue";
import MpCellGroup from "./components/MpCellGroup.vue";
import MpEmpty from "./components/MpEmpty.vue";
import MpFilterBar from "./components/MpFilterBar.vue";
import MpFilterChip from "./components/MpFilterChip.vue";
import MpIcon from "./components/MpIcon.vue";
import MpInput from "./components/MpInput.vue";
import MpLoading from "./components/MpLoading.vue";
import MpNavBar from "./components/MpNavBar.vue";
import MpSearchBar from "./components/MpSearchBar.vue";
import MpSwitch from "./components/MpSwitch.vue";
import MpTabBar from "./components/MpTabBar.vue";
import MpTag from "./components/MpTag.vue";

describe("@mango-write/ui-mp primitives", () => {
  it("uses real navigation semantics and forwards public attributes", async () => {
    const nav = mount(MpNavBar, {
      props: { title: "编辑日志", showBack: true, capsuleWidth: 104 },
      attrs: { id: "editor-nav", "data-testid": "mp-nav" },
      slots: { trailing: "<button type='button'>更多</button>" },
    });
    expect(nav.attributes("id")).toBe("editor-nav");
    expect(nav.find(".mw-mp-navbar__bar").attributes("style")).toContain("104px");
    await nav.find('[data-testid="mp-nav-back"]').trigger("click");
    expect(nav.emitted("back")).toHaveLength(1);

    const tabs = mount(MpTabBar, {
      props: {
        modelValue: "journal",
        items: [
          { id: "journal", label: "日志", icon: "journal" },
          { id: "library", label: "文库", icon: "library" },
          { id: "assistant", label: "AI 助手", icon: "assistant" },
        ],
        contained: true,
      },
    });
    expect(tabs.classes()).toContain("mw-mp-tabbar--contained");
    expect(tabs.findAll(".mw-mp-badge")).toHaveLength(0);
    await tabs.find('[data-testid="mp-tab-library"]').trigger("click");
    expect(tabs.emitted("update:modelValue")?.[0]).toEqual(["library"]);
  });

  it("keeps button sizes honest and loading accessible", async () => {
    const button = mount(MpButton, {
      props: { label: "保存", size: "sm", loading: true },
      attrs: { id: "save-button", "aria-describedby": "save-hint" },
    });
    expect(button.classes()).toContain("mw-size-sm");
    expect(button.attributes("id")).toBe("save-button");
    expect(button.attributes("aria-describedby")).toBe("save-hint");
    expect(button.attributes("aria-busy")).toBe("true");
    expect(button.findComponent(MpIcon).props("name")).toBe("loading");
    await button.trigger("click");
    expect(button.emitted("click")).toBeUndefined();
  });

  it("clears input and search only when configured", async () => {
    const input = mount(MpInput, { props: { modelValue: "文献标题", clearable: true } });
    await input.find('[data-testid="mp-input-clear"]').trigger("click");
    expect(input.emitted("update:modelValue")?.[0]).toEqual([""]);
    expect(input.emitted("clear")).toHaveLength(1);
    await input.setProps({ clearable: false });
    expect(input.find('[data-testid="mp-input-clear"]').exists()).toBe(false);

    const search = mount(MpSearchBar, { props: { modelValue: "ColBERTv2", clearable: false } });
    expect(search.find('[data-testid="mp-search-clear"]').exists()).toBe(false);
    await search.find("input").trigger("keydown", { key: "Enter" });
    expect(search.emitted("search")?.[0]).toEqual(["ColBERTv2"]);
    await search.setProps({ clearable: true });
    await search.find('[data-testid="mp-search-clear"]').trigger("click");
    expect(search.emitted("update:modelValue")?.[0]).toEqual([""]);
  });

  it("does not emit model updates during composition", async () => {
    const input = mount(MpInput, { props: { modelValue: "" } });
    const field = input.find("input");
    await field.trigger("compositionstart");
    field.element.dispatchEvent(Object.assign(new Event("input"), { detail: { value: "中文" } }));
    expect(input.emitted("update:modelValue")).toBeUndefined();
    await field.trigger("compositionend", { detail: { value: "中文" } });
    expect(input.emitted("update:modelValue")?.[0]).toEqual(["中文"]);
  });

  it("separates static tags from selectable chips and filter bars", async () => {
    const tag = mount(MpTag, { props: { label: "实验记录" } });
    expect(tag.find("button").exists()).toBe(false);
    const chip = mount(MpFilterChip, { props: { label: "实验", selected: true } });
    expect(chip.attributes("aria-pressed")).toBe("true");
    const bar = mount(MpFilterBar, {
      props: { modelValue: "全部", items: [{ id: "全部", label: "全部" }, { id: "实验", label: "实验" }] },
    });
    await bar.find('[data-testid="mp-filter-实验"]').trigger("click");
    expect(bar.emitted("update:modelValue")?.[0]).toEqual(["实验"]);
  });

  it("uses distinct click and selection semantics with keyboard actions", async () => {
    const cell = mount(MpCell, { props: { title: "记录", selectable: true, selected: true } });
    expect(cell.attributes("role")).toBe("option");
    expect(cell.attributes("aria-selected")).toBe("true");
    await cell.trigger("keyup", { key: " " });
    expect(cell.emitted("click")).toHaveLength(1);
    const group = mount(MpCellGroup, { slots: { default: "<div>内容</div>" } });
    expect(group.classes()).not.toContain("mw-mp-cell-group--grouped");
  });

  it("renders real empty actions and independent loading feedback", () => {
    const empty = mount(MpEmpty, {
      props: { title: "暂无记录" },
      slots: { action: "<button type='button'>新建记录</button>" },
    });
    expect(empty.find(".mw-mp-empty__action").text()).toBe("新建记录");
    const loading = mount(MpLoading, { props: { label: "加载中" } });
    expect(loading.attributes("role")).toBe("status");
    expect(loading.findComponent(MpIcon).props("spin")).toBe(true);
  });

  it("toggles MpSwitch state with switch role and aria-checked", async () => {
    const sw = mount(MpSwitch, {
      props: { modelValue: false, ariaLabel: "深色外观" },
      attrs: { "data-testid": "mp-theme-toggle" },
    });
    expect(sw.attributes("role")).toBe("switch");
    expect(sw.attributes("aria-checked")).toBe("false");
    expect(sw.attributes("data-testid")).toBe("mp-theme-toggle");
    await sw.trigger("click");
    expect(sw.emitted("update:modelValue")?.[0]).toEqual([true]);
    expect(sw.emitted("change")?.[0]).toEqual([true]);
  });
});
