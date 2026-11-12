import type { UsageValues } from "./types";

export interface TsxOptions {
  ui: readonly string[];
  react?: readonly string[];
  lucide?: readonly string[];
  moduleSetup?: readonly string[];
  setup?: readonly string[];
  jsx: string;
  componentName?: string;
}

export function buildTsx(opts: TsxOptions): string {
  const out: string[] = [];
  if (opts.react?.length) {
    out.push(`import { ${[...new Set(opts.react)].join(", ")} } from "react";`);
  }
  if (opts.ui.length) {
    out.push(`import { ${opts.ui.join(", ")} } from "@mango-write/ui-react";`);
  }
  if (opts.lucide?.length) {
    out.push(`import { ${[...new Set(opts.lucide)].join(", ")} } from "lucide-react";`);
  }
  if (out.length) out.push("");
  if (opts.moduleSetup?.length) {
    out.push(...opts.moduleSetup, "");
  }
  out.push(`export default function ${opts.componentName ?? "Example"}() {`);
  if (opts.setup?.length) {
    for (const line of opts.setup) {
      out.push(line ? `  ${line}` : "");
    }
    out.push("");
  }
  const jsxLines = opts.jsx.split("\n");
  if (jsxLines.length === 1) {
    out.push(`  return ${jsxLines[0]};`);
  } else {
    out.push("  return (");
    for (const line of jsxLines) {
      out.push(line ? `    ${line}` : "");
    }
    out.push("  );");
  }
  out.push("}");
  return out.join("\n");
}

function jsxStringProp(name: string, value: unknown): string {
  return value ? `${name}=${JSON.stringify(String(value))}` : "";
}

/**
 * 27 个带自定义组合/插槽/选项数组的桌面组件 entry 对应的地道 React TSX 示例。
 */
