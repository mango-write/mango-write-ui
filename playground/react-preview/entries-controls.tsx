import { useEffect, useState } from "react";
import {
  AtSign,
  Calendar as CalendarIcon,
  Download,
  Filter,
  Plus,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  AsyncSearchSelect,
  Button,
  Calendar,
  Checkbox,
  ColorPicker,
  DatePicker,
  FileDropZone,
  FormField,
  IconField,
  InputGroup,
  InputGroupAddon,
  InputIcon,
  InputNumber,
  InputText,
  Listbox,
  MultiSelect,
  RadioButton,
  SearchableMultiSelect,
  SearchableSelect,
  Select,
  SelectButton,
  Slider,
  Textarea,
  ToggleSwitch,
  UserSelect,
  type AsyncSearchOption,
  type ButtonIconComponent,
  type ButtonSeverity,
  type ButtonSize,
  type ButtonVariant,
  type CalendarModelValue,
  type CalendarSelectionMode,
  type CheckboxSize,
  type ColorPickerFormat,
  type DatePickerHourFormat,
  type DatePickerModelValue,
  type DatePickerSelectionMode,
  type FileDropZoneSurface,
  type InputNumberSize,
  type InputTextSize,
  type MultiSelectDisplay,
  type MultiSelectSize,
  type RadioButtonSize,
  type SearchableMultiSelectSize,
  type SearchableSelectSize,
  type SelectButtonSize,
  type SelectSize,
  type UserSelectOption,
} from "@mango-write/ui-react";
import type { ReactEntryRenderer, ReactPreviewContext } from "./types";

const BUTTON_ICONS: Record<string, ButtonIconComponent> = {
  Plus,
  Sparkles,
  Filter,
  Download,
  Settings,
};

const FIELD_ICONS = {
  Search,
  AtSign,
  Calendar: CalendarIcon,
} as const;

const ALIGNMENTS = [
  { label: "左对齐", value: "left" },
  { label: "居中", value: "center" },
  { label: "右对齐", value: "right" },
];

const RADIO_OPTIONS = [
  { label: "APA 7th", value: "apa" },
  { label: "IEEE Numeric", value: "ieee" },
  { label: "GB/T 7714", value: "gbt" },
];

const SECTIONS = [
  { label: "引言", value: "intro" },
  { label: "材料与方法", value: "methods" },
  { label: "实验结果", value: "results" },
  { label: "讨论", value: "discussion" },
  { label: "结论", value: "conclusion" },
];

const PARTS = [
  { label: "正文", value: "body" },
  { label: "图注", value: "figures" },
  { label: "参考文献", value: "refs" },
  { label: "附录", value: "appendix" },
];

const VENUES = [
  { label: "NeurIPS 2025", value: "neurips" },
  { label: "ICML 2025", value: "icml" },
  { label: "ACL 2025", value: "acl" },
  { label: "CVPR 2025", value: "cvpr" },
];

const JOURNALS = [
  { label: "Nature", value: "nature" },
  { label: "Science", value: "science" },
  { label: "Cell", value: "cell" },
  { label: "PNAS", value: "pnas" },
  { label: "arXiv (cond-mat)", value: "arxiv" },
];

const TAG_OPTIONS = [
  { label: "机器学习", value: "ml" },
  { label: "气候建模", value: "climate" },
  { label: "蛋白质结构", value: "protein" },
  { label: "引力波", value: "gw" },
  { label: "量子计算", value: "quantum" },
];

const CORPUS: AsyncSearchOption[] = [
  { value: "10.1038/s41586-024-07123-x", label: "Nature · 2024 · 深度学习蛋白质设计" },
  { value: "10.1126/science.adk9587", label: "Science · 2024 · 常温超导体制备" },
  { value: "10.1016/j.cell.2024.05.012", label: "Cell · 2024 · 单细胞时空组学" },
  { value: "10.1103/PhysRevLett.132.191601", label: "PRL · 2024 · 引力波记忆效应" },
];

