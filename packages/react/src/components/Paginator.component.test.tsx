import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Paginator } from "./Paginator";
import type { PaginatorPageEvent } from "./data-table";

describe("Paginator", () => {
  it("renders pagination buttons and report text, and emits onFirstChange / onRowsChange / onPage on page and page-size changes", async () => {
    const user = userEvent.setup();
    const pageEvents: PaginatorPageEvent[] = [];

    function Host() {
      const [first, setFirst] = useState(0);
      const [rows, setRows] = useState(10);
      return (
        <Paginator
          first={first}
          rows={rows}
          totalRecords={95}
          rowsPerPageOptions={[10, 20, 50]}
          currentPageReportTemplate="{first} - {last} / {totalRecords} (Page {currentPage}/{totalPages})"
          start={<span data-testid="slot-start">Start</span>}
          end={<span data-testid="slot-end">End</span>}
          onFirstChange={setFirst}
          onRowsChange={setRows}
          onPage={(ev) => pageEvents.push(ev)}
        />
      );
    }

    const { container } = render(<Host />);

    const root = container.querySelector(".mw-paginator")!;
    expect(root.getAttribute("aria-label")).toBe("Pagination");
    expect(screen.getByTestId("slot-start").textContent).toBe("Start");
    expect(screen.getByTestId("slot-end").textContent).toBe("End");

    const firstBtn = container.querySelector<HTMLButtonElement>(
      ".mw-paginator__first",
    )!;
    const prevBtn = container.querySelector<HTMLButtonElement>(
      ".mw-paginator__prev",
    )!;
    const nextBtn = container.querySelector<HTMLButtonElement>(
      ".mw-paginator__next",
    )!;
    const lastBtn = container.querySelector<HTMLButtonElement>(
      ".mw-paginator__last",
    )!;

    expect(firstBtn.disabled).toBe(true);
    expect(prevBtn.disabled).toBe(true);
    expect(nextBtn.disabled).toBe(false);
    expect(lastBtn.disabled).toBe(false);
    expect(container.querySelector(".mw-paginator__current")?.textContent).toBe(
      "1 - 10 / 95 (Page 1/10)",
    );

    const pageBtns = container.querySelectorAll<HTMLButtonElement>(
      ".mw-paginator__page",
    );
    expect(pageBtns).toHaveLength(5);
    expect(pageBtns[0]!.getAttribute("aria-current")).toBe("page");
    expect(pageBtns[0]!.getAttribute("data-state")).toBe("active");

    // Click Page 3 (page=2, first=20)
    await user.click(pageBtns[2]!);

    expect(pageEvents.at(-1)).toEqual({
      page: 2,
      first: 20,
      rows: 10,
      pageCount: 10,
    });
    expect(container.querySelector(".mw-paginator__current")?.textContent).toBe(
      "21 - 30 / 95 (Page 3/10)",
    );
    expect(firstBtn.disabled).toBe(false);
    expect(prevBtn.disabled).toBe(false);

    // Click Last Page (page=9, first=90)
    await user.click(lastBtn);

    expect(pageEvents.at(-1)).toEqual({
      page: 9,
      first: 90,
      rows: 10,
      pageCount: 10,
    });
    expect(container.querySelector(".mw-paginator__current")?.textContent).toBe(
      "91 - 95 / 95 (Page 10/10)",
    );
    expect(nextBtn.disabled).toBe(true);
    expect(lastBtn.disabled).toBe(true);

    // Switch rows per page to 50 via ./Select -> resets to first page
    const selectTrigger = container.querySelector<HTMLElement>(
      ".mw-paginator__rpp",
    )!;
    expect(selectTrigger.classList.contains("mw-select")).toBe(true);
    await user.click(selectTrigger);

    const options = Array.from(
      document.body.querySelectorAll<HTMLElement>('[role="option"]'),
    );
    const opt50 = options.find((el) => el.textContent?.trim() === "50");
    expect(opt50).toBeDefined();
    await user.click(opt50!);

    expect(pageEvents.at(-1)).toEqual({
      page: 0,
      first: 0,
      rows: 50,
      pageCount: 2,
    });
    expect(container.querySelector(".mw-paginator__current")?.textContent).toBe(
      "1 - 50 / 95 (Page 1/2)",
    );
  });

  it("hides automatically when alwaysShow=false on single page and blocks navigation when disabled", () => {
    const pageEvents: PaginatorPageEvent[] = [];
    const { container, rerender } = render(
      <Paginator
        first={0}
        rows={20}
        totalRecords={15}
        alwaysShow={false}
        onPage={(ev) => pageEvents.push(ev)}
      />,
    );

    expect(container.querySelector(".mw-paginator")).toBeNull();

    rerender(
      <Paginator
        first={0}
        rows={20}
        totalRecords={45}
        alwaysShow={false}
        disabled
        onPage={(ev) => pageEvents.push(ev)}
      />,
    );
    expect(container.querySelector(".mw-paginator")).not.toBeNull();

    const nextBtn = container.querySelector<HTMLButtonElement>(
      ".mw-paginator__next",
    )!;
    expect(nextBtn.disabled).toBe(true);
    fireEvent.click(nextBtn);
    expect(pageEvents).toHaveLength(0);
  });
});
