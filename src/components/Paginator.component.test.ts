import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import Paginator from "./Paginator.vue";
import type { PaginatorPageEvent } from "./data-table.js";

describe("Paginator", () => {
  it("正确渲染分页按钮、报告文案，并在切页与切换每页条数时发出 update:first / update:rows / page", async () => {
    const pageEvents: PaginatorPageEvent[] = [];
    const Host = defineComponent({
      setup() {
        const first = ref(0);
        const rows = ref(10);
        return () =>
          h(
            Paginator,
            {
              first: first.value,
              rows: rows.value,
              totalRecords: 95,
              rowsPerPageOptions: [10, 20, 50],
              currentPageReportTemplate:
                "{first} - {last} / {totalRecords} (Page {currentPage}/{totalPages})",
              "onUpdate:first": (v: number) => {
                first.value = v;
              },
              "onUpdate:rows": (v: number) => {
                rows.value = v;
              },
              onPage: (ev: PaginatorPageEvent) => {
                pageEvents.push(ev);
              },
            },
            {
              start: () => h("span", { "data-testid": "slot-start" }, "Start"),
              end: () => h("span", { "data-testid": "slot-end" }, "End"),
            },
          );
      },
    });

    const wrapper = mountUiComponent(Host);
    await nextTick();

    const root = wrapper.get(".mw-paginator");
    expect(root.attributes("aria-label")).toBe("Pagination");
    expect(wrapper.get('[data-testid="slot-start"]').text()).toBe("Start");
    expect(wrapper.get('[data-testid="slot-end"]').text()).toBe("End");

    const firstBtn = wrapper.get(".mw-paginator__first");
    const prevBtn = wrapper.get(".mw-paginator__prev");
    const nextBtn = wrapper.get(".mw-paginator__next");
    const lastBtn = wrapper.get(".mw-paginator__last");

    // 初始在第 1 页（page=0），首页/上一页禁用
    expect(firstBtn.attributes("disabled")).toBeDefined();
    expect(prevBtn.attributes("disabled")).toBeDefined();
    expect(nextBtn.attributes("disabled")).toBeUndefined();
    expect(lastBtn.attributes("disabled")).toBeUndefined();
    expect(wrapper.get(".mw-paginator__current").text()).toBe(
      "1 - 10 / 95 (Page 1/10)",
    );

    const pageBtns = wrapper.findAll(".mw-paginator__page");
    expect(pageBtns).toHaveLength(5);
    expect(pageBtns[0]!.attributes("aria-current")).toBe("page");
    expect(pageBtns[0]!.attributes("data-state")).toBe("active");

    // 点击第 3 页（page=2, first=20）
    await pageBtns[2]!.trigger("click");
    await nextTick();

    expect(pageEvents.at(-1)).toEqual({
      page: 2,
      first: 20,
      rows: 10,
      pageCount: 10,
    });
    expect(wrapper.get(".mw-paginator__current").text()).toBe(
      "21 - 30 / 95 (Page 3/10)",
    );
    expect(firstBtn.attributes("disabled")).toBeUndefined();
    expect(prevBtn.attributes("disabled")).toBeUndefined();

    // 点击末页（page=9, first=90）
    await lastBtn.trigger("click");
    await nextTick();

    expect(pageEvents.at(-1)).toEqual({
      page: 9,
      first: 90,
      rows: 10,
      pageCount: 10,
    });
    expect(wrapper.get(".mw-paginator__current").text()).toBe(
      "91 - 95 / 95 (Page 10/10)",
    );
    expect(nextBtn.attributes("disabled")).toBeDefined();
    expect(lastBtn.attributes("disabled")).toBeDefined();

    // 切换每页条数为 50，自动回到第一页
    const selectTrigger = wrapper.get(".mw-paginator__rpp");
    expect(selectTrigger.classes()).toContain("mw-select");
    await selectTrigger.trigger("click");
    await nextTick();
    const options = Array.from(document.body.querySelectorAll<HTMLElement>('[role="option"]'));
    const opt50 = options.find((el) => el.textContent?.trim() === "50");
    expect(opt50).toBeDefined();
    opt50!.click();
    await nextTick();

    expect(pageEvents.at(-1)).toEqual({
      page: 0,
      first: 0,
      rows: 50,
      pageCount: 2,
    });
    expect(wrapper.get(".mw-paginator__current").text()).toBe(
      "1 - 50 / 95 (Page 1/2)",
    );
  });

  it("支持 alwaysShow=false 在单页时自动隐藏，且 disabled 状态下禁止切页", async () => {
    const pageEvents: PaginatorPageEvent[] = [];
    const wrapper = mountUiComponent(Paginator, {
      props: {
        first: 0,
        rows: 20,
        totalRecords: 15,
        alwaysShow: false,
        onPage: (ev: PaginatorPageEvent) => pageEvents.push(ev),
      },
    });

    expect(wrapper.find(".mw-paginator").exists()).toBe(false);

    await wrapper.setProps({ totalRecords: 45, disabled: true });
    expect(wrapper.find(".mw-paginator").exists()).toBe(true);

    const nextBtn = wrapper.get(".mw-paginator__next");
    expect(nextBtn.attributes("disabled")).toBeDefined();
    await nextBtn.trigger("click");
    expect(pageEvents).toHaveLength(0);
  });
});