const MEMBERS: UserSelectOption[] = [
  { id: "u-lin", name: "林晚晴", email: "wanqing.lin@mango.dev" },
  { id: "u-gu", name: "顾之遥", email: "zhiyao.gu@mango.dev" },
  { id: "u-sen", name: "森下知惠", email: "tomoe.morishita@mango.dev" },
  { id: "u-hart", name: "Jonas Hart", email: "jonas.hart@mango.dev" },
];

async function searchCorpus(query: string): Promise<AsyncSearchOption[]> {
  await new Promise((resolve) => setTimeout(resolve, 260));
  const q = query.trim().toLowerCase();
  if (!q) return CORPUS;
  return CORPUS.filter((o) => o.label.toLowerCase().includes(q) || o.value.includes(q));
}

function MultiSelectDemo({ ctx }: { ctx: ReactPreviewContext }) {
  const [selected, setSelected] = useState<string[]>(["body", "figures"]);
  const v = ctx.values;
  return (
    <MultiSelect
      options={PARTS}
      optionLabel="label"
      optionValue="value"
      value={selected}
      onValueChange={setSelected}
      display={(v.display as MultiSelectDisplay | undefined) ?? "comma"}
      maxSelectedLabels={typeof v.maxSelectedLabels === "number" ? v.maxSelectedLabels : 3}
      filter={Boolean(v.filter)}
      showToggleAll={Boolean(v.showToggleAll)}
      showClear={Boolean(v.showClear)}
      size={v.size as MultiSelectSize | undefined}
      fluid={v.fluid !== false}
      disabled={Boolean(v.disabled)}
      placeholder="选择导出部分"
      ariaLabel="导出部分"
      style={{ width: "min(300px, 100%)" }}
    />
  );
}

function SearchableMultiSelectDemo({ ctx }: { ctx: ReactPreviewContext }) {
  const [picked, setPicked] = useState<string[]>(["ml", "climate"]);
  const v = ctx.values;
  return (
    <SearchableMultiSelect
      options={TAG_OPTIONS}
      optionLabel="label"
      optionValue="value"
      value={picked}
      onValueChange={setPicked}
      placeholder={typeof v.placeholder === "string" ? v.placeholder : "检索并选择研究方向"}
      size={v.size as SearchableMultiSelectSize | undefined}
      disabled={Boolean(v.disabled)}
      invalid={Boolean(v.invalid)}
      ariaLabel="研究方向"
      style={{ width: "min(300px, 100%)" }}
    />
  );
}

function AsyncSearchSelectDemo({ ctx }: { ctx: ReactPreviewContext }) {
  const [doi, setDoi] = useState<string | null>(null);
  const v = ctx.values;
  return (
    <AsyncSearchSelect
      value={doi}
      onValueChange={setDoi}
      search={searchCorpus}
      placeholder={typeof v.placeholder === "string" ? v.placeholder : "输入 DOI 或标题关键词"}
      showClear={v.showClear !== false}
      fluid={v.fluid !== false}
      disabled={Boolean(v.disabled)}
      ariaLabel="远程检索文献"
      style={{ width: v.fluid !== false ? "min(320px, 100%)" : undefined }}
    />
  );
}

function UserSelectDemo({ ctx }: { ctx: ReactPreviewContext }) {
  const [assignees, setAssignees] = useState<string[]>(["u-lin"]);
  const v = ctx.values;
  return (
    <UserSelect
      value={assignees}
      onValueChange={setAssignees}
      users={MEMBERS}
      placeholder={typeof v.placeholder === "string" ? v.placeholder : undefined}
      disabled={Boolean(v.disabled)}
      ariaLabel="指派协作成员"
      style={{ width: "min(300px, 100%)" }}
    />
  );
}

function CalendarDemo({ ctx }: { ctx: ReactPreviewContext }) {
  const mode = ((ctx.values.selectionMode as CalendarSelectionMode | undefined) ?? "single");
  const [date, setDate] = useState<CalendarModelValue>(() => new Date(2026, 10, 12));
  useEffect(() => {
    if (mode === "single") setDate(new Date(2026, 10, 12));
    else if (mode === "range") setDate([new Date(2026, 10, 10), new Date(2026, 10, 14)]);
    else setDate([new Date(2026, 10, 12)]);
  }, [mode]);
  const v = ctx.values;
  const firstDow = Number(v.firstDayOfWeek ?? 1) === 0 ? 0 : 1;
  return (
    <Calendar
      value={date}
      onValueChange={(next) => setDate(next)}
      selectionMode={mode}
      firstDayOfWeek={firstDow}
      showTodayShortcut={v.showTodayShortcut !== false}
      fluid={Boolean(v.fluid)}
      disabled={Boolean(v.disabled)}
      ariaLabel="日期面板"
    />
  );
}

