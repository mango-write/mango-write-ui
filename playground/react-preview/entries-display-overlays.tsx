import { useState } from "react";
import {
  Bookmark,
  Check,
  Copy,
  FileText,
  Link2,
  Pencil,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  ActionMenu,
  AdminBoardPage,
  AdminBoardSection,
  AdminConfigPage,
  AdminDetailPage,
  AdminListPage,
  AppLogo,
  AsyncSlot,
  Avatar,
  Badge,
  Button,
  Chip,
  Column,
  ConfigRow,
  ConfigSection,
  DataTable,
  Dialog,
  HoverCard,
  ImageLightbox,
  InputNumber,
  InputText,
  Menu,
  Message,
  NotFoundPage,
  PageHeader,
  Paginator,
  Popover,
  ProgressBar,
  ProgressSpinner,
  SiteFooter,
  SiteHeader,
  Skeleton,
  StatBar,
  StatCard,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  ToggleSwitch,
  Tooltip,
  UserCard,
  UserChip,
  type AsyncSlotSkeleton,
  type AsyncSlotStatus,
  type AvatarShape,
  type AvatarSize,
  type BadgeSeverity,
  type BadgeSize,
  type ChipIconComponent,
  type ConfigRowStatusTone,
  type DialogSize,
  type HoverCardPlacement,
  type MessageSeverity,
  type PopoverAlign,
  type PopoverSide,
  type ProgressBarMode,
  type SkeletonAnimation,
  type SkeletonShape,
  type StatTone,
  type TagIconComponent,
  type TagSeverity,
  type ToastSeverity,
  type UserChipSize,
  type UserChipVariant,
  type UserProfile,
} from "@mango-write/ui-react";
import type { ReactEntryRenderer, ReactPreviewContext } from "./types";

const CHIP_ICONS: Record<string, ChipIconComponent> = {
  FileText,
  Sparkles,
};

const TAG_ICONS: Record<string, TagIconComponent> = {
  Check,
  Bookmark,
  Zap,
};

const PAPERS = [
  { id: 1, title: "引文锚点研究", venue: "Nature", cited: 12 },
  { id: 2, title: "协同编辑一致性", venue: "CHI", cited: 8 },
  { id: 3, title: "锚定空间坐标系", venue: "UIST", cited: 5 },
];

const USER_CARD_PROFILE: UserProfile = {
  id: "u-gu",
  handle: "@zhiyao",
  name: "顾之遥",
  email: "zhiyao.gu@mango.dev",
  role: "通讯作者",
  description: "凝聚态理论与计算材料学方向，负责课题的整体设计与论文定稿。",
};

const USER_CHIP_PROFILE: UserProfile = {
  id: "u-lin",
  handle: "@linwq",
  name: "林晚晴",
  email: "wanqing.lin@mango.dev",
  role: "共同作者",
};

const DEMO_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e8e4dc"/><circle cx="200" cy="180" r="90" fill="#7c6cf6" opacity="0.55"/><rect x="300" y="120" width="240" height="160" rx="12" fill="#2f3a4a" opacity="0.8"/><text x="32" y="392" font-family="sans-serif" font-size="18" fill="#5b564e">图 1 · 消融实验对比</text></svg>`,
  );

const MENU_ITEMS = [
  { key: "rename", label: "重命名", icon: Pencil, shortcut: "F2" },
  { key: "copy-link", label: "复制链接", icon: Link2, shortcut: "⌘C" },
  { key: "duplicate", label: "创建副本", icon: Copy },
  { separator: true },
  { key: "share", label: "共享给协作成员", icon: Share2 },
  { key: "remove", label: "移入回收站", icon: Trash2, danger: true },
];

const ACTION_MENU_ITEMS = [
  { key: "rename", label: "重命名", icon: Pencil },
  { key: "share", label: "共享", icon: Share2 },
  { separator: true },
  { key: "remove", label: "删除", icon: Trash2, danger: true },
];

const ACCORDION_PANELS = [
  { value: "meta", title: "题录元数据", text: "DOI: 10.1038/s41586-026-00001-x · 期刊：Nature" },
  { value: "export", title: "导出格式设置", text: "目标模板：ACM sigconf · 参考文献样式：BibTeX" },
  { value: "locked", title: "团队归档策略（管理员）", text: "仅团队管理员可修改。", disabled: true },
];

