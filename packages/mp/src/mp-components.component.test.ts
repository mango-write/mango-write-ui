import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import MpBackButton from "./components/MpBackButton.vue";
import MpButton from "./components/MpButton.vue";
import MpCell from "./components/MpCell.vue";
import MpCellGroup from "./components/MpCellGroup.vue";
import MpEmpty from "./components/MpEmpty.vue";
import MpFilterBar from "./components/MpFilterBar.vue";
import MpFilterChip from "./components/MpFilterChip.vue";
import MpIcon from "./components/MpIcon.vue";
import MpInput from "./components/MpInput.vue";
import MpLoading from "./components/MpLoading.vue";
import MpPageHeader from "./components/MpPageHeader.vue";
import MpSearchBar from "./components/MpSearchBar.vue";
import MpSwitch from "./components/MpSwitch.vue";
import MpTabBar from "./components/MpTabBar.vue";
import MpTag from "./components/MpTag.vue";
import MpThemeProvider from "./components/MpThemeProvider.vue";

describe("@mango-write/ui-mp primitives", () => {
  it("uses floating back button, page header eyebrow, and single-rail tabbar choreography", async () => {
    const back = mount(MpBackButton, {
      props: { contained: true, ariaLabel: "返回上级" },
      attrs: { id: "editor-back" },
    });
    expect(back.attributes("id")).toBe("editor-back");
    expect(back.attributes("data-testid")).toBe("mp-nav-back");
    expect(back.classes()).toContain("mw-frost");
    expect(back.classes()).toContain("mw-mp-back-btn--contained");
    await back.trigger("click");
    expect(back.emitted("click")).toHaveLength(1);

    const header = mount(MpPageHeader, {
      props: { title: "科研日志", description: "个人空间", capsuleSafe: true },
      slots: {
        eyebrow: "<button id='space-chip' type='button'>个人空间</button>",
        trailing: "<span id='header-extra'>3 条</span>",
      },
    });
    expect(header.classes()).toContain("mw-mp-page-header--capsule-safe");
    expect(header.find(".mw-mp-page-header__eyebrow #space-chip").exists()).toBe(true);
    expect(header.find(".mw-mp-page-header__trailing #header-extra").exists()).toBe(true);

    const items = [
      { id: "journal", label: "日志", icon: "journal" as const },
      { id: "library", label: "文库", icon: "library" as const },
      { id: "assistant", label: "AI 助手", icon: "assistant" as const },
    ];
    const tabs = mount(MpTabBar, {
      props: {
        modelValue: "journal",
        items,
        contained: true,
      },
      slots: {
        action: "<button id='quick-add' type='button'>新建</button>",
        composer: "<div id='inline-composer'>输入</div>",
      },
    });
    expect(tabs.classes()).toContain("mw-mp-tabbar--contained");
    expect(tabs.classes()).toContain("mw-mp-tabbar-rail--split");
    expect(tabs.find("#quick-add").exists()).toBe(true);
    expect(tabs.find("#inline-composer").exists()).toBe(true);
    expect(tabs.find(".mw-mp-tabbar-rail__action").classes()).not.toContain("mw-mp-tabbar-rail__slot--hidden");
    expect(tabs.find(".mw-mp-tabbar-rail__composer").classes()).toContain("mw-mp-tabbar-rail__slot--hidden");
    expect(tabs.find(".mw-mp-tabbar-rail__composer").attributes("aria-hidden")).toBe("true");
    expect(tabs.find(".mw-mp-tabbar__indicator").attributes("style")).toContain("translateX(0%)");
    expect(tabs.findAll(".mw-mp-badge")).toHaveLength(0);
    await tabs.find('[data-testid="mp-tab-library"]').trigger("click");
    expect(tabs.emitted("update:modelValue")?.[0]).toEqual(["library"]);
    await tabs.setProps({ modelValue: "library", hasAction: false });
    expect(tabs.find(".mw-mp-tabbar__indicator").attributes("style")).toContain("translateX(100%)");
    expect(tabs.classes()).not.toContain("mw-mp-tabbar-rail--has-action");
    expect(tabs.find(".mw-mp-tabbar-rail__side").classes()).toContain("mw-mp-tabbar-rail__side--empty");
    expect(tabs.find(".mw-mp-tabbar-rail__action").classes()).toContain("mw-mp-tabbar-rail__slot--hidden");

    await tabs.setProps({ collapsed: true, hasAction: true });
    expect(tabs.classes()).toContain("mw-mp-tabbar-rail--collapsed");
    expect(tabs.find(".mw-mp-tabbar").classes()).toContain("mw-mp-tabbar--collapsed");
    expect(tabs.find("#inline-composer").exists()).toBe(true);
    expect(tabs.find("#quick-add").exists()).toBe(true);
    expect(tabs.find(".mw-mp-tabbar-rail__composer").classes()).not.toContain("mw-mp-tabbar-rail__slot--hidden");
    expect(tabs.find(".mw-mp-tabbar-rail__action").classes()).toContain("mw-mp-tabbar-rail__slot--hidden");
    expect(tabs.find(".mw-mp-tabbar-rail__action").attributes("aria-hidden")).toBe("true");
    await tabs.find('[data-testid="mp-tabbar-expand"]').trigger("click");
    expect(tabs.emitted("update:collapsed")?.[0]).toEqual([false]);
  });

  it("aligns button variants, severities, and fluid width with desktop Button while keeping loading accessible", async () => {
    const button = mount(MpButton, {
      props: { label: "保存", size: "sm", fluid: true, loading: true },
      attrs: { id: "save-button", "aria-describedby": "save-hint" },
    });
    expect(button.classes()).toContain("mw-size-sm");
    expect(button.classes()).toContain("mw-mp-btn--filled");
    expect(button.classes()).toContain("mw-mp-btn--primary");
    expect(button.classes()).toContain("mw-mp-btn--fluid");
    expect(button.attributes("id")).toBe("save-button");
    expect(button.attributes("aria-describedby")).toBe("save-hint");
    expect(button.attributes("aria-busy")).toBe("true");
    expect(button.findComponent(MpIcon).props("name")).toBe("loading");
    await button.trigger("click");
    expect(button.emitted("click")).toBeUndefined();

    const secondary = mount(MpButton, { props: { label: "取消", severity: "secondary", outlined: true } });
    expect(secondary.classes()).toContain("mw-mp-btn--outlined");
    expect(secondary.classes()).toContain("mw-mp-btn--secondary");

    const warnBtn = mount(MpButton, { props: { label: "注意", severity: "warn" } });
    expect(warnBtn.classes()).toContain("mw-mp-btn--filled");
    expect(warnBtn.classes()).toContain("mw-mp-btn--warning");
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
    const tag = mount(MpTag, { props: { value: "实验记录", severity: "info" } });
    expect(tag.find("button").exists()).toBe(false);
    expect(tag.classes()).toContain("mw-mp-tag--info");
    expect(tag.text()).toBe("实验记录");
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
    expect(group.classes()).toContain("mw-mp-cell-group--grouped");
    const flushGroup = mount(MpCellGroup, { props: { flush: true }, slots: { default: "<div>内容</div>" } });
    expect(flushGroup.classes()).toContain("mw-mp-cell-group--flush");
    expect(flushGroup.classes()).not.toContain("mw-mp-cell-group--grouped");
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

  it("normalizes bare zero offsets in MpThemeProvider to 0px for CSS calc() safety", () => {
    const provider = mount(MpThemeProvider, {
      props: { safeTop: "0", safeBottom: "0", keyboardOffset: "0" },
      slots: { default: "<div>content</div>" },
    });
    const style = provider.attributes("style") ?? "";
    expect(style).toContain("--mw-mp-safe-top: 0px");
    expect(style).toContain("--mw-mp-safe-bottom: 0px");
    expect(style).toContain("--mw-mp-keyboard-offset: 0px");
  });
});