function DatePickerDemo({ ctx }: { ctx: ReactPreviewContext }) {
  const mode = ((ctx.values.selectionMode as DatePickerSelectionMode | undefined) ?? "single");
  const [date, setDate] = useState<DatePickerModelValue>(() => new Date(2026, 10, 12));
  useEffect(() => {
    if (mode === "single") setDate(new Date(2026, 10, 12));
    else if (mode === "range") setDate([new Date(2026, 10, 10), new Date(2026, 10, 14)]);
    else setDate([new Date(2026, 10, 12)]);
  }, [mode]);
  const v = ctx.values;
  return (
    <DatePicker
      value={date}
      onValueChange={(next) => setDate(next)}
      selectionMode={mode}
      placeholder={typeof v.placeholder === "string" ? v.placeholder : "选择投稿日期"}
      showTime={Boolean(v.showTime)}
      hourFormat={((v.hourFormat as DatePickerHourFormat | undefined) ?? "24")}
      showIcon={Boolean(v.showIcon)}
      showClear={Boolean(v.showClear)}
      showButtonBar={Boolean(v.showButtonBar)}
      fluid={Boolean(v.fluid)}
      disabled={Boolean(v.disabled)}
      ariaLabel="投稿日期"
    />
  );
}

export const CONTROL_REACT_ENTRIES: Record<string, ReactEntryRenderer> = {
  button: ({ values: v }) => {
    const Icon = typeof v.icon === "string" ? BUTTON_ICONS[v.icon] : undefined;
    const labelText = typeof v.label === "string" ? v.label : "保存修改";
    return (
      <Button
        severity={(v.severity as ButtonSeverity | undefined) ?? "primary"}
        variant={(v.variant as ButtonVariant | undefined) ?? "filled"}
        size={(v.size as ButtonSize | undefined) ?? "md"}
        icon={Icon}
        rounded={Boolean(v.rounded)}
        loading={Boolean(v.loading)}
        disabled={Boolean(v.disabled)}
      >
        {labelText || undefined}
      </Button>
    );
  },

  checkbox: ({ values: v, setValue }) => (
    <Checkbox
      binary
      aria-label="导出附件"
      checked={Boolean(v.checked)}
      onCheckedChange={(next) => setValue("checked", next)}
      size={(v.size as CheckboxSize | undefined) ?? "md"}
      indeterminate={Boolean(v.indeterminate)}
      invalid={Boolean(v.invalid)}
      disabled={Boolean(v.disabled)}
    />
  ),

  "radio-button": ({ values: v, setValue }) => {
    const active = typeof v.style === "string" ? v.style : "apa";
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}>
        {RADIO_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              cursor: v.disabled ? "not-allowed" : "pointer",
            }}
          >
            <RadioButton
              name="cite-style"
              inputId={`cite-${opt.value}`}
              value={opt.value}
              checked={active === opt.value}
              onValueChange={(next) => setValue("style", String(next))}
              size={(v.size as RadioButtonSize | undefined) ?? "md"}
              disabled={Boolean(v.disabled)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    );
  },

  "toggle-switch": ({ values: v, setValue }) => (
    <ToggleSwitch
      aria-label="自动保存"
      checked={Boolean(v.autosave)}
      onCheckedChange={(next) => setValue("autosave", next)}
      invalid={Boolean(v.invalid)}
      disabled={Boolean(v.disabled)}
    />
  ),

  "select-button": ({ values: v, setValue }) => (
    <SelectButton
      options={ALIGNMENTS}
      optionLabel="label"
      optionValue="value"
      value={typeof v.align === "string" ? v.align : "left"}
      onValueChange={(next) => setValue("align", typeof next === "string" ? next : undefined)}
      size={(v.size as SelectButtonSize | undefined) ?? "md"}
      allowEmpty={Boolean(v.allowEmpty)}
      disabled={Boolean(v.disabled)}
      ariaLabel="对齐方式"
    />
  ),

  "input-text": ({ values: v, setValue }) => (
    <InputText
      value={typeof v.title === "string" ? v.title : ""}
      onValueChange={(next) => setValue("title", next)}
      placeholder={typeof v.placeholder === "string" ? v.placeholder : "输入论文标题"}
      type={typeof v.type === "string" ? v.type : "text"}
      size={v.size as InputTextSize | undefined}
      fluid={Boolean(v.fluid)}
      invalid={Boolean(v.invalid)}
      disabled={Boolean(v.disabled)}
      aria-label="论文标题"
    />
  ),

  textarea: ({ values: v, setValue }) => (
    <Textarea
      value={typeof v.abstract === "string" ? v.abstract : ""}
      onValueChange={(next) => setValue("abstract", next)}
      placeholder={typeof v.placeholder === "string" ? v.placeholder : "输入摘要"}
      rows={typeof v.rows === "number" ? v.rows : 3}
      autoResize={Boolean(v.autoResize)}
      fluid={v.fluid !== false}
      invalid={Boolean(v.invalid)}
      disabled={Boolean(v.disabled)}
      aria-label="摘要"
    />
  ),

  "input-number": ({ values: v, setValue }) => (
    <InputNumber
      value={typeof v.count === "number" ? v.count : 3}
      onValueChange={(next) => setValue("count", next ?? undefined)}
      size={v.size as InputNumberSize | undefined}
      suffix={typeof v.suffix === "string" && v.suffix ? v.suffix : undefined}
      showButtons={Boolean(v.showButtons)}
      fluid={Boolean(v.fluid)}
      disabled={Boolean(v.disabled)}
      ariaLabel="数值输入"
    />
  ),

  "icon-field": ({ values: v, setValue }) => {
    const iconName = (typeof v.icon === "string" && v.icon in FIELD_ICONS
      ? v.icon
      : "Search") as keyof typeof FIELD_ICONS;
    const Icon = FIELD_ICONS[iconName];
    return (
      <IconField
        className={v.size ? `mw-size-${v.size}` : undefined}
        style={{ width: "min(300px, 100%)" }}
      >
        <InputIcon>
          <Icon />
        </InputIcon>
        <InputText
          value={typeof v.query === "string" ? v.query : ""}
          onValueChange={(next) => setValue("query", next)}
          placeholder={typeof v.placeholder === "string" ? v.placeholder : "搜索文献"}
          fluid
          aria-label="示例输入框"
        />
      </IconField>
    );
  },

  "input-group": ({ values: v, setValue }) => (
    <InputGroup style={{ width: v.fluid ? "100%" : "min(320px, 100%)" }}>
      {v.prefix ? <InputGroupAddon>{String(v.prefix)}</InputGroupAddon> : null}
      <InputText
        value={typeof v.doi === "string" ? v.doi : ""}
        onValueChange={(next) => setValue("doi", next)}
        fluid
        placeholder="10.1038/s41586-024-07123-x"
        aria-label="DOI 编号"
      />
    </InputGroup>
  ),

  "form-field": ({ values: v, setValue }) => (
    <div style={{ width: "min(320px, 100%)" }}>
      <FormField
        inputId="demo-title"
        label={typeof v.label === "string" ? v.label : "论文标题"}
        hint={typeof v.hint === "string" ? v.hint : undefined}
        error={typeof v.error === "string" ? v.error : undefined}
        required={Boolean(v.required)}
      >
        {({ inputId, describedBy, invalid }) => (
          <InputText
            id={inputId}
            value={typeof v.value === "string" ? v.value : ""}
            onValueChange={(next) => setValue("value", next)}
            aria-describedby={describedBy}
            invalid={invalid}
            placeholder={typeof v.placeholder === "string" ? v.placeholder : "输入标题"}
            fluid
          />
        )}
      </FormField>
    </div>
  ),

  select: ({ values: v, setValue }) => (
    <Select
      options={SECTIONS}
      optionLabel="label"
      optionValue="value"
      value={typeof v.section === "string" ? v.section : null}
      onValueChange={(next) => setValue("section", typeof next === "string" ? next : undefined)}
      placeholder={typeof v.placeholder === "string" ? v.placeholder : "选择章节"}
      filter={Boolean(v.filter)}
      showClear={Boolean(v.showClear)}
      size={v.size as SelectSize | undefined}
      fluid={v.fluid !== false}
      disabled={Boolean(v.disabled)}
      ariaLabel="选择章节"
      style={{ width: v.fluid !== false ? "min(280px, 100%)" : undefined }}
    />
  ),

  "multi-select": (ctx) => <MultiSelectDemo ctx={ctx} />,

  listbox: ({ values: v, setValue }) => (
    <Listbox
      options={VENUES}
      optionLabel="label"
      optionValue="value"
      value={typeof v.venue === "string" ? v.venue : null}
      onValueChange={(next) => setValue("venue", typeof next === "string" ? next : undefined)}
      listStyle={{ height: 172 }}
      filter={Boolean(v.filter)}
      invalid={Boolean(v.invalid)}
      disabled={Boolean(v.disabled)}
      ariaLabel="目标会议"
      style={{ width: "min(260px, 100%)" }}
    />
  ),

  "searchable-select": ({ values: v, setValue }) => (
    <SearchableSelect
      options={JOURNALS}
      optionLabel="label"
      optionValue="value"
      value={typeof v.journal === "string" ? v.journal : null}
      onValueChange={(next) => setValue("journal", typeof next === "string" ? next : undefined)}
      placeholder={typeof v.placeholder === "string" ? v.placeholder : "检索期刊"}
      showClear={v.showClear !== false}
      size={v.size as SearchableSelectSize | undefined}
      disabled={Boolean(v.disabled)}
      invalid={Boolean(v.invalid)}
      ariaLabel="目标期刊"
      style={{ width: "min(280px, 100%)" }}
    />
  ),

  "searchable-multi-select": (ctx) => <SearchableMultiSelectDemo ctx={ctx} />,
  "async-search-select": (ctx) => <AsyncSearchSelectDemo ctx={ctx} />,
  "user-select": (ctx) => <UserSelectDemo ctx={ctx} />,

  slider: ({ values: v, setValue }) => {
    const stepVal = typeof v.step === "number" && v.step > 0 ? v.step : undefined;
    return (
      <Slider
        value={typeof v.value === "number" ? v.value : 40}
        onValueChange={(next) => setValue("value", typeof next === "number" ? next : next[0])}
        min={typeof v.min === "number" ? v.min : 0}
        max={typeof v.max === "number" ? v.max : 100}
        step={stepVal}
        showTicks={Boolean(v.showTicks) && Boolean(stepVal)}
        disabled={Boolean(v.disabled)}
        ariaLabel="示例滑块"
        style={{ width: "min(300px, 100%)" }}
      />
    );
  },

  calendar: (ctx) => <CalendarDemo ctx={ctx} />,
  "date-picker": (ctx) => <DatePickerDemo ctx={ctx} />,

  "color-picker": ({ values: v, setValue }) => (
    <ColorPicker
      value={typeof v.color === "string" ? v.color : "#7c6cf6"}
      onValueChange={(next) => setValue("color", next)}
      format={(v.format as ColorPickerFormat | undefined) ?? "hex"}
      inline={Boolean(v.inline)}
      disabled={Boolean(v.disabled)}
      ariaLabel="主题色选择"
    />
  ),

  "file-drop-zone": ({ values: v }) => (
    <FileDropZone
      accept={typeof v.accept === "string" ? v.accept : undefined}
      multiple={Boolean(v.multiple)}
      surface={(v.surface as FileDropZoneSurface | undefined) ?? "solid"}
      bare={Boolean(v.bare)}
      plain={Boolean(v.plain)}
      disabled={Boolean(v.disabled)}
    />
  ),
};
