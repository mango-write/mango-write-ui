import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmProvider, createConfirmStore } from "../../lib/confirm";
import { AdminBoardPage } from "./AdminBoardPage";
import { AdminBoardSection } from "./AdminBoardSection";
import { AdminConfigPage } from "./AdminConfigPage";
import { AdminConfigRow, ConfigRow } from "./AdminConfigRow";
import { AdminConfigSection, ConfigSection } from "./AdminConfigSection";
import { AdminDetailCard, StatCard } from "./AdminDetailCard";
import { AdminDetailPage } from "./AdminDetailPage";
import { AdminListPage } from "./AdminListPage";
import { AdminStatBar, StatBar } from "./AdminStatBar";
import { ADMIN_HEADER_LEAD_TAKEN } from "./admin-defs";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("AdminListPage", () => {
  it("portals primary actions into #admin-header-actions and orders filters, body, pagination", () => {
    const target = document.createElement("div");
    target.id = "admin-header-actions";
    document.body.appendChild(target);

    const { container, unmount } = render(
      <AdminListPage
        actions={
          <button type="button" data-test="primary-action">
            新建
          </button>
        }
        filters={<input data-test="search" />}
        pagination={<div data-test="pagination">pagination</div>}
      >
        <div data-test="table">table</div>
      </AdminListPage>,
    );

    expect(target.querySelector('[data-test="primary-action"]')).not.toBeNull();
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains("admin-list-page")).toBe(true);
    const filters = container.querySelector(".admin-list-page__filters")!;
    const body = container.querySelector(".admin-list-page__body")!;
    const pagination = container.querySelector(".admin-list-page__pagination")!;
    expect(filters).not.toBeNull();
    expect(body).not.toBeNull();
    expect(pagination).not.toBeNull();
    expect(
      filters.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      body.compareDocumentPosition(pagination) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    unmount();
  });

  it("renders inline header when teleport is false", () => {
    const { container } = render(
      <AdminListPage
        title="订单管理"
        teleport={false}
        actions={
          <button type="button" data-test="export">
            导出
          </button>
        }
      >
        <div>table</div>
      </AdminListPage>,
    );
    expect(container.querySelector(".mw-admin-shell-header__title")?.textContent).toBe(
      "订单管理",
    );
    expect(container.querySelector('[data-test="export"]')).not.toBeNull();
  });
});

