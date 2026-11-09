import { h } from "vue";
import {
  AdminBoardPage,
  AdminBoardSection,
  AdminConfigPage,
  AdminDetailPage,
  AdminListPage,
  Button,
  Column,
  ConfigRow,
  ConfigSection,
  DataTable,
  InputNumber,
  InputText,
  Paginator,
  StatBar,
  StatCard,
  Tab,
  TabList,
  Tabs,
  Tag,
  ToggleSwitch,
} from "@mango-write/ui-vue";
import { sfc } from "../codegen";
import type { UsageEntry, UsageValues } from "../types";
import { Plus, RefreshCw } from "lucide-vue-next";

const sampleRows = [
  { id: "usr_01", name: "林知夏 (lin@tsinghua.edu.cn)", plan: "Pro", quota: "128,400", status: "正常" },
  { id: "usr_02", name: "陈怀瑾 (chen@pku.edu.cn)", plan: "Team", quota: "512,000", status: "正常" },
  { id: "usr_03", name: "周予安 (zhou@zju.edu.cn)", plan: "Free", quota: "15,000", status: "受限" },
  { id: "usr_04", name: "宋清如 (song@fudan.edu.cn)", plan: "Pro", quota: "96,000", status: "正常" },
  { id: "usr_05", name: "顾北辰 (gu@sjtu.edu.cn)", plan: "Team", quota: "410,500", status: "正常" },
  { id: "usr_06", name: "温书意 (wen@ustc.edu.cn)", plan: "Pro", quota: "84,900", status: "正常" },
];

const sampleStats = [
  { label: "总用户数", value: "12,840", sub: "较上周 +4.2%" },
  { label: "今日活跃", value: "1,429", tone: "accent" as const, sub: "峰值 14:00" },
  { label: "队列积压", value: 0, tone: "success" as const, sub: "全部健康" },
  { label: "异常告警", value: 2, tone: "warning" as const, sub: "待核查" },
];