const TAB_ITEMS = [
  { value: "draft", label: "草稿", badge: 3 },
  { value: "refs", label: "文献", badge: 28 },
  { value: "figures", label: "图表" },
  { value: "review", label: "审阅", disabled: true },
];

const TAB_PANELS_TEXT: Record<string, string> = {
  draft: "正文按锚定空间存储，编辑提案经锚点写回。",
  refs: "28 处正文引用与题录库双向锚定。",
  figures: "图 1 架构总览 · 图 2 消融实验对比。",
};

const ADMIN_ROWS = [
  { id: "usr_01", name: "林知夏 (lin@tsinghua.edu.cn)", plan: "Pro", quota: "128,400", status: "正常" },
  { id: "usr_02", name: "陈怀瑾 (chen@pku.edu.cn)", plan: "Team", quota: "512,000", status: "正常" },
  { id: "usr_03", name: "周予安 (zhou@zju.edu.cn)", plan: "Free", quota: "15,000", status: "受限" },
  { id: "usr_04", name: "宋清如 (song@fudan.edu.cn)", plan: "Pro", quota: "96,000", status: "正常" },
  { id: "usr_05", name: "顾北辰 (gu@sjtu.edu.cn)", plan: "Team", quota: "410,500", status: "正常" },
  { id: "usr_06", name: "温书意 (wen@ustc.edu.cn)", plan: "Pro", quota: "84,900", status: "正常" },
];

const ADMIN_STATS = [
  { label: "总用户数", value: "12,840", sub: "较上周 +4.2%" },
  { label: "今日活跃", value: "1,429", tone: "accent" as const, sub: "峰值 14:00" },
  { label: "队列积压", value: 0, tone: "success" as const, sub: "全部健康" },
  { label: "异常告警", value: 2, tone: "warning" as const, sub: "待核查" },
];

function ConfigSectionDemo({ ctx }: { ctx: ReactPreviewContext }) {
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [dailyTokens, setDailyTokens] = useState<number | null>(50000);
  const v = ctx.values;
  return (
    <ConfigSection
      title={typeof v.title === "string" && v.title ? v.title : undefined}
      style={{ width: "100%" }}
    >
      <ConfigRow
        label="开放自助注册"
        keyHint="auth.signup_enabled"
        hint="关闭后仅受邀链接可注册新账号。"
      >
        <ToggleSwitch checked={signupEnabled} onCheckedChange={setSignupEnabled} />
      </ConfigRow>
      <ConfigRow
        label={typeof v.label === "string" ? v.label : "免费档日配额上限"}
        keyHint={typeof v.keyHint === "string" && v.keyHint ? v.keyHint : undefined}
        hint={typeof v.hint === "string" && v.hint ? v.hint : undefined}
        status={typeof v.status === "string" && v.status ? v.status : undefined}
        statusTone={(v.statusTone as ConfigRowStatusTone | undefined) ?? "muted"}
      >
        <InputNumber value={dailyTokens} onValueChange={setDailyTokens} min={0} step={5000} />
      </ConfigRow>
    </ConfigSection>
  );
}