describe("AdminConfigPage, ConfigSection & ConfigRow", () => {
  it("disables save when dirtyCount is 0, emits onSave when dirty, and provides keyHint tooltip", async () => {
    vi.useFakeTimers();
    const target = document.createElement("div");
    target.id = "admin-header-actions";
    document.body.appendChild(target);
    const onSave = vi.fn();

    const { container, rerender, unmount } = render(
      <AdminConfigPage dirtyCount={0} onSave={onSave}>
        <ConfigSection title="基础配置">
          <ConfigRow
            label="最小改写段长"
            keyHint="rewrite.min_paragraph_chars"
            hint="更短的段落原样保留，不改写。"
            status="生效中"
            statusTone="success"
          >
            <input className="mw-input" defaultValue="30" />
          </ConfigRow>
        </ConfigSection>
      </AdminConfigPage>,
    );

    const btn = target.querySelector("button");
    expect(btn?.hasAttribute("disabled")).toBe(true);
    expect(target.textContent).not.toContain("未保存");
    expect(container.querySelector(".admin-config-section__title")?.textContent).toBe(
      "基础配置",
    );
    const rowLabel = container.querySelector(
      ".admin-config-row__label",
    ) as HTMLElement;
    expect(rowLabel.textContent).toBe("最小改写段长");
    expect(rowLabel.getAttribute("title")).toBe("rewrite.min_paragraph_chars");
    expect(container.querySelector(".admin-config-row__hint")?.textContent).toBe(
      "更短的段落原样保留，不改写。",
    );
    expect(
      container.querySelector(".admin-config-row__status")?.getAttribute("data-tone"),
    ).toBe("success");

    // Hover keyHint label -> renders Tooltip portal
    fireEvent.mouseEnter(rowLabel);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toBe(
      "rewrite.min_paragraph_chars",
    );
    fireEvent.mouseLeave(rowLabel);

    rerender(
      <AdminConfigPage dirtyCount={2} onSave={onSave}>
        <AdminConfigSection title="基础配置">
          <AdminConfigRow label="最小改写段长">
            <input className="mw-input" defaultValue="30" />
          </AdminConfigRow>
        </AdminConfigSection>
      </AdminConfigPage>,
    );
    expect(target.textContent).toContain("2 项未保存");
    expect(btn?.hasAttribute("disabled")).toBe(false);
    fireEvent.click(btn!);
    expect(onSave).toHaveBeenCalledTimes(1);

    unmount();
    vi.useRealTimers();
  });

  it("requires confirmation via ConfirmStore before emitting onSave when confirmMessage is set", async () => {
    const confirmStore = createConfirmStore();
    const onSave = vi.fn();

    const { container } = render(
      <ConfirmProvider store={confirmStore}>
        <AdminConfigPage
          dirtyCount={1}
          teleport={false}
          title="AI 角色配置"
          confirmMessage="保存后所有 Rewrite 改写立即改用此模型。"
          onSave={onSave}
        />
      </ConfirmProvider>,
    );

    fireEvent.click(container.querySelector("button")!);
    expect(onSave).not.toHaveBeenCalled();
    expect(confirmStore.queue).toHaveLength(1);
    expect(confirmStore.queue[0]?.request.message).toBe(
      "保存后所有 Rewrite 改写立即改用此模型。",
    );

    await act(async () => {
      confirmStore.accept(confirmStore.queue[0]!.request.id);
    });
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});

describe("AdminDetailPage & StatCard", () => {
  it("takes over #admin-header-lead with back button and title, and releases on unmount", () => {
    const lead = document.createElement("div");
    lead.id = "admin-header-lead";
    const actions = document.createElement("div");
    actions.id = "admin-header-actions";
    document.body.append(lead, actions);

    const leadTaken = { value: false };
    const onBack = vi.fn();
    const onCardAction = vi.fn();

    const { container, unmount } = render(
      <ADMIN_HEADER_LEAD_TAKEN.Provider value={leadTaken}>
        <AdminDetailPage
          showBack
          backLabel="返回用户列表"
          onBack={onBack}
          title={<span data-test="obj-title">张三</span>}
          actions={
            <button type="button" data-test="primary">
              赠送积分
            </button>
          }
          cards={
            <StatCard
              label="当前积分"
              value="12,500"
              sub="有效期至 2027-01-01"
              tone="accent"
              actionLabel="调整"
              onAction={onCardAction}
            />
          }
        >
          <div data-test="tabs">明细内容</div>
        </AdminDetailPage>
      </ADMIN_HEADER_LEAD_TAKEN.Provider>,
    );

    expect(leadTaken.value).toBe(true);
    const backBtn = lead.querySelector(
      'button[aria-label="返回用户列表"]',
    ) as HTMLButtonElement | null;
    expect(backBtn).not.toBeNull();
    fireEvent.click(backBtn!);
    expect(onBack).toHaveBeenCalledTimes(1);

    expect(lead.querySelector('[data-test="obj-title"]')?.textContent).toBe("张三");
    expect(actions.querySelector('[data-test="primary"]')?.textContent).toBe(
      "赠送积分",
    );
    expect(
      container.querySelector(".admin-detail-card")?.getAttribute("data-tone"),
    ).toBe("accent");
    expect(container.querySelector(".admin-detail-card__value")?.textContent).toBe(
      "12,500",
    );
    fireEvent.click(container.querySelector(".admin-detail-card__action")!);
    expect(onCardAction).toHaveBeenCalledTimes(1);

    unmount();
    expect(leadTaken.value).toBe(false);
  });
});

describe("AdminBoardPage, StatBar & AdminBoardSection", () => {
  it("renders KPI stat bar and board section with drill slot, and separates fixed Page Chrome from the single Scrollable Data Plane across all four shells", () => {
    const { container: boardContainer } = render(
      <AdminBoardPage
        teleport={false}
        title="数据看板"
        actions={
          <button type="button" data-test="board-filter">
            近 7 天
          </button>
        }
        stats={
          <StatBar
            items={[
              {
                key: "active",
                label: "活跃账号",
                value: "1,420",
                sub: "较上期 +12.4%",
                tone: "accent",
              },
              {
                key: "rev",
                label: "净实收 CNY",
                value: "¥48,200",
                sub: "Write ¥32,000 · Rewrite ¥16,200",
              },
            ]}
          />
        }
      >
        <AdminBoardSection
          title="用户活跃与新增趋势"
          drill={
            <a href="#drill" data-test="drill">
              查看明细
            </a>
          }
        >
          <div data-test="board-charts">chart</div>
        </AdminBoardSection>
      </AdminBoardPage>,
    );

    expect(boardContainer.querySelectorAll(".admin-stats__item")).toHaveLength(2);
    expect(
      boardContainer.querySelector(".admin-board-section__title")?.textContent,
    ).toBe("用户活跃与新增趋势");
    expect(boardContainer.querySelector('[data-test="drill"]')).not.toBeNull();

    const boardRoot = boardContainer.firstElementChild as HTMLElement;
    const boardBody = boardContainer.querySelector(
      ".admin-board-page__body",
    ) as HTMLElement;
    expect(boardRoot.classList.contains("admin-panel--scrollable")).toBe(false);
    expect(boardBody.classList.contains("admin-panel--scrollable")).toBe(true);
    expect(boardBody.querySelector('[data-test="board-filter"]')).toBeNull();
    expect(boardBody.querySelector('[data-test="board-charts"]')).not.toBeNull();

    const { container: listContainer } = render(
      <AdminListPage
        title="用户列表"
        teleport={false}
        summary={<div data-test="list-summary">summary</div>}
        filters={<div data-test="list-filters">filters</div>}
        pagination={<div data-test="list-page">page</div>}
      >
        <div data-test="list-table">table</div>
      </AdminListPage>,
    );
    expect(
      listContainer.firstElementChild?.classList.contains("admin-panel--scrollable"),
    ).toBe(false);
    expect(listContainer.querySelector(".admin-list-page__summary")).not.toBeNull();
    expect(
      listContainer
        .querySelector(".admin-list-page__body")
        ?.querySelector('[data-test="list-filters"]'),
    ).toBeNull();

    const { container: detailContainer } = render(
      <AdminDetailPage
        showBack
        teleport={false}
        title={<span data-test="detail-title">张三</span>}
        cards={<div data-test="detail-cards">cards</div>}
        tabs={<div data-test="detail-tabs">tabs</div>}
      >
        <div data-test="detail-data">data</div>
      </AdminDetailPage>,
    );
    const detailBody = detailContainer.querySelector(
      ".admin-detail-page__body",
    ) as HTMLElement;
    expect(
      detailContainer.firstElementChild?.classList.contains("admin-panel--scrollable"),
    ).toBe(false);
    expect(detailBody.classList.contains("admin-panel--scrollable")).toBe(true);
    expect(detailBody.querySelector('[data-test="detail-cards"]')).toBeNull();
    expect(detailBody.querySelector('[data-test="detail-tabs"]')).toBeNull();
    expect(detailBody.querySelector('[data-test="detail-data"]')).not.toBeNull();

    const { container: configContainer } = render(
      <AdminConfigPage
        title="系统配置"
        dirtyCount={1}
        teleport={false}
        toolbar={<div data-test="config-toolbar">toolbar</div>}
      >
        <div data-test="config-sections">sections</div>
      </AdminConfigPage>,
    );
    const configBody = configContainer.querySelector(
      ".admin-config-page__body",
    ) as HTMLElement;
    expect(
      configContainer.firstElementChild?.classList.contains("admin-panel--scrollable"),
    ).toBe(false);
    expect(configBody.classList.contains("admin-panel--scrollable")).toBe(true);
    expect(configBody.querySelector('[data-test="config-toolbar"]')).toBeNull();
    expect(configBody.querySelector('[data-test="config-sections"]')).not.toBeNull();

    // Verify AdminStatBar and AdminDetailCard primary exports match aliases
    expect(AdminStatBar).toBe(StatBar);
    expect(AdminDetailCard).toBe(StatCard);
  });
});
