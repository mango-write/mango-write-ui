import { useRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Column } from "./Column";
import { DataTable } from "./DataTable";
import type {
  DataTableColumnResizeEndEvent,
  DataTableHandle,
  DataTablePageEvent,
  DataTablePaginationState,
  DataTableRowClickEvent,
  DataTableSortEvent,
  DataTableSortingRule,
} from "./data-table";

interface SampleRow {
  id: string;
  name: string;
  score: number;
  nested?: { label: string };
}

const SAMPLE_ROWS: SampleRow[] = [
  { id: "r1", name: "Alpha", score: 40, nested: { label: "N-1" } },
  { id: "r2", name: "Bravo", score: 10, nested: { label: "N-2" } },
  { id: "r3", name: "Charlie", score: 30, nested: { label: "N-3" } },
  { id: "r4", name: "Delta", score: 20, nested: { label: "N-4" } },
];

describe("DataTable & Column", () => {
  it("Capability 1: preserves row selection across local sorting, pagination, and cross-page unloaded server IDs via rowKey / dataKey", () => {
    // Part A: rowKey ID selection with unloaded server ID ("r99") preserved across select/select-all
    let latestIds: Array<string | number> = ["r99"];

    function ServerSelectionHost() {
      const [selectedIds, setSelectedIds] = useState<Array<string | number>>([
        "r99",
      ]);
      const [sorting, setSorting] = useState<DataTableSortingRule[]>([]);
      const [pagination, setPagination] = useState<DataTablePaginationState>({
        pageIndex: 0,
        pageSize: 2,
        total: 4,
      });

      return (
        <DataTable
          rows={SAMPLE_ROWS}
          rowKey="id"
          selection={selectedIds}
          onSelectionChange={(next: Array<string | number>) => {
            latestIds = next;
            setSelectedIds(next);
          }}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={pagination}
          onPaginationChange={setPagination}
        >
          <Column selectionMode="multiple" />
          <Column field="name" header="Name" sortable />
          <Column field="score" header="Score" sortable />
        </DataTable>
      );
    }

    const { container, unmount } = render(<ServerSelectionHost />);

    let rowCheckboxes = container.querySelectorAll<HTMLButtonElement>(
      'tbody [role="checkbox"]',
    );
    expect(rowCheckboxes).toHaveLength(2);
    fireEvent.click(rowCheckboxes[0]!);
    expect(latestIds).toEqual(["r99", "r1"]);
    expect(rowCheckboxes[0]!.getAttribute("aria-checked")).toBe("true");

    // Sort by Score ascending -> page 1 shows Bravo(10), Delta(20); r1 & r99 remain selected
    const scoreHeader = container.querySelectorAll("thead th")[2]!;
    fireEvent.click(scoreHeader);
    expect(latestIds).toEqual(["r99", "r1"]);
    const page1Names = Array.from(container.querySelectorAll("tbody tr")).map(
      (tr) => tr.querySelectorAll("td")[1]!.textContent,
    );
    expect(page1Names).toEqual(["Bravo", "Delta"]);

    // Navigate to page 2 -> Charlie(30), Alpha(40); Alpha checkbox stays checked
    fireEvent.click(container.querySelector(".mw-paginator__next")!);
    const page2Names = Array.from(container.querySelectorAll("tbody tr")).map(
      (tr) => tr.querySelectorAll("td")[1]!.textContent,
    );
    expect(page2Names).toEqual(["Charlie", "Alpha"]);
    rowCheckboxes = container.querySelectorAll<HTMLButtonElement>(
      'tbody [role="checkbox"]',
    );
    expect(rowCheckboxes[0]!.getAttribute("aria-checked")).toBe("false");
    expect(rowCheckboxes[1]!.getAttribute("aria-checked")).toBe("true");

    // Select-all on page 2 adds Charlie while preserving unloaded "r99"
    const headerSelectAll = container.querySelector<HTMLButtonElement>(
      'thead [role="checkbox"]',
    )!;
    fireEvent.click(headerSelectAll);
    expect(latestIds).toEqual(["r99", "r1", "r3"]);

    // Unselect-all on page 2 removes only current page rows (r1, r3) and keeps "r99"
    fireEvent.click(headerSelectAll);
    expect(latestIds).toEqual(["r99"]);
    unmount();
  });

  it("Capability 2: clicking row-internal buttons / links / inputs / role controls / [data-row-action] does not bubble into onRowClick or row selection", () => {
    const rowClicks: DataTableRowClickEvent<SampleRow>[] = [];
    let latestSelected = null as SampleRow | null;

    function Host() {
      const [selected, setSelected] = useState<SampleRow | null>(null);
      return (
        <DataTable
          value={SAMPLE_ROWS.slice(0, 2)}
          dataKey="id"
          selection={selected}
          selectionMode="single"
          onSelectionChange={(next: SampleRow | null) => {
            latestSelected = next;
            setSelected(next);
          }}
          onRowClick={(ev) => rowClicks.push(ev)}
        >
          <Column field="name" header="Name" />
          <Column<SampleRow>
            header="Actions"
            body={({ data }) => (
              <>
                <button type="button" className="act-btn">
                  Edit {data.id}
                </button>
                <a href="#detail" className="act-link">
                  Link
                </a>
                <input type="text" className="act-input" />
                <span role="button" className="act-role-btn">
                  RoleBtn
                </span>
                <span
                  role="checkbox"
                  aria-checked="false"
                  className="act-role-chk"
                >
                  RoleChk
                </span>
                <span data-row-action="" className="act-custom">
                  CustomAction
                </span>
              </>
            )}
          />
        </DataTable>
      );
    }

    const { container } = render(<Host />);

    const interactiveSelectors = [
      ".act-btn",
      ".act-link",
      ".act-input",
      ".act-role-btn",
      ".act-role-chk",
      ".act-custom",
    ];

    for (const sel of interactiveSelectors) {
      fireEvent.click(container.querySelector(sel)!);
    }

    expect(rowClicks).toHaveLength(0);
    expect(latestSelected).toBeNull();

    // Clicking plain data cell triggers onRowClick and single selection
    const firstDataCell = container.querySelectorAll("tbody tr td")[0]!;
    fireEvent.click(firstDataCell);

    expect(rowClicks).toHaveLength(1);
    expect(rowClicks[0]!.data.id).toBe("r1");
    expect(latestSelected?.id).toBe("r1");
  });

  it("Capability 3: supports resizableColumns pointer dragging and emits onColumnResizeEnd", () => {
    const resizeEvents: DataTableColumnResizeEndEvent[] = [];

    const { container, unmount } = render(
      <DataTable
        value={SAMPLE_ROWS.slice(0, 2)}
        dataKey="id"
        resizableColumns
        onColumnResizeEnd={(ev) => resizeEvents.push(ev)}
        columns={[
          { field: "name", header: "Name", width: 140 },
          { field: "score", header: "Score", width: 100 },
        ]}
      />,
    );

    const firstTh = container.querySelectorAll<HTMLElement>("thead th")[0]!;
    const resizer = firstTh.querySelector<HTMLElement>(
      ".mw-datatable__resizer[data-column-resizer]",
    )!;

    fireEvent.pointerDown(resizer, { clientX: 100 });
    fireEvent.pointerMove(window, { clientX: 165 });

    expect(firstTh.style.width).toBe("205px");
    expect(firstTh.style.minWidth).toBe("205px");
    expect(firstTh.style.maxWidth).toBe("205px");

    const firstBodyTd = container.querySelectorAll<HTMLElement>(
      "tbody tr td",
    )[0]!;
    expect(firstBodyTd.style.width).toBe("205px");

    fireEvent.pointerUp(window, { clientX: 165 });

    expect(resizeEvents).toHaveLength(1);
    expect(resizeEvents[0]!.delta).toBe(65);
    expect(resizeEvents[0]!.field).toBe("name");
    expect(resizeEvents[0]!.element).toBe(firstTh);

    unmount();
  });

  it("Capability 4: supports frozen sticky columns with synchronized cumulative offsets (left & right, including selection column)", () => {
    const { container } = render(
      <DataTable value={SAMPLE_ROWS.slice(0, 2)} rowKey="id" scrollable>
        <Column selectionMode="multiple" frozen width={48} />
        <Column field="id" header="ID" frozen width={120} />
        <Column field="name" header="Name" />
        <Column field="score" header="Score" frozen alignFrozen="right" width={90} />
      </DataTable>,
    );

    const ths = container.querySelectorAll<HTMLElement>("thead th");
    expect(ths[0]!.classList.contains("mw-datatable__cell--frozen")).toBe(true);
    expect(ths[0]!.style.position).toBe("sticky");
    expect(ths[0]!.style.insetInlineStart).toBe("0px");
    expect(ths[0]!.style.zIndex).toBe("1");

    // Second left-frozen column is offset by selection column's 48px width
    expect(ths[1]!.classList.contains("mw-datatable__cell--frozen")).toBe(true);
    expect(ths[1]!.style.position).toBe("sticky");
    expect(ths[1]!.style.insetInlineStart).toBe("48px");

    expect(ths[3]!.classList.contains("mw-datatable__cell--frozen")).toBe(true);
    expect(ths[3]!.style.position).toBe("sticky");
    expect(ths[3]!.style.insetInlineEnd).toBe("0px");

    const tds = container.querySelectorAll<HTMLElement>(
      "tbody tr:first-child td",
    );
    expect(tds[0]!.style.insetInlineStart).toBe("0px");
    expect(tds[1]!.style.insetInlineStart).toBe("48px");
    expect(tds[3]!.style.insetInlineEnd).toBe("0px");
  });

  it("Capability 5: does not locally re-sort or slice server-returned pages when lazy / serverSide is true", () => {
    const sortEvents: DataTableSortEvent[] = [];
    const pageEvents: DataTablePageEvent[] = [];
    const serverPageRows: SampleRow[] = [
      { id: "r3", name: "Charlie", score: 30 },
      { id: "r1", name: "Alpha", score: 40 },
    ];

    function Host() {
      const [first, setFirst] = useState(2);
      const [sortField, setSortField] = useState<string | undefined>("score");
      const [sortOrder, setSortOrder] = useState<number | undefined>(1);

      return (
        <DataTable
          value={serverPageRows}
          dataKey="id"
          lazy
          paginator
          rows={2}
          first={first}
          totalRecords={4}
          sortField={sortField}
          sortOrder={sortOrder}
          onFirstChange={setFirst}
          onSortFieldChange={setSortField}
          onSortOrderChange={setSortOrder}
          onSort={(ev) => sortEvents.push(ev)}
          onPage={(ev) => pageEvents.push(ev)}
        >
          <Column field="name" header="Name" sortable />
          <Column field="score" header="Score" sortable />
        </DataTable>
      );
    }

    const { container } = render(<Host />);

    const renderedNames = Array.from(container.querySelectorAll("tbody tr")).map(
      (tr) => tr.querySelectorAll("td")[0]!.textContent,
    );
    expect(renderedNames).toEqual(["Charlie", "Alpha"]);

    // Click Name header -> emits sort event without mutating server row order locally
    const nameTh = container.querySelectorAll("thead th")[0]!;
    fireEvent.click(nameTh);

    expect(sortEvents).toHaveLength(1);
    expect(sortEvents[0]).toEqual({
      sortField: "name",
      sortOrder: 1,
      first: 2,
      rows: 2,
    });
    expect(
      Array.from(container.querySelectorAll("tbody tr")).map(
        (tr) => tr.querySelectorAll("td")[0]!.textContent,
      ),
    ).toEqual(["Charlie", "Alpha"]);

    // Click Page 1 button -> emits page event with current sortField/sortOrder
    const page1Btn = container.querySelectorAll(".mw-paginator__page")[0]!;
    fireEvent.click(page1Btn);

    expect(pageEvents).toHaveLength(1);
    expect(pageEvents[0]).toEqual({
      page: 0,
      first: 0,
      rows: 2,
      pageCount: 2,
      sortField: "name",
      sortOrder: 1,
    });
  });

  it("Capability 6: supports expandedKeys row expansion, CSV export, loading (preserving selection), empty, error, and readOnly states", () => {
    const expandedEvents: string[] = [];
    const collapsedEvents: string[] = [];
    let latestExpanded: Array<string | number> = [];
    const onRetry = vi.fn();

    function Host({
      loading = false,
      readOnly = false,
      rows = SAMPLE_ROWS.slice(0, 2),
      error = false as boolean,
    }: {
      loading?: boolean;
      readOnly?: boolean;
      rows?: SampleRow[];
      error?: boolean;
    }) {
      const tableRef = useRef<DataTableHandle>(null);
      const [expandedKeys, setExpandedKeys] = useState<Array<string | number>>(
        [],
      );
      const [selected, setSelected] = useState<Array<string | number>>(["r1"]);

      return (
        <div>
          <button
            type="button"
            data-testid="export-btn"
            onClick={() => {
              const csv = tableRef.current?.exportCSV();
              (window as unknown as { __lastCsv?: string }).__lastCsv = csv;
            }}
          >
            Export
          </button>
          <DataTable
            ref={tableRef}
            rows={rows}
            rowKey="id"
            loading={loading}
            readOnly={readOnly}
            error={error}
            errorMessage="服务暂时不可用"
            onRetry={onRetry}
            selection={selected}
            selectionMode="multiple"
            onSelectionChange={setSelected}
            expandedKeys={expandedKeys}
            onExpandedKeysChange={(next: Array<string | number>) => {
              latestExpanded = next;
              setExpandedKeys(next);
            }}
            onRowExpand={(ev) => expandedEvents.push(ev.data.id)}
            onRowCollapse={(ev) => collapsedEvents.push(ev.data.id)}
            expansion={({ data }) => (
              <div className="exp-detail">Expanded: {data.name}</div>
            )}
            empty={<span data-testid="custom-empty">空列表提示</span>}
          >
            <Column expander />
            <Column selectionMode="multiple" />
            <Column field="name" header="Name" />
            <Column field="nested.label" header="Nested" />
          </DataTable>
        </div>
      );
    }

    const { container, rerender } = render(<Host />);
    expect(container.querySelector(".mw-datatable__row-expansion")).toBeNull();

    const expanderBtns = container.querySelectorAll(".mw-datatable__expander");
    expect(expanderBtns).toHaveLength(2);

    fireEvent.click(expanderBtns[0]!);
    expect(latestExpanded).toEqual(["r1"]);
    expect(expandedEvents).toEqual(["r1"]);
    expect(
      container.querySelector("tr.mw-datatable__row-expansion")?.textContent,
    ).toContain("Expanded: Alpha");

    fireEvent.click(expanderBtns[0]!);
    expect(latestExpanded).toEqual([]);
    expect(collapsedEvents).toEqual(["r1"]);
    expect(container.querySelector(".mw-datatable__row-expansion")).toBeNull();

    // CSV export ignores expander & selection columns and resolves dot-path field
    fireEvent.click(screen.getByTestId("export-btn"));
    expect((window as unknown as { __lastCsv?: string }).__lastCsv).toBe(
      "Name,Nested\nAlpha,N-1\nBravo,N-2",
    );

    // Loading state overlays spinner without clearing selection
    rerender(<Host loading />);
    expect(screen.getByTestId("datatable-loading")).not.toBeNull();
    expect(
      container
        .querySelectorAll('tbody [role="checkbox"]')[0]!
        .getAttribute("aria-checked"),
    ).toBe("true");

    // ReadOnly state blocks selection toggling
    rerender(<Host readOnly />);
    const secondCheckbox = container.querySelectorAll<HTMLButtonElement>(
      'tbody [role="checkbox"]',
    )[1]!;
    expect(secondCheckbox.disabled).toBe(true);
    fireEvent.click(secondCheckbox);
    expect(secondCheckbox.getAttribute("aria-checked")).toBe("false");

    // Empty state
    rerender(<Host rows={[]} />);
    expect(screen.getByTestId("custom-empty").textContent).toBe("空列表提示");

    // Error state with retry
    rerender(<Host rows={[]} error />);
    expect(screen.getByRole("alert").textContent).toContain("服务暂时不可用");
    fireEvent.click(screen.getByRole("button", { name: "重试" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