function AdminShellDemo({ ctx }: { ctx: ReactPreviewContext }) {
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [dailyTokens, setDailyTokens] = useState<number | null>(50000);
  const [concurrency, setConcurrency] = useState<number | null>(4);
  const [activeTab, setActiveTab] = useState("orders");
  const [query, setQuery] = useState("");
  const [first, setFirst] = useState(0);

  const shell = (ctx.values.shell as string) || "list";
  const dirtyCount = Number(ctx.values.dirtyCount ?? 2);
  const frameStyle = { width: "100%", height: 340 };

  if (shell === "config") {
    return (
      <AdminConfigPage
        title="计费与配额参数"
        teleport={false}
        dirtyCount={dirtyCount}
        onSave={() => ctx.setValue("dirtyCount", 0)}
        style={frameStyle}
      >
        <ConfigSection title="注册与访问控制">
          <ConfigRow
            label="开放自助注册"
            keyHint="auth.signup_enabled"
            hint="关闭后仅受邀链接可注册新账号。"
          >
            <ToggleSwitch checked={signupEnabled} onCheckedChange={setSignupEnabled} />
          </ConfigRow>
          <ConfigRow
            label="免费档日配额上限"
            keyHint="billing.daily_free_tokens"
            hint="每日凌晨自动重置的基础推理额度。"
          >
            <InputNumber value={dailyTokens} onValueChange={setDailyTokens} min={0} step={5000} />
          </ConfigRow>
        </ConfigSection>
        <ConfigSection title="并发与速率护栏">
          <ConfigRow
            label="单用户并发上限"
            keyHint="gateway.user_concurrency_limit"
            hint="超出后返回 429 并提示排队等待。"
          >
            <InputNumber value={concurrency} onValueChange={setConcurrency} min={1} max={32} />
          </ConfigRow>
        </ConfigSection>
      </AdminConfigPage>
    );
  }

  if (shell === "detail") {
    return (
      <AdminDetailPage
        showBack
        backLabel="返回用户列表"
        teleport={false}
        style={frameStyle}
        title={
          <>
            <strong>林知夏 (usr_01H9X)</strong>
            <Tag value="Pro 学术版" severity="success" />
          </>
        }
        actions={<Button size="sm" variant="outlined" label="调整配额" />}
        cards={
          <>
            <StatCard
              label="剩余可用额度"
              value="128,400"
              sub="本月已用 71,600 (35.8%)"
              actionLabel="充值明细"
            />
            <StatCard label="关联文库文献" value="142 篇" sub="占用存储 1.8 GB" />
            <StatCard label="账号状态" value="正常" sub="注册于 2026-03-15" />
          </>
        }
        tabs={
          <Tabs value={activeTab} onValueChange={(next) => setActiveTab(String(next))}>
            <TabList>
              <Tab value="orders" badge={12}>订阅订单</Tab>
              <Tab value="logs" badge={48}>调用记录</Tab>
              <Tab value="perms">权限与角色</Tab>
            </TabList>
          </Tabs>
        }
      >
        <DataTable value={ADMIN_ROWS} dataKey="id">
          <Column field="name" header="操作人" />
          <Column field="plan" header="变更后档位" />
          <Column field="quota" header="额度快照" />
        </DataTable>
      </AdminDetailPage>
    );
  }

  if (shell === "board") {
    return (
      <AdminBoardPage
        title="全站运行总览"
        teleport={false}
        style={frameStyle}
        actions={<Button size="sm" variant="text" icon={RefreshCw} label="刷新" />}
        stats={<StatBar items={ADMIN_STATS} />}
      >
        <AdminBoardSection
          title="异步任务队列健康度"
          drill={<span>查看全部队列 →</span>}
        >
          <DataTable value={ADMIN_ROWS.slice(0, 3)} dataKey="id">
            <Column field="name" header="用户" />
            <Column field="plan" header="档位" />
            <Column field="quota" header="剩余额度" />
          </DataTable>
        </AdminBoardSection>
      </AdminBoardPage>
    );
  }

  return (
    <AdminListPage
      title="用户与配额管理"
      teleport={false}
      style={frameStyle}
      actions={<Button size="sm" icon={Plus} label="发放兑换码" />}
      filters={
        <>
          <InputText
            value={query}
            onValueChange={setQuery}
            placeholder="搜索姓名、邮箱或用户 ID…"
            style={{ width: 240 }}
          />
          <Button size="sm" variant="text" icon={RefreshCw} label="刷新" />
        </>
      }
      pagination={
        <Paginator first={first} onFirstChange={setFirst} rows={20} totalRecords={128} />
      }
    >
      <DataTable value={ADMIN_ROWS} dataKey="id">
        <Column field="name" header="用户" />
        <Column field="plan" header="档位" />
        <Column field="quota" header="剩余额度" />
        <Column field="status" header="状态" />
      </DataTable>
    </AdminListPage>
  );
}