export function customReactEntryCode(slug: string, v: UsageValues): string | null {
  switch (slug) {
    case "accordion": {
      const panels = [
        { value: "meta", title: "题录元数据", text: "DOI: 10.1038/s41586-026-00001-x · 期刊：Nature" },
        { value: "export", title: "导出格式设置", text: "目标模板：ACM sigconf · 参考文献样式：BibTeX" },
        { value: "locked", title: "团队归档策略（管理员）", text: "仅团队管理员可修改。", disabled: true },
      ];
      const panelLines = panels
        .map(
          (p) =>
            `  <AccordionPanel value="${p.value}"${p.disabled ? " disabled" : ""}>\n    <AccordionHeader>${p.title}</AccordionHeader>\n    <AccordionContent>\n      <p className="doc-note">${p.text}</p>\n    </AccordionContent>\n  </AccordionPanel>`,
        )
        .join("\n");
      return buildTsx({
        react: ["useState"],
        ui: ["Accordion", "AccordionContent", "AccordionHeader", "AccordionPanel"],
        setup: [`const [active, setActive] = useState(${JSON.stringify(v.active ?? "meta")});`],
        jsx: `<Accordion value={active} onValueChange={(next) => setActive(String(next ?? "meta"))}>\n${panelLines}\n</Accordion>`,
      });
    }

    case "action-menu": {
      return buildTsx({
        react: ["useState"],
        ui: ["ActionMenu"],
        lucide: ["Pencil", "Share2", "Trash2"],
        moduleSetup: [
          "const items = [",
          '  { key: "rename", label: "重命名", icon: Pencil },',
          '  { key: "share", label: "共享", icon: Share2 },',
          "  { separator: true },",
          '  { key: "remove", label: "删除", icon: Trash2, danger: true },',
          "];",
        ],
        setup: [`const [open, setOpen] = useState(${Boolean(v.open)});`],
        jsx: '<ActionMenu open={open} onOpenChange={setOpen} items={items} aria-label="行内操作菜单" />',
      });
    }

    case "admin-shell": {
      const shell = (v.shell as string) || "list";
      if (shell === "config") {
        return buildTsx({
          react: ["useState"],
          ui: ["AdminConfigPage", "ConfigSection", "ConfigRow", "ToggleSwitch", "InputNumber"],
          setup: [
            `const [dirtyCount, setDirtyCount] = useState(${Number(v.dirtyCount ?? 2)});`,
            "const [signupEnabled, setSignupEnabled] = useState(true);",
            "const [dailyFreeTokens, setDailyFreeTokens] = useState<number | null>(50000);",
          ],
          jsx: `<AdminConfigPage dirtyCount={dirtyCount} onSave={() => setDirtyCount(0)}>
  <ConfigSection title="注册与访问控制">
    <ConfigRow label="开放自助注册" keyHint="auth.signup_enabled" hint="关闭后仅受邀链接可注册新账号。">
      <ToggleSwitch checked={signupEnabled} onCheckedChange={setSignupEnabled} />
    </ConfigRow>
    <ConfigRow label="免费档日配额上限" keyHint="billing.daily_free_tokens" hint="每日凌晨自动重置的基础推理额度。">
      <InputNumber value={dailyFreeTokens} onValueChange={setDailyFreeTokens} min={0} step={5000} />
    </ConfigRow>
  </ConfigSection>
</AdminConfigPage>`,
        });
      }
      if (shell === "detail") {
        return buildTsx({
          react: ["useState"],
          ui: ["AdminDetailPage", "StatCard", "Tabs", "TabList", "Tab", "Tag", "Button", "DataTable", "Column"],
          setup: ['const [activeTab, setActiveTab] = useState("orders");'],
          jsx: `<AdminDetailPage
  backTo="/admin/users"
  title={
    <>
      <strong>林知夏 (usr_01H9X)</strong>
      <Tag value="Pro 学术版" severity="success" />
    </>
  }
  actions={<Button size="sm" variant="outlined" label="调整配额" />}
  cards={
    <>
      <StatCard label="剩余可用额度" value="128,400" sub="本月已用 71,600" actionLabel="充值明细" />
      <StatCard label="关联文库文献" value="142 篇" sub="占用存储 1.8 GB" />
    </>
  }
  tabs={
    <Tabs value={activeTab} onValueChange={(next) => setActiveTab(String(next))}>
      <TabList>
        <Tab value="orders" badge={12}>订阅订单</Tab>
        <Tab value="logs" badge={48}>调用记录</Tab>
      </TabList>
    </Tabs>
  }
>
  <DataTable value={rows} dataKey="id">
    <Column field="name" header="操作人" />
    <Column field="quota" header="额度快照" />
  </DataTable>
</AdminDetailPage>`,
        });
      }
      if (shell === "board") {
        return buildTsx({
          ui: ["AdminBoardPage", "AdminBoardSection", "StatBar", "Button"],
          lucide: ["RefreshCw"],
          jsx: `<AdminBoardPage
  actions={<Button size="sm" variant="text" icon={RefreshCw} label="刷新" />}
  stats={<StatBar items={stats} />}
>
  <AdminBoardSection
    title="异步任务队列健康度"
    drill={<a href="/admin/queues">查看全部队列 →</a>}
  >
    {/* 看板内容 */}
  </AdminBoardSection>
</AdminBoardPage>`,
        });
      }
      return buildTsx({
        ui: ["AdminListPage", "InputText", "Button", "DataTable", "Column", "Paginator"],
        lucide: ["Plus", "RefreshCw"],
        jsx: `<AdminListPage
  actions={<Button size="sm" icon={Plus} label="发放兑换码" />}
  filters={
    <>
      <InputText placeholder="搜索姓名、邮箱或用户 ID…" />
      <Button size="sm" variant="text" icon={RefreshCw} label="刷新" />
    </>
  }
  pagination={<Paginator first={0} rows={20} totalRecords={128} />}
>
  <DataTable value={rows} dataKey="id">
    <Column field="name" header="用户" />
    <Column field="plan" header="档位" />
    <Column field="quota" header="剩余额度" />
  </DataTable>
</AdminListPage>`,
      });
    }

    case "async-search-select": {
      const attrs = [
        "value={doi}",
        "onValueChange={setDoi}",
        "search={search}",
        jsxStringProp("placeholder", v.placeholder),
        v.showClear ? "showClear" : "",
        v.fluid ? "fluid" : "",
        v.disabled ? "disabled" : "",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["AsyncSearchSelect", "type AsyncSearchOption"],
        moduleSetup: [
          "async function search(query: string): Promise<AsyncSearchOption[]> {",
          "  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);",
          "  return res.json();",
          "}",
        ],
        setup: ["const [doi, setDoi] = useState<string | null>(null);"],
        jsx: `<AsyncSearchSelect\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "async-slot": {
      const attrs = [
        v.status && v.status !== "ready" ? `status="${v.status}"` : 'status="ready"',
        v.skeleton && v.skeleton !== "list" ? `skeleton="${v.skeleton}"` : "",
      ].filter(Boolean);
      return buildTsx({
        ui: ["AsyncSlot"],
        jsx: `<AsyncSlot${attrs.length ? ` ${attrs.join(" ")}` : ""}>\n  <div style={{ display: "grid", gap: "var(--space-2)" }}>\n    <p>三条语料已就位，可以直接开始写作。</p>\n    <p>语料行来自题录库与解析缓存。</p>\n  </div>\n</AsyncSlot>`,
      });
    }

    case "calendar": {
      const attrs = [
        "value={date}",
        "onValueChange={setDate}",
        v.selectionMode && v.selectionMode !== "single" ? `selectionMode="${v.selectionMode}"` : "",
        v.firstDayOfWeek === "0" ? "firstDayOfWeek={0}" : "",
        v.showTodayShortcut === false ? "showTodayShortcut={false}" : "",
        v.fluid ? "fluid" : "",
        v.disabled ? "disabled" : "",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["Calendar", "type CalendarModelValue"],
        setup: ["const [date, setDate] = useState<CalendarModelValue>(new Date());"],
        jsx: `<Calendar\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "config-section": {
      const rowAttrs = [
        `label=${JSON.stringify(String(v.label ?? "免费档日配额上限"))}`,
        jsxStringProp("keyHint", v.keyHint),
        jsxStringProp("hint", v.hint),
        jsxStringProp("status", v.status),
        v.status && v.statusTone && v.statusTone !== "muted" ? `statusTone="${v.statusTone}"` : "",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["ConfigSection", "ConfigRow", "ToggleSwitch", "InputNumber"],
        setup: [
          "const [signupEnabled, setSignupEnabled] = useState(true);",
          "const [dailyTokens, setDailyTokens] = useState<number | null>(50000);",
        ],
        jsx: `<ConfigSection title=${JSON.stringify(String(v.title ?? "并发与速率护栏"))}>
  <ConfigRow label="开放自助注册" keyHint="auth.signup_enabled" hint="关闭后仅受邀链接可注册新账号。">
    <ToggleSwitch checked={signupEnabled} onCheckedChange={setSignupEnabled} />
  </ConfigRow>
  <ConfigRow
    ${rowAttrs.join("\n    ")}
  >
    <InputNumber value={dailyTokens} onValueChange={setDailyTokens} min={0} step={5000} />
  </ConfigRow>
</ConfigSection>`,
      });
    }

    case "confirm": {
      const askAttrs = [
        v.title ? `title: ${JSON.stringify(v.title)},` : "",
        `message: ${JSON.stringify(v.message ?? "")},`,
        v.danger ? "danger: true," : "",
        v.acceptLabel ? `acceptLabel: ${JSON.stringify(v.acceptLabel)},` : "",
        v.rejectLabel ? `rejectLabel: ${JSON.stringify(v.rejectLabel)},` : "",
      ].filter(Boolean);
      return buildTsx({
        ui: ["Button", "ConfirmHost", "useConfirm", "useNotify"],
        setup: [
          "const confirm = useConfirm();",
          "const notify = useNotify();",
          "",
          "async function remove() {",
          "  const ok = await confirm.ask({",
          ...askAttrs.map((l) => `    ${l}`),
          "  });",
          '  if (ok) notify.success("已删除");',
          "}",
        ],
        jsx: `<>\n  <ConfirmHost />\n  <Button severity="${v.danger ? "danger" : "primary"}" label="删除草稿" onClick={remove} />\n</>`,
      });
    }

    case "data-table": {
      const attrs = [
        "value={papers}",
        'dataKey="id"',
        v.stripedRows ? "stripedRows" : "",
        v.rowHover ? "rowHover" : "",
        v.loading ? "loading" : "",
        v.paginator ? "paginator" : "",
        v.paginator && v.rows !== 10 ? `rows={${v.rows}}` : "",
      ].filter(Boolean);
      return buildTsx({
        ui: ["Column", "DataTable"],
        moduleSetup: [
          "const papers = [",
          '  { id: 1, title: "引文锚点研究", venue: "Nature", cited: 12 },',
          '  { id: 2, title: "协同编辑一致性", venue: "CHI", cited: 8 },',
          '  { id: 3, title: "锚定空间坐标系", venue: "UIST", cited: 5 },',
          "];",
        ],
        jsx: `<DataTable\n  ${attrs.join("\n  ")}\n>\n  <Column field="title" header="标题" sortable />\n  <Column field="venue" header="期刊/会议" />\n  <Column field="cited" header="被引" sortable />\n</DataTable>`,
      });
    }

    case "date-picker": {
      const attrs = [
        "value={date}",
        "onValueChange={setDate}",
        v.selectionMode && v.selectionMode !== "single" ? `selectionMode="${v.selectionMode}"` : "",
        jsxStringProp("placeholder", v.placeholder),
        v.showTime ? "showTime" : "",
        v.showTime && v.hourFormat === "12" ? 'hourFormat="12"' : "",
        v.showIcon ? "showIcon" : "",
        v.showClear ? "showClear" : "",
        v.showButtonBar ? "showButtonBar" : "",
        v.fluid ? "fluid" : "",
        v.disabled ? "disabled" : "",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["DatePicker", "type DatePickerModelValue"],
        setup: ["const [date, setDate] = useState<DatePickerModelValue>(new Date());"],
        jsx: `<DatePicker\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "dialog": {
      const attrs = [
        "open={open}",
        "onOpenChange={setOpen}",
        v.size ? `size="${v.size}"` : "",
        jsxStringProp("title", v.title),
        jsxStringProp("description", v.description),
        jsxStringProp("scopeText", v.scopeText),
        v.canBack ? "canBack" : "",
        v.bodyScroll === false ? "bodyScroll={false}" : "",
        v.modal === false ? "modal={false}" : "",
        v.dismissableMask ? "dismissableMask" : "",
        v.maximizable ? "maximizable" : "",
        v.closable === false ? "closable={false}" : "",
        v.closeOnEscape === false ? "closeOnEscape={false}" : "",
        `footer={\n      <>\n        <Button variant="text" severity="secondary" label="取消" onClick={() => setOpen(false)} />\n        <Button label="开始导出" onClick={() => setOpen(false)} />\n      </>\n    }`,
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["Button", "Dialog"],
        setup: [`const [open, setOpen] = useState(${Boolean(v.open)});`],
        jsx: `<>\n  <Button label="打开对话框" onClick={() => setOpen(true)} />\n  <Dialog\n    ${attrs.join("\n    ")}\n  >\n    <p>导出范围与版式可在下一步确认。</p>\n  </Dialog>\n</>`,
      });
    }

    case "form-field": {
      const headAttrs = [
        'inputId="demo-title"',
        `label=${JSON.stringify(String(v.label ?? ""))}`,
        jsxStringProp("hint", v.hint),
        jsxStringProp("error", v.error),
        v.required ? "required" : "",
      ].filter(Boolean);
      const inputAttrs = [
        "value={value}",
        "onValueChange={(next) => setValue(next ?? '')}",
        "id={inputId}",
        "aria-describedby={describedBy}",
        "invalid={invalid}",
        jsxStringProp("placeholder", v.placeholder),
        "fluid",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["FormField", "InputText"],
        setup: [`const [value, setValue] = useState(${JSON.stringify(String(v.value ?? ""))});`],
        jsx: `<FormField\n  ${headAttrs.join("\n  ")}\n>\n  {({ inputId, describedBy, invalid }) => (\n    <InputText\n      ${inputAttrs.join("\n      ")}\n    />\n  )}\n</FormField>`,
      });
    }

    case "hover-card": {
      const attrs = [
        v.placement && v.placement !== "top" ? `placement="${v.placement}"` : "",
        v.interactive === false ? "interactive={false}" : "",
        v.disabled ? "disabled" : "",
        'label="引用文献详情"',
      ].filter(Boolean);
      return buildTsx({
        ui: ["HoverCard"],
        jsx: `<HoverCard${attrs.length ? ` ${attrs.join(" ")}` : ""}
  content={
    <div style={{ display: "grid", gap: "var(--space-1-5)", padding: "var(--space-3)", width: 260 }}>
      <strong style={{ fontSize: "var(--type-caption-size)" }}>Zhang, L. et al. (2024)</strong>
      <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "var(--type-body-sm-size)" }}>
        锚定空间坐标系下的跨草稿引用一致性研究.
      </p>
      <span style={{ color: "var(--text-tertiary)", fontSize: "var(--type-micro-size)" }}>
        Nature · DOI 10.1038/s41586-024-07123-x
      </span>
    </div>
  }
>
  <span style={{ textDecoration: "underline dotted var(--text-tertiary)", cursor: "help" }}>
    Zhang et al., 2024
  </span>
</HoverCard>`,
      });
    }

    case "icon-field": {
      const iconName = String(v.icon ?? "Search");
      const inputAttrs = [
        "value={query}",
        "onValueChange={(next) => setQuery(next ?? '')}",
        jsxStringProp("placeholder", v.placeholder),
        "fluid",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["IconField", "InputIcon", "InputText"],
        lucide: [iconName],
        setup: [`const [query, setQuery] = useState(${JSON.stringify(String(v.query ?? ""))});`],
        jsx: `<IconField${v.size ? ` className="mw-size-${v.size}"` : ""} style={{ width: "min(300px, 100%)" }}>\n  <InputIcon><${iconName} /></InputIcon>\n  <InputText ${inputAttrs.join(" ")} />\n</IconField>`,
      });
    }

    case "image-lightbox": {
      const attrs = [
        "open={open}",
        "onOpenChange={setOpen}",
        'src="/figures/ablation.svg"',
        jsxStringProp("alt", v.alt),
        jsxStringProp("caption", v.caption),
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["Button", "ImageLightbox"],
        setup: [`const [open, setOpen] = useState(${Boolean(v.open)});`],
        jsx: `<>\n  <Button size="sm" severity="secondary" label="查看大图" onClick={() => setOpen(true)} />\n  <ImageLightbox\n    ${attrs.join("\n    ")}\n  />\n</>`,
      });
    }

    case "input-group": {
      const addon = v.prefix ? `  <InputGroupAddon>${v.prefix}</InputGroupAddon>\n` : "";
      const widthValue = v.fluid ? "100%" : "min(320px, 100%)";
      return buildTsx({
        react: ["useState"],
        ui: ["InputGroup", "InputGroupAddon", "InputText"],
        setup: [`const [doi, setDoi] = useState(${JSON.stringify(String(v.doi ?? ""))});`],
        jsx: `<InputGroup style={{ width: ${JSON.stringify(widthValue)} }}>\n${addon}  <InputText value={doi} onValueChange={(next) => setDoi(next ?? "")} fluid placeholder="10.1038/s41586-024-07123-x" />\n</InputGroup>`,
      });
    }

    case "listbox": {
      const venues = [
        { label: "NeurIPS 2025", value: "neurips" },
        { label: "ICML 2025", value: "icml" },
        { label: "ACL 2025", value: "acl" },
        { label: "CVPR 2025", value: "cvpr" },
      ];
      const attrs = [
        "value={venue}",
        "onValueChange={setVenue}",
        "options={venues}",
        'optionLabel="label"',
        'optionValue="value"',
        "listStyle={{ height: 172 }}",
        v.filter ? "filter" : "",
        v.invalid ? "invalid" : "",
        v.disabled ? "disabled" : "",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["Listbox"],
        moduleSetup: [
          "const venues = [",
          ...venues.map((o) => `  { label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} },`),
          "];",
        ],
        setup: [`const [venue, setVenue] = useState<string | null>(${JSON.stringify(v.venue ?? "neurips")});`],
        jsx: `<Listbox\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "menu": {
      return buildTsx({
        ui: ["Menu"],
        lucide: ["Copy", "Link2", "Pencil", "Share2", "Trash2"],
        moduleSetup: [
          "const items = [",
          '  { key: "rename", label: "重命名", icon: Pencil, shortcut: "F2" },',
          '  { key: "copy-link", label: "复制链接", icon: Link2, shortcut: "⌘C" },',
          '  { key: "duplicate", label: "创建副本", icon: Copy },',
          "  { separator: true },",
          '  { key: "share", label: "共享给协作成员", icon: Share2 },',
          '  { key: "remove", label: "移入回收站", icon: Trash2, danger: true },',
          "];",
        ],
        jsx: '<Menu model={items} ariaLabel="文档操作菜单" />',
      });
    }

    case "multi-select": {
      const parts = [
        { label: "正文", value: "body" },
        { label: "图注", value: "figures" },
        { label: "参考文献", value: "refs" },
        { label: "附录", value: "appendix" },
      ];
      const attrs = [
        "value={selected}",
        "onValueChange={setSelected}",
        "options={parts}",
        'optionLabel="label"',
        'optionValue="value"',
        v.display && v.display !== "comma" ? 'display="chip"' : "",
        v.maxSelectedLabels && v.maxSelectedLabels !== 3 ? `maxSelectedLabels={${v.maxSelectedLabels}}` : "",
        v.filter ? "filter" : "",
        v.showToggleAll ? "showToggleAll" : "",
        v.showClear ? "showClear" : "",
        v.size ? `size="${v.size}"` : "",
        v.fluid ? "fluid" : "",
        v.disabled ? "disabled" : "",
        'placeholder="选择导出部分"',
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["MultiSelect"],
        moduleSetup: [
          "const parts = [",
          ...parts.map((o) => `  { label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} },`),
          "];",
        ],
        setup: ['const [selected, setSelected] = useState<string[]>(["body", "figures"]);'],
        jsx: `<MultiSelect\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "page-header": {
      return buildTsx({
        ui: ["Button", "PageHeader"],
        lucide: ["FileText", "Plus"],
        jsx: `<PageHeader\n  title=${JSON.stringify(String(v.title ?? ""))}\n  icon={<FileText aria-hidden="true" />}\n  actions={<Button size="sm" label="新建草稿" icon={Plus} />}\n/>`,
      });
    }

    case "popover": {
      const attrs = [
        v.side && v.side !== "bottom" ? `side="${v.side}"` : "",
        v.align && v.align !== "start" ? `align="${v.align}"` : "",
        v.dismissable === false ? "dismissable={false}" : "",
      ].filter(Boolean);
      return buildTsx({
        ui: ["Button", "Popover"],
        jsx: `<Popover${attrs.length ? ` ${attrs.join(" ")}` : ""}
  ariaLabel="引用工具面板"
  trigger={({ toggle }) => (
    <Button size="sm" severity="secondary" label="引用工具" onClick={toggle} />
  )}
>
  <div style={{ display: "grid", gap: "var(--space-2)", padding: "var(--space-2)", width: 220 }}>
    <strong style={{ fontSize: "var(--type-caption-size)" }}>插入引用</strong>
    <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "var(--type-body-sm-size)" }}>
      从题录库选择条目，锚点随正文移动。
    </p>
  </div>
</Popover>`,
      });
    }

    case "radio-button": {
      const options = [
        { label: "APA 7th", value: "apa" },
        { label: "IEEE Numeric", value: "ieee" },
        { label: "GB/T 7714", value: "gbt" },
      ];
      const extra = [v.size && v.size !== "md" ? `size="${v.size}"` : "", v.disabled ? "disabled" : ""].filter(Boolean);
      const radioLines = options
        .map((o) => {
          const attrs = [
            `checked={style === ${JSON.stringify(o.value)}}`,
            `value=${JSON.stringify(o.value)}`,
            "onValueChange={(next) => setStyle(String(next))}",
            'name="cite-style"',
            `inputId="cite-${o.value}"`,
            ...extra,
          ].join(" ");
          return `  <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer" }}>\n    <RadioButton ${attrs} />\n    <span>${o.label}</span>\n  </label>`;
        })
        .join("\n");
      return buildTsx({
        react: ["useState"],
        ui: ["RadioButton"],
        setup: [`const [style, setStyle] = useState(${JSON.stringify(v.style ?? "apa")});`],
        jsx: `<div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}>\n${radioLines}\n</div>`,
      });
    }

    case "searchable-multi-select": {
      const tags = [
        { label: "机器学习", value: "ml" },
        { label: "气候建模", value: "climate" },
        { label: "蛋白质结构", value: "protein" },
        { label: "引力波", value: "gw" },
        { label: "量子计算", value: "quantum" },
      ];
      const attrs = [
        "value={picked}",
        "onValueChange={setPicked}",
        "options={tags}",
        'optionLabel="label"',
        'optionValue="value"',
        jsxStringProp("placeholder", v.placeholder),
        v.size ? `size="${v.size}"` : "",
        v.disabled ? "disabled" : "",
        v.invalid ? "invalid" : "",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["SearchableMultiSelect"],
        moduleSetup: [
          "const tags = [",
          ...tags.map((o) => `  { label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} },`),
          "];",
        ],
        setup: ['const [picked, setPicked] = useState<string[]>(["ml", "climate"]);'],
        jsx: `<SearchableMultiSelect\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "searchable-select": {
      const journals = [
        { label: "Nature", value: "nature" },
        { label: "Science", value: "science" },
        { label: "Cell", value: "cell" },
        { label: "PNAS", value: "pnas" },
        { label: "arXiv (cond-mat)", value: "arxiv" },
      ];
      const attrs = [
        "value={journal}",
        "onValueChange={setJournal}",
        "options={journals}",
        'optionLabel="label"',
        'optionValue="value"',
        jsxStringProp("placeholder", v.placeholder),
        v.showClear ? "showClear" : "",
        v.size ? `size="${v.size}"` : "",
        v.disabled ? "disabled" : "",
        v.invalid ? "invalid" : "",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["SearchableSelect"],
        moduleSetup: [
          "const journals = [",
          ...journals.map((o) => `  { label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} },`),
          "];",
        ],
        setup: [`const [journal, setJournal] = useState<string | null>(${JSON.stringify(v.journal ?? "nature")});`],
        jsx: `<SearchableSelect\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "select-button": {
      const alignments = [
        { label: "左对齐", value: "left" },
        { label: "居中", value: "center" },
        { label: "右对齐", value: "right" },
      ];
      const attrs = [
        "value={align}",
        "onValueChange={setAlign}",
        "options={alignments}",
        'optionLabel="label"',
        'optionValue="value"',
        v.size && v.size !== "md" ? `size="${v.size}"` : "",
        v.allowEmpty ? "allowEmpty" : "",
        v.disabled ? "disabled" : "",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["SelectButton"],
        moduleSetup: [
          "const alignments = [",
          ...alignments.map((o) => `  { label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} },`),
          "];",
        ],
        setup: [`const [align, setAlign] = useState<string | null>(${JSON.stringify(v.align ?? "left")});`],
        jsx: `<SelectButton\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "select": {
      const sections = [
        { label: "引言", value: "intro" },
        { label: "材料与方法", value: "methods" },
        { label: "实验结果", value: "results" },
        { label: "讨论", value: "discussion" },
        { label: "结论", value: "conclusion" },
      ];
      const attrs = [
        "value={section}",
        "onValueChange={setSection}",
        "options={sections}",
        'optionLabel="label"',
        'optionValue="value"',
        jsxStringProp("placeholder", v.placeholder),
        v.filter ? "filter" : "",
        v.showClear ? "showClear" : "",
        v.size ? `size="${v.size}"` : "",
        v.fluid ? "fluid" : "",
        v.disabled ? "disabled" : "",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["Select"],
        moduleSetup: [
          "const sections = [",
          ...sections.map((o) => `  { label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} },`),
          "];",
        ],
        setup: [`const [section, setSection] = useState<string | null>(${JSON.stringify(v.section ?? "methods")});`],
        jsx: `<Select\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "slider": {
      const attrs = [
        "value={value}",
        "onValueChange={(next) => setValue(typeof next === 'number' ? next : next[0] ?? 0)}",
        'ariaLabel="示例滑块"',
        Number(v.min) !== 0 ? `min={${v.min}}` : "",
        Number(v.max) !== 100 ? `max={${v.max}}` : "",
        typeof v.step === "number" && v.step > 0 ? `step={${v.step}}` : "",
        v.showTicks && typeof v.step === "number" && v.step > 0 ? "showTicks" : "",
        v.disabled ? "disabled" : "",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["Slider"],
        setup: [`const [value, setValue] = useState(${v.value ?? 40});`],
        jsx: `<Slider\n  style={{ width: "min(300px, 100%)" }}\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "stat-bar": {
      const attrs = [
        `label=${JSON.stringify(String(v.label ?? "剩余可用额度"))}`,
        `value=${JSON.stringify(String(v.value ?? "128,400"))}`,
        jsxStringProp("sub", v.sub),
        v.tone && v.tone !== "default" ? `tone="${v.tone}"` : "",
        jsxStringProp("actionLabel", v.actionLabel),
      ].filter(Boolean);
      return buildTsx({
        ui: ["StatCard"],
        jsx: `<StatCard\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "tabs": {
      const tabs = [
        { value: "draft", label: "草稿", badge: 3 },
        { value: "refs", label: "文献", badge: 28 },
        { value: "figures", label: "图表" },
        { value: "review", label: "审阅", disabled: true },
      ];
      const panelText: Record<string, string> = {
        draft: "正文按锚定空间存储，编辑提案经锚点写回。",
        refs: "28 处正文引用与题录库双向锚定。",
        figures: "图 1 架构总览 · 图 2 消融实验对比。",
      };
      const attrs = [
        "value={active}",
        "onValueChange={(next) => setActive(String(next))}",
        v.orientation && v.orientation !== "horizontal" ? 'orientation="vertical"' : "",
      ].filter(Boolean);
      const visibleTabs = v.hideWhenSingle ? tabs.slice(0, 1) : tabs;
      const listAttr = v.hideWhenSingle ? " hideWhenSingle" : "";
      const tabLines = visibleTabs
        .map(
          (item) =>
            `    <Tab value="${item.value}"${v.badge && item.badge !== undefined ? ` badge={${item.badge}}` : ""}${item.disabled ? " disabled" : ""}>${item.label}</Tab>`,
        )
        .join("\n");
      const panelLines = visibleTabs
        .filter((item) => !item.disabled)
        .map(
          (item) =>
            `    <TabPanel value="${item.value}">\n      <p className="doc-note">${panelText[item.value]}</p>\n    </TabPanel>`,
        )
        .join("\n");
      return buildTsx({
        react: ["useState"],
        ui: ["Tab", "TabList", "TabPanel", "TabPanels", "Tabs"],
        setup: [`const [active, setActive] = useState(${JSON.stringify(v.active ?? "draft")});`],
        jsx: `<Tabs\n  ${attrs.join("\n  ")}\n>\n  <TabList${listAttr}>\n${tabLines}\n  </TabList>\n  <TabPanels>\n${panelLines}\n  </TabPanels>\n</Tabs>`,
      });
    }

    case "toast": {
      const severities = ["success", "info", "warn", "error"] as const;
      const method = (severities as readonly string[]).includes(String(v.severity)) ? String(v.severity) : "success";
      return buildTsx({
        ui: ["Button", "ToastHost", "useNotify"],
        setup: ["const notify = useNotify();"],
        jsx: `<>\n  <ToastHost />\n  <Button\n    label="移入回收站"\n    onClick={() => notify.${method}(${JSON.stringify(v.summary ?? "")}, ${JSON.stringify(v.detail ?? "")})}\n  />\n</>`,
      });
    }

    case "tooltip": {
      const placement = String(v.placement ?? "top");
      const placementAttr = placement === "top" ? "" : ` placement="${placement}"`;
      return buildTsx({
        ui: ["Button", "Tooltip"],
        jsx: `<Tooltip content=${JSON.stringify(String(v.content ?? ""))}${placementAttr}>\n  <Button severity="secondary" size="sm" label="悬停查看提示" />\n</Tooltip>`,
      });
    }

    case "user-card": {
      const attrs = [
        "user={user}",
        v.size && v.size !== "medium" ? 'size="large"' : "",
      ].filter(Boolean);
      return buildTsx({
        ui: ["UserCard", "type UserProfile"],
        moduleSetup: [
          "const user: UserProfile = {",
          '  id: "u-gu",',
          '  handle: "@zhiyao",',
          '  name: "顾之遥",',
          '  email: "zhiyao.gu@mango.dev",',
          '  role: "通讯作者",',
          '  description: "凝聚态理论与计算材料学方向，负责课题的整体设计与论文定稿。",',
          "};",
        ],
        jsx: `<UserCard\n  style={{ width: "min(320px, 100%)" }}\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "user-chip": {
      const attrs = [
        "user={user}",
        v.variant && v.variant !== "text" ? `variant="${v.variant}"` : "",
        v.size ? `size="${v.size}"` : "",
        v.showCard ? "showCard" : "",
      ].filter(Boolean);
      return buildTsx({
        ui: ["UserChip", "type UserProfile"],
        moduleSetup: [
          "const user: UserProfile = {",
          '  id: "u-lin",',
          '  handle: "@linwq",',
          '  name: "林晚晴",',
          '  email: "wanqing.lin@mango.dev",',
          '  role: "共同作者",',
          "};",
        ],
        jsx: `<UserChip\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "user-select": {
      const members = [
        { id: "u-lin", name: "林晚晴", email: "wanqing.lin@mango.dev" },
        { id: "u-gu", name: "顾之遥", email: "zhiyao.gu@mango.dev" },
        { id: "u-sen", name: "森下知惠", email: "tomoe.morishita@mango.dev" },
        { id: "u-hart", name: "Jonas Hart", email: "jonas.hart@mango.dev" },
      ];
      const attrs = [
        "value={assignees}",
        "onValueChange={setAssignees}",
        "users={members}",
        jsxStringProp("placeholder", v.placeholder),
        v.disabled ? "disabled" : "",
      ].filter(Boolean);
      return buildTsx({
        react: ["useState"],
        ui: ["UserSelect", "type UserSelectOption"],
        moduleSetup: [
          "const members: UserSelectOption[] = [",
          ...members.map((m) => `  { id: ${JSON.stringify(m.id)}, name: ${JSON.stringify(m.name)}, email: ${JSON.stringify(m.email)} },`),
          "];",
        ],
        setup: ['const [assignees, setAssignees] = useState<string[]>(["u-lin"]);'],
        jsx: `<UserSelect\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "app-logo": {
      return buildTsx({
        ui: ["AppLogo"],
        jsx: `<AppLogo${v.markOnly ? " markOnly" : ""} style={{ height: 32 }} />`,
      });
    }

    case "not-found-page": {
      const attrs = [
        jsxStringProp("title", v.title ?? "页面走丢了"),
        jsxStringProp("lead", v.lead ?? "草稿可能已移入回收站或没有访问权限。"),
        jsxStringProp("path", v.path),
        jsxStringProp("primaryLabel", v.primaryLabel ?? "返回工作台"),
        jsxStringProp("secondaryLabel", v.secondaryLabel),
      ].filter(Boolean);
      return buildTsx({
        ui: ["NotFoundPage"],
        jsx: `<NotFoundPage\n  ${attrs.join("\n  ")}\n/>`,
      });
    }

    case "site": {
      const headerAttrs = [
        "items={items}",
        v.showLang === false ? "showLang={false}" : "showLang",
        v.langLabel && v.langLabel !== "EN" ? jsxStringProp("langLabel", v.langLabel) : "",
        'actions={<Button size="sm" label="进入工作台" />}',
      ].filter(Boolean);
      const footerAttr = v.locale && v.locale !== "zh-CN" ? ` locale=${JSON.stringify(v.locale)}` : "";
      return buildTsx({
        ui: ["Button", "SiteFooter", "SiteHeader"],
        moduleSetup: [
          "const items = [",
          '  { label: "功能", href: "#features", active: true },',
          '  { label: "价格", href: "#pricing" },',
          '  { label: "文档", href: "#docs" },',
          "];",
        ],
        jsx: `<>\n  <SiteHeader\n    ${headerAttrs.join("\n    ")}\n  />\n  <SiteFooter${footerAttr}>\n    <a href="#terms">服务条款</a>\n    <a href="#privacy">隐私政策</a>\n  </SiteFooter>\n</>`,
      });
    }

    default:
      return null;
  }
}

/**
 * 兜底转换器：用于单测或未注册自定义 entry.code 的 SFC → React TSX 转换。
 */
export function convertSfcToTsxFallback(vueSfc: string): string {
  const scriptMatch = vueSfc.match(/<script setup[^>]*>([\s\S]*?)<\/script>/);
  const templateMatch = vueSfc.match(/<template>([\s\S]*?)<\/template>/);

  const rawScript = scriptMatch ? scriptMatch[1].trim() : "";
  const rawTemplate = templateMatch ? templateMatch[1] : vueSfc;

  const uiImports: string[] = [];
  const lucideImports: string[] = [];
  const setupLines: string[] = [];
  let needsUseState = false;

  for (const line of rawScript.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const vueImp = trimmed.match(/^import\s*\{([^}]+)\}\s*from\s*["']vue["'];?$/);
    if (vueImp) continue;
    const uiImp = trimmed.match(/^import\s*\{([^}]+)\}\s*from\s*["']@mango-write\/ui-vue["'];?$/);
    if (uiImp) {
      for (const sym of uiImp[1].split(",").map((s) => s.trim()).filter(Boolean)) {
        uiImports.push(sym === "vTooltip" ? "Tooltip" : sym);
      }
      continue;
    }
    const lucideImp = trimmed.match(/^import\s*\{([^}]+)\}\s*from\s*["']lucide-vue-next["'];?$/);
    if (lucideImp) {
      for (const sym of lucideImp[1].split(",").map((s) => s.trim()).filter(Boolean)) {
        lucideImports.push(sym);
      }
      continue;
    }
    const refDecl = trimmed.match(/^const\s+([A-Za-z_$][\w$]*)\s*=\s*ref(?:<([^>]+)>)?\(([\s\S]*)\);$/);
    if (refDecl) {
      needsUseState = true;
      const [, name, typeArg, initVal] = refDecl;
      const setter = `set${name.charAt(0).toUpperCase()}${name.slice(1)}`;
      setupLines.push(`const [${name}, ${setter}] = useState${typeArg ? `<${typeArg}>` : ""}(${initVal});`);
      continue;
    }
    setupLines.push(trimmed);
  }

  const deindented = rawTemplate
    .replace(/^\n+|\n+$/g, "")
    .split("\n")
    .map((line) => (line.startsWith("  ") ? line.slice(2) : line))
    .join("\n")
    .replace(
      /\bv-model(?::([A-Za-z-]+))?="([^"]+)"/g,
      (_m, arg: string | undefined, varName: string) => {
        needsUseState = true;
        const setter = `set${varName.charAt(0).toUpperCase()}${varName.slice(1)}`;
        if (arg === "open" || arg === "visible") return `open={${varName}} onOpenChange={${setter}}`;
        if (arg === "first") return `first={${varName}} onFirstChange={${setter}}`;
        if (arg === "checked") return `checked={${varName}} onCheckedChange={${setter}}`;
        return `value={${varName}} onValueChange={${setter}}`;
      },
    )
    .replace(/\bclass="/g, 'className="')
    .replace(/:([A-Za-z][A-Za-z0-9-]*)="([^"]+)"/g, (_m, rawProp: string, expr: string) => {
      const prop =
        rawProp.startsWith("aria-") || rawProp.startsWith("data-")
          ? rawProp
          : rawProp.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());
      return `${prop}={${expr}}`;
    })
    .replace(/@click="([^"]+)"/g, (_m, handler: string) =>
      /^[A-Za-z_$][\w$]*$/.test(handler.trim())
        ? `onClick={${handler.trim()}}`
        : `onClick={() => { ${handler.trim()}; }}`,
    );

  return buildTsx({
    react: needsUseState ? ["useState"] : [],
    ui: uiImports,
    lucide: lucideImports,
    setup: setupLines,
    jsx: deindented,
  });
}