export const usage: UsageEntry = {
  slug: "admin-shell",
  component: AdminListPage,
  tag: "AdminListPage",
  flatPreview: true,
  minHeight: "360px",
  controls: [
    {
      prop: "shell",
      label: "页面壳",
      kind: "enum",
      options: [
        { label: "列表壳", value: "list" },
        { label: "配置壳", value: "config" },
        { label: "详情壳", value: "detail" },
        { label: "看板壳", value: "board" },
      ],
      default: "list",
    },
    {
      prop: "dirtyCount",
      label: "未保存项数",
      kind: "number",
      default: 2,
    },
  ],
  render: (v: UsageValues) => {
    const shell = (v.shell as string) || "list";
    const dirtyCount = Number(v.dirtyCount ?? 2);
    const frameStyle = "width: 100%; height: 340px;";

    if (shell === "config") {
      return h(
        AdminConfigPage,
        {
          title: "计费与配额参数",
          teleport: false,
          dirtyCount,
          style: frameStyle,
        },
        {
          default: () => [
            h(
              ConfigSection,
              { title: "注册与访问控制" },
              {
                default: () => [
                  h(
                    ConfigRow,
                    {
                      label: "开放自助注册",
                      keyHint: "auth.signup_enabled",
                      hint: "关闭后仅受邀链接可注册新账号。",
                    },
                    () => h(ToggleSwitch, { modelValue: true }),
                  ),
                  h(
                    ConfigRow,
                    {
                      label: "免费档日配额上限",
                      keyHint: "billing.daily_free_tokens",
                      hint: "每日凌晨自动重置的基础推理额度。",
                    },
                    () => h(InputNumber, { modelValue: 50000, min: 0, step: 5000 }),
                  ),
                ],
              },
            ),
            h(
              ConfigSection,
              { title: "并发与速率护栏" },
              {
                default: () => [
                  h(
                    ConfigRow,
                    {
                      label: "单用户并发上限",
                      keyHint: "gateway.user_concurrency_limit",
                      hint: "超出后返回 429 并提示排队等待。",
                    },
                    () => h(InputNumber, { modelValue: 4, min: 1, max: 32 }),
                  ),
                ],
              },
            ),
          ],
        },
      );
    }

    if (shell === "detail") {
      return h(
        AdminDetailPage,
        {
          showBack: true,
          backLabel: "返回用户列表",
          teleport: false,
          style: frameStyle,
        },
        {
          title: () => [
            h("strong", "林知夏 (usr_01H9X)"),
            h(Tag, { value: "Pro 学术版", severity: "success" }),
          ],
          actions: () => h(Button, { size: "sm", variant: "outlined", label: "调整配额" }),
          cards: () => [
            h(StatCard, {
              label: "剩余可用额度",
              value: "128,400",
              sub: "本月已用 71,600 (35.8%)",
              actionLabel: "充值明细",
            }),
            h(StatCard, {
              label: "关联文库文献",
              value: "142 篇",
              sub: "占用存储 1.8 GB",
            }),
            h(StatCard, {
              label: "账号状态",
              value: "正常",
              sub: "注册于 2026-03-15",
            }),
          ],
          tabs: () =>
            h(Tabs, { value: "orders" }, () =>
              h(TabList, () => [
                h(Tab, { value: "orders", badge: 12 }, () => "订阅订单"),
                h(Tab, { value: "logs", badge: 48 }, () => "调用记录"),
                h(Tab, { value: "perms" }, () => "权限与角色"),
              ]),
            ),
          default: () =>
            h(
              DataTable,
              { value: sampleRows, dataKey: "id" },
              () => [
                h(Column, { field: "name", header: "操作人" }),
                h(Column, { field: "plan", header: "变更后档位" }),
                h(Column, { field: "quota", header: "额度快照" }),
              ],
            ),
        },
      );
    }

    if (shell === "board") {
      return h(
        AdminBoardPage,
        {
          title: "全站运行总览",
          teleport: false,
          style: frameStyle,
        },
        {
          actions: () => h(Button, { size: "sm", variant: "text", icon: RefreshCw, label: "刷新" }),
          stats: () => h(StatBar, { items: sampleStats }),
          default: () => [
            h(
              AdminBoardSection,
              { title: "异步任务队列健康度" },
              {
                drill: () => h("span", "查看全部队列 →"),
                default: () =>
                  h(
                    DataTable,
                    { value: sampleRows.slice(0, 3), dataKey: "id" },
                    () => [
                      h(Column, { field: "name", header: "用户" }),
                      h(Column, { field: "plan", header: "档位" }),
                      h(Column, { field: "quota", header: "剩余额度" }),
                    ],
                  ),
              },
            ),
          ],
        },
      );
    }

    return h(
      AdminListPage,
      {
        title: "用户与配额管理",
        teleport: false,
        style: frameStyle,
      },
      {
        actions: () => h(Button, { size: "sm", icon: Plus, label: "发放兑换码" }),
        filters: () => [
          h(InputText, {
            modelValue: "",
            placeholder: "搜索姓名、邮箱或用户 ID…",
            style: "width: 240px",
          }),
          h(Button, { size: "sm", variant: "text", icon: RefreshCw, label: "刷新" }),
        ],
        default: () =>
          h(
            DataTable,
            { value: sampleRows, dataKey: "id" },
            () => [
              h(Column, { field: "name", header: "用户" }),
              h(Column, { field: "plan", header: "档位" }),
              h(Column, { field: "quota", header: "剩余额度" }),
              h(Column, { field: "status", header: "状态" }),
            ],
          ),
        pagination: () => h(Paginator, { first: 0, rows: 20, totalRecords: 128 }),
      },
    );
  },
  code: (v: UsageValues) => {
    const shell = (v.shell as string) || "list";
    if (shell === "config") {
      return sfc({
        ui: ["AdminConfigPage", "ConfigSection", "ConfigRow", "ToggleSwitch", "InputNumber"],
        vue: ["ref"],
        setup: [
          `const dirtyCount = ref(${Number(v.dirtyCount ?? 2)});`,
          "const signupEnabled = ref(true);",
          "const dailyFreeTokens = ref(50000);",
        ],
        template: `<AdminConfigPage :dirty-count="dirtyCount" @save="dirtyCount = 0">
  <ConfigSection title="注册与访问控制">
    <ConfigRow label="开放自助注册" key-hint="auth.signup_enabled" hint="关闭后仅受邀链接可注册新账号。">
      <ToggleSwitch v-model="signupEnabled" />
    </ConfigRow>
    <ConfigRow label="免费档日配额上限" key-hint="billing.daily_free_tokens" hint="每日凌晨自动重置的基础推理额度。">
      <InputNumber v-model="dailyFreeTokens" :min="0" :step="5000" />
    </ConfigRow>
  </ConfigSection>
</AdminConfigPage>`,
      });
    }
    if (shell === "detail") {
      return sfc({
        ui: ["AdminDetailPage", "StatCard", "Tabs", "TabList", "Tab", "Tag", "Button", "DataTable", "Column"],
        template: `<AdminDetailPage back-to="/admin/users">
  <template #title>
    <strong>林知夏 (usr_01H9X)</strong>
    <Tag value="Pro 学术版" severity="success" />
  </template>
  <template #actions>
    <Button size="sm" variant="outlined" label="调整配额" />
  </template>
  <template #cards>
    <StatCard label="剩余可用额度" value="128,400" sub="本月已用 71,600" action-label="充值明细" />
    <StatCard label="关联文库文献" value="142 篇" sub="占用存储 1.8 GB" />
  </template>
  <template #tabs>
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="orders" :badge="12">订阅订单</Tab>
        <Tab value="logs" :badge="48">调用记录</Tab>
      </TabList>
    </Tabs>
  </template>
  <DataTable :value="rows" data-key="id">
    <Column field="name" header="操作人" />
    <Column field="quota" header="额度快照" />
  </DataTable>
</AdminDetailPage>`,
      });
    }
    if (shell === "board") {
      return sfc({
        ui: ["AdminBoardPage", "AdminBoardSection", "StatBar", "Button"],
        lucide: ["RefreshCw"],
        template: `<AdminBoardPage>
  <template #actions>
    <Button size="sm" variant="text" :icon="RefreshCw" label="刷新" />
  </template>
  <template #stats>
    <StatBar :items="stats" />
  </template>
  <AdminBoardSection title="异步任务队列健康度">
    <template #drill>
      <a href="/admin/queues">查看全部队列 →</a>
    </template>
    <!-- 看板内容 -->
  </AdminBoardSection>
</AdminBoardPage>`,
      });
    }
    return sfc({
      ui: ["AdminListPage", "InputText", "Button", "DataTable", "Column", "Paginator"],
      lucide: ["Plus", "RefreshCw"],
      template: `<AdminListPage>
  <template #actions>
    <Button size="sm" :icon="Plus" label="发放兑换码" />
  </template>
  <template #filters>
    <InputText placeholder="搜索姓名、邮箱或用户 ID…" />
    <Button size="sm" variant="text" :icon="RefreshCw" label="刷新" />
  </template>
  <DataTable :value="rows" data-key="id">
    <Column field="name" header="用户" />
    <Column field="plan" header="档位" />
    <Column field="quota" header="剩余额度" />
  </DataTable>
  <template #pagination>
    <Paginator :first="0" :rows="20" :total-records="128" />
  </template>
</AdminListPage>`,
    });
  },
};
