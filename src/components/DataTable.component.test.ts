import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";

import { mountUiComponent } from "../test-utils/mount.js";
import Column from "./Column.vue";
import DataTable from "./DataTable.vue";
import type {
  DataTableColumnResizeEndEvent,
  DataTablePageEvent,
  DataTableRowClickEvent,
  DataTableSortEvent,
} from "./data-table.js";

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
  it("Capability 1: 基于 dataKey 在本地排序、分页切页与数据源对象重建后保持稳定行选择", async () => {
    const selected = ref<SampleRow[]>([]);
    const first = ref(0);
    const rowsData = ref<SampleRow[]>([...SAMPLE_ROWS]);

    const Host = defineComponent({
      components: { DataTable, Column },
      setup() {
        return { selected, first, rowsData };
      },
      template: `
        <DataTable
          v-model:selection="selected"
          v-model:first="first"
          :value="rowsData"
          data-key="id"
          paginator
          :rows="2"
        >
          <Column selection-mode="multiple" />
          <Column field="name" header="Name" sortable />
          <Column field="score" header="Score" sortable />
        </DataTable>
      `,
    });

    const wrapper = mountUiComponent(Host);
    await nextTick();

    // 第 1 页显示 r1 (40), r2 (10)；勾选第 1 行 (r1)
    let rowCheckboxes = wrapper.findAll('tbody [role="checkbox"]');
    expect(rowCheckboxes).toHaveLength(2);
    await rowCheckboxes[0]!.trigger("click");
    await nextTick();

    expect(selected.value.map((r) => r.id)).toEqual(["r1"]);
    expect(rowCheckboxes[0]!.attributes("aria-checked")).toBe("true");

    // 点击 Score 表头升序排序：顺序变为 r2(10), r4(20) | r3(30), r1(40)
    // r1 移到了第 2 页，但 selected 中必须仍然保留 r1
    const scoreHeader = wrapper.findAll("thead th")[2]!;
    await scoreHeader.trigger("click");
    await nextTick();

    expect(selected.value.map((r) => r.id)).toEqual(["r1"]);
    const page1Names = wrapper
      .findAll("tbody tr")
      .map((tr) => tr.findAll("td")[1]!.text());
    expect(page1Names).toEqual(["Bravo", "Delta"]);

    // 切换到第 2 页：应显示 r3(30), r1(40)，且 r1 的复选框应保持勾选状态
    const nextBtn = wrapper.get(".p-paginator-next");
    await nextBtn.trigger("click");
    await nextTick();

    const page2Names = wrapper
      .findAll("tbody tr")
      .map((tr) => tr.findAll("td")[1]!.text());
    expect(page2Names).toEqual(["Charlie", "Alpha"]);

    rowCheckboxes = wrapper.findAll('tbody [role="checkbox"]');
    expect(rowCheckboxes[0]!.attributes("aria-checked")).toBe("false");
    expect(rowCheckboxes[1]!.attributes("aria-checked")).toBe("true");

    // 模拟刷新后数据源对象引用整体重建，同时在第 2 页再勾选 r3
    rowsData.value = SAMPLE_ROWS.map((item) => ({ ...item }));
    await nextTick();

    rowCheckboxes = wrapper.findAll('tbody [role="checkbox"]');
    expect(rowCheckboxes[1]!.attributes("aria-checked")).toBe("true");

    await rowCheckboxes[0]!.trigger("click");
    await nextTick();
    expect(selected.value.map((r) => r.id)).toEqual(["r1", "r3"]);
  });

  it("Capability 2: 点击行内 button / a / input / [role=button] / [role=checkbox] / [data-row-action] 不触发 @row-click 或行选择", async () => {
    const rowClicks: DataTableRowClickEvent<SampleRow>[] = [];
    const selected = ref<SampleRow | null>(null);

    const Host = defineComponent({
      components: { DataTable, Column },
      setup() {
        return {
          rows: SAMPLE_ROWS.slice(0, 2),
          selected,
          onRowClick: (ev: DataTableRowClickEvent<SampleRow>) =>
            rowClicks.push(ev),
        };
      },
      template: `
        <DataTable
          v-model:selection="selected"
          selection-mode="single"
          :value="rows"
          data-key="id"
          @row-click="onRowClick"
        >
          <Column field="name" header="Name" />
          <Column header="Actions">
            <template #body="{ data }">
              <button type="button" class="act-btn">Edit {{ data.id }}</button>
              <a href="#detail" class="act-link">Link</a>
              <input type="text" class="act-input" />
              <span role="button" class="act-role-btn">RoleBtn</span>
              <span role="checkbox" aria-checked="false" class="act-role-chk">RoleChk</span>
              <span data-row-action class="act-custom">CustomAction</span>
            </template>
          </Column>
        </DataTable>
      `,
    });

    const wrapper = mountUiComponent(Host);
    await nextTick();

    const interactiveSelectors = [
      ".act-btn",
      ".act-link",
      ".act-input",
      ".act-role-btn",
      ".act-role-chk",
      ".act-custom",
    ];

    for (const sel of interactiveSelectors) {
      await wrapper.get(sel).trigger("click");
      await nextTick();
    }

    expect(rowClicks).toHaveLength(0);
    expect(selected.value).toBeNull();

    // 点击普通数据单元格则正常触发 @row-click 与单选
    const firstDataCell = wrapper.findAll("tbody tr td")[0]!;
    await firstDataCell.trigger("click");
    await nextTick();

    expect(rowClicks).toHaveLength(1);
    expect(rowClicks[0]!.data.id).toBe("r1");
    expect(selected.value?.id).toBe("r1");
  });

  it("Capability 3: 支持 resizableColumns 真实指针拖拽调整列宽并发出 column-resize-end", async () => {
    const resizeEvents: DataTableColumnResizeEndEvent[] = [];

    const Host = defineComponent({
      components: { DataTable, Column },
      setup() {
        return {
          rows: SAMPLE_ROWS.slice(0, 2),
          onResizeEnd: (ev: DataTableColumnResizeEndEvent) =>
            resizeEvents.push(ev),
        };
      },
      template: `
        <DataTable
          :value="rows"
          data-key="id"
          resizable-columns
          @column-resize-end="onResizeEnd"
        >
          <Column field="name" header="Name" :width="140" />
          <Column field="score" header="Score" :width="100" />
        </DataTable>
      `,
    });

    const wrapper = mountUiComponent(Host, { attachTo: document.body });
    await nextTick();

    const firstTh = wrapper.findAll<HTMLElement>("thead th")[0]!;
    const resizer = firstTh.get(
      ".mw-datatable__resizer.p-column-resizer[data-column-resizer]",
    );

    await resizer.trigger("mousedown", { clientX: 100 });
    window.dispatchEvent(new MouseEvent("mousemove", { clientX: 165 }));
    await nextTick();

    expect(firstTh.element.style.width).toBe("205px");
    expect(firstTh.element.style.minWidth).toBe("205px");
    expect(firstTh.element.style.maxWidth).toBe("205px");

    const firstBodyTd = wrapper.findAll<HTMLElement>("tbody tr td")[0]!;
    expect(firstBodyTd.element.style.width).toBe("205px");

    window.dispatchEvent(new MouseEvent("mouseup", { clientX: 165 }));
    await nextTick();

    expect(resizeEvents).toHaveLength(1);
    expect(resizeEvents[0]!.delta).toBe(65);
    expect(resizeEvents[0]!.field).toBe("name");
    expect(resizeEvents[0]!.element).toBe(firstTh.element);

    wrapper.unmount();
  });

  it("Capability 4: 支持 frozen 固定列类名与 sticky 内联定位（left 与 right）", async () => {
    const wrapper = mountUiComponent({
      components: { DataTable, Column },
      setup() {
        return { rows: SAMPLE_ROWS.slice(0, 2) };
      },
      template: `
        <DataTable :value="rows" data-key="id" scrollable>
          <Column field="id" header="ID" frozen />
          <Column field="name" header="Name" />
          <Column field="score" header="Score" frozen align-frozen="right" />
        </DataTable>
      `,
    });
    await nextTick();

    const ths = wrapper.findAll<HTMLElement>("thead th");
    expect(ths[0]!.classes()).toContain("mw-datatable__cell--frozen");
    expect(ths[0]!.classes()).toContain("p-datatable-frozen-column");
    expect(ths[0]!.element.style.position).toBe("sticky");
    expect(ths[0]!.element.style.insetInlineStart).toBe("0px");
    expect(ths[0]!.element.style.zIndex).toBe("1");

    expect(ths[2]!.classes()).toContain("mw-datatable__cell--frozen");
    expect(ths[2]!.classes()).toContain("p-datatable-frozen-column");
    expect(ths[2]!.element.style.position).toBe("sticky");
    expect(ths[2]!.element.style.insetInlineEnd).toBe("0px");
    expect(ths[2]!.element.style.zIndex).toBe("1");

    const tds = wrapper.findAll<HTMLElement>("tbody tr:first-child td");
    expect(tds[0]!.classes()).toContain("mw-datatable__cell--frozen");
    expect(tds[0]!.classes()).toContain("p-datatable-frozen-column");
    expect(tds[0]!.element.style.position).toBe("sticky");
    expect(tds[0]!.element.style.insetInlineStart).toBe("0px");

    expect(tds[2]!.classes()).toContain("p-datatable-frozen-column");
    expect(tds[2]!.element.style.insetInlineEnd).toBe("0px");
  });

  it("Capability 5: 区分本地排序/分页与 lazy 服务端模式（lazy=true 不做本地重排或切片，只发 @sort / @page）", async () => {
    const sortEvents: DataTableSortEvent[] = [];
    const pageEvents: DataTablePageEvent[] = [];
    // 服务端已返回第 2 页数据（只有 2 条，但 totalRecords=4）
    const serverPageRows = ref<SampleRow[]>([
      { id: "r3", name: "Charlie", score: 30 },
      { id: "r1", name: "Alpha", score: 40 },
    ]);

    const Host = defineComponent({
      components: { DataTable, Column },
      setup() {
        const first = ref(2);
        const sortField = ref<string | undefined>("score");
        const sortOrder = ref<number | undefined>(1);
        return {
          serverPageRows,
          first,
          sortField,
          sortOrder,
          onSort: (ev: DataTableSortEvent) => sortEvents.push(ev),
          onPage: (ev: DataTablePageEvent) => pageEvents.push(ev),
        };
      },
      template: `
        <DataTable
          v-model:first="first"
          v-model:sort-field="sortField"
          v-model:sort-order="sortOrder"
          :value="serverPageRows"
          data-key="id"
          lazy
          paginator
          :rows="2"
          :total-records="4"
          @sort="onSort"
          @page="onPage"
        >
          <Column field="name" header="Name" sortable />
          <Column field="score" header="Score" sortable />
        </DataTable>
      `,
    });

    const wrapper = mountUiComponent(Host);
    await nextTick();

    // 尽管 first=2, rows=2，lazy 模式下不得对 serverPageRows 做本地 slice(2, 4) 导致空表
    const renderedNames = wrapper
      .findAll("tbody tr")
      .map((tr) => tr.findAll("td")[0]!.text());
    expect(renderedNames).toEqual(["Charlie", "Alpha"]);

    // 点击 Name 表头触发服务端排序事件，但不改变当前 DOM 行顺序（由服务端新数据驱动）
    const nameTh = wrapper.findAll("thead th")[0]!;
    await nameTh.trigger("click");
    await nextTick();

    expect(sortEvents).toHaveLength(1);
    expect(sortEvents[0]).toEqual({
      sortField: "name",
      sortOrder: 1,
      first: 2,
      rows: 2,
    });
    expect(
      wrapper.findAll("tbody tr").map((tr) => tr.findAll("td")[0]!.text()),
    ).toEqual(["Charlie", "Alpha"]);

    // 点击分页器第 1 页按钮，发出 @page 事件携带当前 sortField/sortOrder
    const page1Btn = wrapper.findAll(".p-paginator-page")[0]!;
    await page1Btn.trigger("click");
    await nextTick();

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

  it("支持行展开（expander 列 + #expansion 插槽 + 对象映射或数组格式的 v-model:expandedRows）及 CSV 导出", async () => {
    const expandedRows = ref<Record<string, boolean>>({});
    const expandedEvents: string[] = [];
    const collapsedEvents: string[] = [];
    const tableRef = ref<InstanceType<typeof DataTable> | null>(null);

    const Host = defineComponent({
      components: { DataTable, Column },
      setup() {
        const dynamicCols = [
          { field: "name", header: "Name" },
          { field: "nested.label", header: "Nested" },
        ];
        return {
          rows: SAMPLE_ROWS.slice(0, 2),
          dynamicCols,
          expandedRows,
          tableRef,
          onExpand: (ev: { data: SampleRow }) =>
            expandedEvents.push(ev.data.id),
          onCollapse: (ev: { data: SampleRow }) =>
            collapsedEvents.push(ev.data.id),
        };
      },
      template: `
        <DataTable
          ref="tableRef"
          v-model:expanded-rows="expandedRows"
          :value="rows"
          data-key="id"
          @row-expand="onExpand"
          @row-collapse="onCollapse"
        >
          <Column expander />
          <Column
            v-for="col in dynamicCols"
            :key="col.field"
            :field="col.field"
            :header="col.header"
          />
          <template #expansion="{ data }">
            <div class="exp-detail">Expanded: {{ data.name }}</div>
          </template>
        </DataTable>
      `,
    });

    const wrapper = mountUiComponent(Host);
    await nextTick();

    expect(wrapper.find(".p-datatable-row-expansion").exists()).toBe(false);

    const expanderBtns = wrapper.findAll(".mw-datatable__expander");
    expect(expanderBtns).toHaveLength(2);

    await expanderBtns[0]!.trigger("click");
    await nextTick();

    expect(expandedRows.value).toEqual({ r1: true });
    expect(expandedEvents).toEqual(["r1"]);
    const expansionRow = wrapper.get(
      "tr.mw-datatable__row.p-datatable-row-expansion",
    );
    expect(expansionRow.text()).toContain("Expanded: Alpha");

    await expanderBtns[0]!.trigger("click");
    await nextTick();
    expect(expandedRows.value).toEqual({});
    expect(collapsedEvents).toEqual(["r1"]);
    expect(wrapper.find(".p-datatable-row-expansion").exists()).toBe(false);

    // 验证 exportCSV 忽略 expander 列并正确解析点路径字段
    const csv = tableRef.value!.exportCSV();
    expect(csv).toBe("Name,Nested\nAlpha,N-1\nBravo,N-2");
  });
});
