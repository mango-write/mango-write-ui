// @vitest-environment happy-dom
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, provide, ref } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CONFIRM_KEY, createConfirmStore } from "../../lib/confirm";
import Dialog from "../Dialog.vue";
import Tab from "../Tab.vue";
import TabList from "../TabList.vue";
import Tabs from "../Tabs.vue";
import AdminBoardPage from "./AdminBoardPage.vue";
import AdminBoardSection from "./AdminBoardSection.vue";
import AdminConfigPage from "./AdminConfigPage.vue";
import AdminConfigRow from "./AdminConfigRow.vue";
import AdminConfigSection from "./AdminConfigSection.vue";
import AdminDetailCard from "./AdminDetailCard.vue";
import AdminDetailPage from "./AdminDetailPage.vue";
import AdminListPage from "./AdminListPage.vue";
import AdminStatBar from "./AdminStatBar.vue";
import { ADMIN_HEADER_LEAD_TAKEN } from "./admin-defs";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("AdminListPage", () => {
  it("teleports primary actions into #admin-header-actions and orders filters, body, pagination", () => {
    const target = document.createElement("div");
    target.id = "admin-header-actions";
    document.body.appendChild(target);

    const wrapper = mount(AdminListPage, {
      attachTo: document.body,
      slots: {
        actions: '<button data-test="primary-action">新建</button>',
        filters: '<input data-test="search" />',
        default: '<div data-test="table">table</div>',
        pagination: '<div data-test="pagination">pagination</div>',
      },
    });

    expect(target.querySelector('[data-test="primary-action"]')).not.toBeNull();
    expect(wrapper.classes()).toContain("admin-list-page");
    const filters = wrapper.find(".admin-list-page__filters");
    const body = wrapper.find(".admin-list-page__body");
    const pagination = wrapper.find(".admin-list-page__pagination");
    expect(filters.exists()).toBe(true);
    expect(body.exists()).toBe(true);
    expect(pagination.exists()).toBe(true);
    expect(filters.element.compareDocumentPosition(body.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(body.element.compareDocumentPosition(pagination.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    wrapper.unmount();
  });

  it("renders inline header when teleport is false", () => {
    const wrapper = mount(AdminListPage, {
      props: { title: "订单管理", teleport: false },
      slots: {
        actions: '<button data-test="export">导出</button>',
        default: "<div>table</div>",
      },
    });
    expect(wrapper.find(".mw-admin-shell-header__title").text()).toBe("订单管理");
    expect(wrapper.find('[data-test="export"]').exists()).toBe(true);
  });
});

describe("AdminConfigPage, ConfigSection & ConfigRow", () => {
  it("disables save when dirtyCount is 0 and emits save directly when dirty without confirmMessage", async () => {
    const target = document.createElement("div");
    target.id = "admin-header-actions";
    document.body.appendChild(target);

    const wrapper = mount(AdminConfigPage, {
      attachTo: document.body,
      props: { dirtyCount: 0 },
      slots: {
        default: () =>
          h(AdminConfigSection, { title: "基础配置" }, () =>
            h(
              AdminConfigRow,
              { label: "最小改写段长", keyHint: "rewrite.min_paragraph_chars", hint: "更短的段落原样保留，不改写。" },
              () => h("input", { class: "mw-input", value: "30" }),
            ),
          ),
      },
    });

    await flushPromises();
    const btn = target.querySelector("button");
    expect(btn?.hasAttribute("disabled")).toBe(true);
    expect(target.textContent).not.toContain("未保存");
    expect(wrapper.find(".admin-config-section__title").text()).toBe("基础配置");
    expect(wrapper.find(".admin-config-row__label").text()).toBe("最小改写段长");
    expect(wrapper.find(".admin-config-row__hint").text()).toBe("更短的段落原样保留，不改写。");

    await wrapper.setProps({ dirtyCount: 2 });
    expect(target.textContent).toContain("2 项未保存");
    expect(btn?.hasAttribute("disabled")).toBe(false);
    btn?.click();
    expect(wrapper.emitted("save")).toHaveLength(1);
    wrapper.unmount();
  });

  it("requires confirmation via ConfirmStore before emitting save when confirmMessage is set", async () => {
    const confirmStore = createConfirmStore();
    const wrapper = mount(AdminConfigPage, {
      props: {
        dirtyCount: 1,
        teleport: false,
        title: "AI 角色配置",
        confirmMessage: "保存后所有 Rewrite 改写立即改用此模型。",
      },
      global: {
        provide: {
          [CONFIRM_KEY as symbol]: confirmStore,
        },
      },
    });

    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("save")).toBeUndefined();
    expect(confirmStore.queue.value).toHaveLength(1);
    expect(confirmStore.queue.value[0]?.request.message).toBe("保存后所有 Rewrite 改写立即改用此模型。");

    confirmStore.accept(confirmStore.queue.value[0]!.request.id);
    await flushPromises();
    expect(wrapper.emitted("save")).toHaveLength(1);
  });
});

describe("AdminDetailPage & StatCard", () => {
  it("takes over #admin-header-lead with back button and title, and releases on unmount", async () => {
    const lead = document.createElement("div");
    lead.id = "admin-header-lead";
    const actions = document.createElement("div");
    actions.id = "admin-header-actions";
    document.body.append(lead, actions);

    const leadTaken = ref(false);
    const onBack = vi.fn();
    const onCardAction = vi.fn();

    const Host = defineComponent({
      setup() {
        provide(ADMIN_HEADER_LEAD_TAKEN, leadTaken);
        return () =>
          h(
            AdminDetailPage,
            { showBack: true, backLabel: "返回用户列表", onBack },
            {
              title: () => h("span", { "data-test": "obj-title" }, "张三"),
              actions: () => h("button", { "data-test": "primary" }, "赠送积分"),
              cards: () =>
                h(AdminDetailCard, {
                  label: "当前积分",
                  value: "12,500",
                  sub: "有效期至 2027-01-01",
                  tone: "accent",
                  actionLabel: "调整",
                  onAction: onCardAction,
                }),
              default: () => h("div", { "data-test": "tabs" }, "明细内容"),
            },
          );
      },
    });

    const wrapper = mount(Host, { attachTo: document.body });
    await nextTick();

    expect(leadTaken.value).toBe(true);
    const backBtn = lead.querySelector('button[aria-label="返回用户列表"]') as HTMLButtonElement | null;
    expect(backBtn).not.toBeNull();
    backBtn?.click();
    expect(onBack).toHaveBeenCalledTimes(1);

    expect(lead.querySelector('[data-test="obj-title"]')?.textContent).toBe("张三");
    expect(actions.querySelector('[data-test="primary"]')?.textContent).toBe("赠送积分");
    expect(wrapper.find(".admin-detail-card").attributes("data-tone")).toBe("accent");
    expect(wrapper.find(".admin-detail-card__value").text()).toBe("12,500");
    await wrapper.find(".admin-detail-card__action").trigger("click");
    expect(onCardAction).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    expect(leadTaken.value).toBe(false);
  });
});

describe("AdminBoardPage, StatBar & AdminBoardSection", () => {
  it("renders KPI stat bar and board section with drill slot", () => {
    const wrapper = mount(AdminBoardPage, {
      props: { teleport: false, title: "数据看板" },
      slots: {
        actions: '<button data-test="range">近 7 天</button>',
        stats: () =>
          h(AdminStatBar, {
            items: [
              { key: "active", label: "活跃账号", value: "1,420", sub: "较上期 +12.4%", tone: "accent" },
              { key: "rev", label: "净实收 CNY", value: "¥48,200", sub: "Write ¥32,000 · Rewrite ¥16,200" },
            ],
          }),
        default: () =>
          h(
            AdminBoardSection,
            { title: "用户活跃与新增趋势" },
            {
              drill: () => h("a", { href: "#drill", "data-test": "drill" }, "查看明细"),
              default: () => h("div", { "data-test": "chart" }, "chart"),
            },
          ),
      },
    });

    expect(wrapper.findAll(".admin-stats__item")).toHaveLength(2);
    expect(wrapper.find(".admin-board-section__title").text()).toBe("用户活跃与新增趋势");
    expect(wrapper.find('[data-test="drill"]').exists()).toBe(true);
  });
});

describe("Tabs (Tab badge & TabList hideWhenSingle)", () => {
  it("renders Tab badge and applies mw-tab-list--hide-single when hideWhenSingle is true", () => {
    const wrapper = mount(Tabs, {
      props: { value: "write" },
      slots: {
        default: () =>
          h(TabList, { hideWhenSingle: true }, () => [
            h(Tab, { value: "write", badge: 12 }, () => "Write 订阅单"),
            h(Tab, { value: "rewrite", badge: "5" }, () => "Rewrite 充值单"),
          ]),
      },
    });

    expect(wrapper.find(".mw-tab-list").classes()).toContain("mw-tab-list--hide-single");
    const badges = wrapper.findAll(".mw-tab__badge");
    expect(badges).toHaveLength(2);
    expect(badges[0]?.text()).toBe("12");
  });
});

describe("Dialog (Tiered sizes, in-place drill-down & Scroll Mode Contracts)", () => {
  it("renders Dialog with size='xl', drill-down back button, scope strip, toolbar, split footer, and locked body class when bodyScroll is false", async () => {
    const onBack = vi.fn();
    const wrapper = mount(Dialog, {
      props: {
        open: true,
        appendTo: "self",
        size: "xl",
        title: "分群成员明细",
        canBack: true,
        backLabel: "返回分群汇总",
        scopeText: "2026-10-09 — 2026-11-07 · Write",
        bodyScroll: false,
        onBack,
      },
      slots: {
        "header-extra": '<span data-test="badge">Write</span>',
        scope: '<button data-test="clear-scope">清除过滤</button>',
        toolbar: '<div data-test="dialog-toolbar">固定筛选栏</div>',
        default: '<div class="mw-dialog-scroll" data-test="scroll-box">rows</div>',
        "footer-left": '<span data-test="footer-left">已选 3 项</span>',
        footer: '<button data-test="footer-save">保存</button>',
      },
    });

    await flushPromises();
    const backBtn = wrapper.find('button[aria-label="返回分群汇总"]');
    expect(backBtn.exists()).toBe(true);
    await backBtn.trigger("click");
    expect(onBack).toHaveBeenCalledTimes(1);

    expect(wrapper.find('[data-test="badge"]').exists()).toBe(true);
    expect(wrapper.find(".mw-dialog__scope-text").text()).toBe("2026-10-09 — 2026-11-07 · Write");
    expect(wrapper.find('[data-test="clear-scope"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="dialog-toolbar"]').exists()).toBe(true);
    expect(wrapper.find(".mw-dialog__lead").find('[data-test="dialog-toolbar"]').exists()).toBe(true);
    expect(wrapper.find(".mw-dialog--xl").exists()).toBe(true);
    expect(wrapper.find(".mw-dialog__body--locked").exists()).toBe(true);
    expect(wrapper.find('[data-test="footer-left"]').text()).toBe("已选 3 项");
    expect(wrapper.find('[data-test="footer-save"]').text()).toBe("保存");
  });

  it("separates fixed Page Chrome from the single Scrollable Data Plane across all four shells", () => {
    const list = mount(AdminListPage, {
      props: { title: "用户列表", teleport: false },
      slots: {
        summary: '<div data-test="list-summary">summary</div>',
        filters: '<div data-test="list-filters">filters</div>',
        default: '<div data-test="list-table">table</div>',
        pagination: '<div data-test="list-page">page</div>',
      },
    });
    expect(list.classes()).not.toContain("admin-panel--scrollable");
    expect(list.find(".admin-list-page__summary").exists()).toBe(true);
    expect(list.find(".admin-list-page__body").find('[data-test="list-filters"]').exists()).toBe(false);

    const detail = mount(AdminDetailPage, {
      props: { showBack: true, teleport: false },
      slots: {
        title: '<span data-test="detail-title">张三</span>',
        cards: '<div data-test="detail-cards">cards</div>',
        tabs: '<div data-test="detail-tabs">tabs</div>',
        default: '<div data-test="detail-data">data</div>',
      },
    });
    const detailBody = detail.find(".admin-detail-page__body");
    expect(detail.classes()).not.toContain("admin-panel--scrollable");
    expect(detailBody.classes()).toContain("admin-panel--scrollable");
    expect(detailBody.find('[data-test="detail-cards"]').exists()).toBe(false);
    expect(detailBody.find('[data-test="detail-tabs"]').exists()).toBe(false);
    expect(detailBody.find('[data-test="detail-data"]').exists()).toBe(true);

    const board = mount(AdminBoardPage, {
      props: { title: "数据看板", teleport: false },
      slots: {
        actions: '<button data-test="board-filter">近7天</button>',
        stats: '<div data-test="board-stats">stats</div>',
        default: '<div data-test="board-charts">charts</div>',
      },
    });
    const boardBody = board.find(".admin-board-page__body");
    expect(board.classes()).not.toContain("admin-panel--scrollable");
    expect(boardBody.classes()).toContain("admin-panel--scrollable");
    expect(boardBody.find('[data-test="board-filter"]').exists()).toBe(false);
    expect(boardBody.find('[data-test="board-stats"]').exists()).toBe(true);
    expect(boardBody.find('[data-test="board-charts"]').exists()).toBe(true);

    const config = mount(AdminConfigPage, {
      props: { title: "系统配置", dirtyCount: 1, teleport: false },
      slots: {
        toolbar: '<div data-test="config-toolbar">toolbar</div>',
        default: '<div data-test="config-sections">sections</div>',
      },
    });
    const configBody = config.find(".admin-config-page__body");
    expect(config.classes()).not.toContain("admin-panel--scrollable");
    expect(configBody.classes()).toContain("admin-panel--scrollable");
    expect(configBody.find('[data-test="config-toolbar"]').exists()).toBe(false);
    expect(configBody.find('[data-test="config-sections"]').exists()).toBe(true);
  });
});