export const DISPLAY_OVERLAY_REACT_ENTRIES: Record<string, ReactEntryRenderer> = {
  avatar: ({ values: v }) => (
    <Avatar
      label={typeof v.label === "string" && v.label ? v.label : undefined}
      icon={v.icon === "User" ? User : undefined}
      size={v.size as AvatarSize | undefined}
      shape={(v.shape as AvatarShape | undefined) ?? "square"}
    />
  ),

  badge: ({ values: v }) => (
    <Badge
      severity={(v.severity as BadgeSeverity | undefined) ?? "primary"}
      size={v.size as BadgeSize | undefined}
    >
      {typeof v.value === "string" ? v.value : "3"}
    </Badge>
  ),

  chip: ({ values: v }) => {
    const Icon = typeof v.icon === "string" ? CHIP_ICONS[v.icon] : undefined;
    return (
      <Chip icon={Icon} removable={Boolean(v.removable)}>
        {typeof v.label === "string" ? v.label : "chapter-3.pdf"}
      </Chip>
    );
  },

  tag: ({ values: v }) => {
    const Icon = typeof v.icon === "string" ? TAG_ICONS[v.icon] : undefined;
    return (
      <Tag
        severity={(v.severity as TagSeverity | undefined) ?? "primary"}
        icon={Icon}
        rounded={Boolean(v.rounded)}
      >
        {typeof v.value === "string" ? v.value : "已收录"}
      </Tag>
    );
  },

  skeleton: ({ values: v }) => (
    <Skeleton
      shape={(v.shape as SkeletonShape | undefined) ?? "rectangle"}
      width={typeof v.width === "string" ? v.width : "100%"}
      height={typeof v.height === "string" ? v.height : "1.5rem"}
      borderRadius={typeof v.borderRadius === "string" && v.borderRadius ? v.borderRadius : undefined}
      animation={(v.animation as SkeletonAnimation | undefined) ?? "wave"}
    />
  ),

  "progress-bar": ({ values: v }) => (
    <div style={{ width: "min(280px, 100%)" }}>
      <ProgressBar
        value={typeof v.value === "number" ? v.value : 0}
        mode={(v.mode as ProgressBarMode | undefined) ?? "determinate"}
        showValue={v.showValue !== false}
      />
    </div>
  ),

  "progress-spinner": ({ values: v }) => (
    <ProgressSpinner
      strokeWidth={typeof v.strokeWidth === "number" ? v.strokeWidth : 4}
      ariaLabel={typeof v.ariaLabel === "string" ? v.ariaLabel : "加载中"}
    />
  ),

  "data-table": ({ values: v }) => (
    <div style={{ width: "100%" }}>
      <DataTable
        value={PAPERS}
        dataKey="id"
        stripedRows={Boolean(v.stripedRows)}
        rowHover={Boolean(v.rowHover)}
        loading={Boolean(v.loading)}
        paginator={Boolean(v.paginator)}
        rows={typeof v.rows === "number" ? v.rows : 10}
      >
        <Column field="title" header="标题" sortable />
        <Column field="venue" header="期刊/会议" />
        <Column field="cited" header="被引" sortable />
      </DataTable>
    </div>
  ),

  paginator: ({ values: v, setValue }) => (
    <Paginator
      first={typeof v.first === "number" ? v.first : 0}
      onFirstChange={(next) => setValue("first", next)}
      rows={typeof v.rows === "number" ? v.rows : 10}
      totalRecords={typeof v.totalRecords === "number" ? v.totalRecords : 120}
      pageLinkSize={typeof v.pageLinkSize === "number" ? v.pageLinkSize : 5}
      alwaysShow={v.alwaysShow !== false}
      disabled={Boolean(v.disabled)}
    />
  ),

  "stat-bar": ({ values: v }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        width: "100%",
        maxWidth: 320,
      }}
    >
      <StatCard
        label={typeof v.label === "string" ? v.label : "剩余可用额度"}
        value={typeof v.value === "string" ? v.value : "128,400"}
        sub={typeof v.sub === "string" && v.sub ? v.sub : undefined}
        tone={(v.tone as StatTone | undefined) ?? "default"}
        actionLabel={typeof v.actionLabel === "string" && v.actionLabel ? v.actionLabel : undefined}
      />
    </div>
  ),

  "user-chip": ({ values: v }) => (
    <UserChip
      user={USER_CHIP_PROFILE}
      variant={(v.variant as UserChipVariant | undefined) ?? "text"}
      size={v.size as UserChipSize | undefined}
      showCard={Boolean(v.showCard)}
    />
  ),

  "user-card": ({ values: v }) => (
    <UserCard
      user={USER_CARD_PROFILE}
      size={(v.size as "medium" | "large" | undefined) ?? "medium"}
      style={{ width: "min(320px, 100%)" }}
    />
  ),

  dialog: ({ values: v, setValue }) => (
    <>
      <Button
        label="打开对话框"
        size="sm"
        onClick={() => setValue("open", true)}
      />
      <Dialog
        open={Boolean(v.open)}
        onOpenChange={(next) => setValue("open", next)}
        size={(v.size as DialogSize | undefined) ?? "md"}
        title={typeof v.title === "string" ? v.title : "导出为 PDF"}
        description={typeof v.description === "string" ? v.description : undefined}
        scopeText={typeof v.scopeText === "string" && v.scopeText ? v.scopeText : undefined}
        canBack={Boolean(v.canBack)}
        bodyScroll={v.bodyScroll !== false}
        modal={v.modal !== false}
        dismissableMask={Boolean(v.dismissableMask)}
        maximizable={Boolean(v.maximizable)}
        closable={v.closable !== false}
        closeOnEscape={v.closeOnEscape !== false}
        aria-label={typeof v.title === "string" && v.title ? v.title : "示例对话框"}
        footer={
          <>
            <Button
              variant="text"
              severity="secondary"
              label="取消"
              onClick={() => setValue("open", false)}
            />
            <Button label="开始导出" onClick={() => setValue("open", false)} />
          </>
        }
      >
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
          导出范围与版式可在下一步确认。
        </p>
      </Dialog>
    </>
  ),

  confirm: ({ values: v, confirm, notify }) => (
    <Button
      severity={v.danger !== false ? "danger" : "primary"}
      label="触发确认框"
      size="sm"
      onClick={async () => {
        const ok = await confirm.ask({
          title: typeof v.title === "string" ? v.title : undefined,
          message: typeof v.message === "string" ? v.message : "确认执行该操作？",
          danger: v.danger !== false,
          acceptLabel: typeof v.acceptLabel === "string" ? v.acceptLabel : undefined,
          rejectLabel: typeof v.rejectLabel === "string" ? v.rejectLabel : undefined,
        });
        notify.success(ok ? "已确认" : "已取消");
      }}
    />
  ),

  popover: ({ values: v }) => (
    <Popover
      side={(v.side as PopoverSide | undefined) ?? "bottom"}
      align={(v.align as PopoverAlign | undefined) ?? "start"}
      dismissable={v.dismissable !== false}
      ariaLabel="引用工具面板"
      trigger={({ toggle }) => (
        <Button size="sm" severity="secondary" label="引用工具" onClick={toggle} />
      )}
    >
      <div style={{ display: "grid", gap: "var(--space-2)", padding: "var(--space-2)", width: 220 }}>
        <strong style={{ fontSize: "var(--type-caption-size)" }}>插入引用</strong>
        <p
          style={{
            margin: 0,
            color: "var(--text-secondary)",
            fontSize: "var(--type-body-sm-size)",
          }}
        >
          从题录库选择条目，锚点随正文移动。
        </p>
      </div>
    </Popover>
  ),

  "hover-card": ({ values: v }) => (
    <HoverCard
      placement={(v.placement as HoverCardPlacement | undefined) ?? "top"}
      interactive={v.interactive !== false}
      disabled={Boolean(v.disabled)}
      label="引用文献详情"
      content={
        <div style={{ display: "grid", gap: "var(--space-1-5)", padding: "var(--space-3)", width: 260 }}>
          <strong style={{ fontSize: "var(--type-caption-size)" }}>Zhang, L. et al. (2024)</strong>
          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              fontSize: "var(--type-body-sm-size)",
            }}
          >
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
    </HoverCard>
  ),

  tooltip: ({ values: v }) => (
    <Tooltip
      content={typeof v.content === "string" ? v.content : "新建一篇写作草稿"}
      placement={(v.placement as "top" | "right" | "bottom" | "left" | undefined) ?? "top"}
    >
      <Button severity="secondary" size="sm" label="悬停查看提示" />
    </Tooltip>
  ),

  toast: ({ values: v, notify }) => {
    const allowed: readonly ToastSeverity[] = ["success", "info", "warn", "error"];
    const severity: ToastSeverity = allowed.includes(v.severity as ToastSeverity)
      ? (v.severity as ToastSeverity)
      : "success";
    return (
      <Button
        label="触发轻提示"
        size="sm"
        onClick={() => {
          notify[severity](
            typeof v.summary === "string" ? v.summary : "已移入回收站",
            typeof v.detail === "string" && v.detail ? v.detail : undefined,
          );
        }}
      />
    );
  },

  message: ({ values: v }) => (
    <Message
      severity={(v.severity as MessageSeverity | undefined) ?? "info"}
      closable={Boolean(v.closable)}
    >
      {typeof v.text === "string" ? v.text : "引用格式已按 GB/T 7714 统一重排。"}
    </Message>
  ),

  "image-lightbox": ({ values: v, setValue }) => (
    <>
      <Button
        size="sm"
        severity="secondary"
        label="打开灯箱"
        onClick={() => setValue("open", true)}
      />
      <ImageLightbox
        open={Boolean(v.open)}
        onOpenChange={(next) => setValue("open", next)}
        src={DEMO_IMAGE}
        alt={typeof v.alt === "string" ? v.alt : "消融实验对比图"}
        caption={typeof v.caption === "string" ? v.caption : undefined}
      />
    </>
  ),

  menu: () => <Menu model={MENU_ITEMS} ariaLabel="文档操作菜单" />,

  "action-menu": ({ values: v, setValue }) => (
    <ActionMenu
      items={ACTION_MENU_ITEMS}
      open={Boolean(v.open)}
      onOpenChange={(next) => setValue("open", next)}
      aria-label="行内操作菜单"
    />
  ),

  tabs: ({ values: v, setValue }) => {
    const visibleTabs = v.hideWhenSingle ? TAB_ITEMS.slice(0, 1) : TAB_ITEMS;
    const activeVal = v.hideWhenSingle
      ? "draft"
      : typeof v.active === "string"
        ? v.active
        : "draft";
    return (
      <div style={{ width: "min(440px, 100%)" }}>
        <Tabs
          value={activeVal}
          onValueChange={(next) => setValue("active", String(next))}
          orientation={(v.orientation as "horizontal" | "vertical" | undefined) ?? "horizontal"}
        >
          <TabList hideWhenSingle={Boolean(v.hideWhenSingle)}>
            {visibleTabs.map((item) => (
              <Tab
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                badge={v.badge ? item.badge : undefined}
              >
                {item.label}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {visibleTabs
              .filter((item) => !item.disabled)
              .map((item) => (
                <TabPanel key={item.value} value={item.value}>
                  <p className="doc-note">{TAB_PANELS_TEXT[item.value]}</p>
                </TabPanel>
              ))}
          </TabPanels>
        </Tabs>
      </div>
    );
  },

  accordion: ({ values: v, setValue }) => (
    <div style={{ width: "min(420px, 100%)" }}>
      <Accordion
        value={typeof v.active === "string" ? v.active : "meta"}
        onValueChange={(next) => setValue("active", typeof next === "string" ? next : undefined)}
      >
        {ACCORDION_PANELS.map((panel) => (
          <AccordionPanel key={panel.value} value={panel.value} disabled={panel.disabled}>
            <AccordionHeader>{panel.title}</AccordionHeader>
            <AccordionContent>
              <p className="doc-note">{panel.text}</p>
            </AccordionContent>
          </AccordionPanel>
        ))}
      </Accordion>
    </div>
  ),

  "page-header": ({ values: v }) => (
    <div style={{ width: "100%" }}>
      <PageHeader
        title={typeof v.title === "string" ? v.title : "写作工作区"}
        icon={<FileText aria-hidden="true" />}
        actions={<Button size="sm" label="新建草稿" icon={Plus} />}
      />
    </div>
  ),

  "async-slot": ({ values: v }) => (
    <AsyncSlot
      status={(v.status as AsyncSlotStatus | undefined) ?? "ready"}
      skeleton={(v.skeleton as AsyncSlotSkeleton | undefined) ?? "list"}
    >
      <div style={{ display: "grid", gap: "var(--space-2)", width: "min(320px, 100%)" }}>
        <p className="doc-note">三条语料已就位，可以直接开始写作。</p>
        <p className="doc-note">语料行来自题录库与解析缓存。</p>
      </div>
    </AsyncSlot>
  ),

  "config-section": (ctx) => <ConfigSectionDemo ctx={ctx} />,
  "admin-shell": (ctx) => <AdminShellDemo ctx={ctx} />,

  "app-logo": () => <AppLogo style={{ height: 32 }} />,
  "not-found-page": () => (
    <NotFoundPage
      title="页面不存在"
      lead="您访问的文档地址可能已迁移。"
      primaryLabel="返回首页"
    />
  ),
  site: ({ locale }) => (
    <div style={{ width: "100%", display: "grid", gap: "var(--space-4)" }}>
      <SiteHeader items={[{ label: "功能", href: "#" }, { label: "定价", href: "#" }]} />
      <SiteFooter locale={locale} />
    </div>
  ),
};
