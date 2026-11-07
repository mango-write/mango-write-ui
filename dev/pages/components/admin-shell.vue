<script setup lang="ts">
import { computed, ref } from "vue";
import { Plus, RefreshCw } from "lucide-vue-next";
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
  Select,
  StatBar,
  StatCard,
  Tab,
  TabList,
  Tabs,
  Tag,
  ToggleSwitch,
} from "../../../src";
import { api } from "../../api/entries/admin-shell";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import UsagePlayground from "../../kit/UsagePlayground.vue";
import { t } from "../../i18n";
import { usage } from "../../usage/entries/admin-shell";

const s = {
  demo: { zh: "在线演示", en: "Live demo" },
  demoDesc: {
    zh: "调整配置即时预览；查看生成代码，一键复制到项目。",
    en: "Tweak controls for a live preview; inspect or copy the generated code into your project.",
  },
  whenToUse: { zh: "何时使用", en: "When to use" },
  do1: {
    zh: "所有后台页面归入四种标准页面壳：<code>AdminListPage</code>（列表检索）、<code>AdminConfigPage</code>（参数配置）、<code>AdminDetailPage</code>（实体详情）与 <code>AdminBoardPage</code>（监控看板）。",
    en: "Every admin view belongs to one of four page shells: <code>AdminListPage</code>, <code>AdminConfigPage</code>, <code>AdminDetailPage</code>, or <code>AdminBoardPage</code>.",
  },
  do2: {
    zh: "页面一级标题与全局主动作默认经 <code>#admin-header-lead</code> 与 <code>#admin-header-actions</code> 传送到宿主顶栏，页面主体不再重复渲染大号标题行。",
    en: "Page titles and primary actions teleport into <code>#admin-header-lead</code> and <code>#admin-header-actions</code>; never duplicate the H1 row inside the page body.",
  },
  dont1: {
    zh: "配置页不在各个分组卡内散落局部保存按钮，统一由 <code>AdminConfigPage</code> 顶栏收敛未保存计数与唯一「保存更改」出口。",
    en: "Do not scatter per-card Save buttons on config pages; consolidate unsaved counts and the single Save action in the <code>AdminConfigPage</code> header.",
  },
  dont2: {
    zh: "不把固定页面要素（页头、筛选条、详情状态卡 <code>#cards</code>、页内页签 <code>#tabs</code>、分页栏）与下方数据层混在同一个滚动容器内。",
    en: "Never mix fixed page chrome (headers, filter bars, detail <code>#cards</code>, in-page <code>#tabs</code>, paginators) into the scrollable data container.",
  },

  anatomyTitle: { zh: "结构解剖与滚动边界", en: "Anatomy and scroll boundaries" },
  anatomyDesc: {
    zh: "四种页面壳在纵向上严格拆为「固定页面要素（flex-shrink: 0 / sticky）」与「唯一可滚动数据层（flex: 1; min-height: 0; overflow-y: auto）」。吸顶表头统一使用实心底色遮挡上滚行。",
    en: "All four shells split vertically into fixed Page Chrome (flex-shrink: 0 / sticky) and a single Scrollable Data Plane (flex: 1; min-height: 0; overflow-y: auto), with opaque sticky table headers.",
  },
  colShell: { zh: "页面壳", en: "Page shell" },
  colChrome: { zh: "固定页面要素（不随数据滚走）", en: "Fixed page chrome (pinned)" },
  colData: { zh: "可滚动数据层（唯一滚动区）", en: "Scrollable data plane" },
  rowListChrome: {
    zh: "页头 + #summary + #filters 筛选栏 + DataTable 吸顶实心表头 (thead) + #pagination 分页栏",
    en: "Header + #summary + #filters bar + opaque sticky DataTable thead + #pagination bar",
  },
  rowListData: {
    zh: "仅 DataTable 表体行（.mw-datatable__table-container tbody）独立滚动",
    en: "Only DataTable body rows (.mw-datatable__table-container tbody) scroll",
  },
  rowConfigChrome: {
    zh: "页头（标题 + 「N 项未保存」计数 + 保存更改按钮 + #actions）+ #toolbar 工具条",
    en: "Header (title + unsaved counter + Save button + #actions) + #toolbar strip",
  },
  rowConfigData: {
    zh: ".admin-config-page__body 内的 ConfigSection 分组卡流",
    en: "ConfigSection card stream inside .admin-config-page__body",
  },
  rowDetailChrome: {
    zh: "页头（返回 + #title + #actions）+ #cards 状态卡网格 + #tabs 页内标签栏（或 TabList）",
    en: "Header (Back + #title + #actions) + #cards summary grid + #tabs bar (or TabList)",
  },
  rowDetailData: {
    zh: ".admin-detail-page__body（或 TabPanels）内的当前页签明细内容",
    en: "Active tab detail content inside .admin-detail-page__body (or TabPanels)",
  },
  rowBoardChrome: {
    zh: "仅页头（标题 + #actions 时间窗/维度筛选器）+ 可选 #toolbar",
    en: "Only header (title + #actions time/dimension filters) + optional #toolbar",
  },
  rowBoardData: {
    zh: ".admin-board-page__body 承载 #stats 大盘指标条与 AdminBoardSection 图表卡片一同滚动",
    en: ".admin-board-page__body scrolls #stats and AdminBoardSection cards together",
  },

  listTitle: { zh: "列表壳（AdminListPage）", en: "List shell (AdminListPage)" },
  listDesc: {
    zh: "固定页头操作区（#actions）、顶部汇总条（#summary）、单行筛选栏（#filters）、实心吸顶表头（thead）与底部分页器（#pagination），仅表体（tbody）在剩余视口高度内滚动。",
    en: "Pins header actions (#actions), optional summary (#summary), single-row filters (#filters), opaque sticky thead, and bottom paginator (#pagination) while only tbody scrolls.",
  },

  configTitle: { zh: "配置壳（AdminConfigPage）", en: "Config shell (AdminConfigPage)" },
  configDesc: {
    zh: "固定页头（含未保存计数与保存动作，支持 confirmMessage 二次确认）与可选 #toolbar，下方滚区串联 ConfigSection 与 ConfigRow。",
    en: "Pins the header (unsaved count + Save button with optional confirmMessage) and #toolbar, while ConfigSection and ConfigRow blocks scroll below.",
  },

  detailTitle: { zh: "详情壳（AdminDetailPage）", en: "Detail shell (AdminDetailPage)" },
  detailDesc: {
    zh: "顶栏左侧切换为「返回 + #title 实体名与状态标签」，顶部的 #cards 状态摘要卡网格（StatCard）与 #tabs 页内标签栏（Tabs）均常驻固定，仅下方明细数据区滚动。",
    en: "Replaces the header lead with Back + #title; both the #cards summary grid (StatCard) and #tabs bar (Tabs) stay pinned while only the detail body scrolls.",
  },

  boardTitle: { zh: "看板壳（AdminBoardPage）", en: "Board shell (AdminBoardPage)" },
  boardDesc: {
    zh: "仅固定页头与时间窗/维度筛选器（#actions / #toolbar）；下方滚区承载 #stats 核心指标条（StatBar）与多个 AdminBoardSection 分节卡片一同滚动。",
    en: "Pins only the header and time/dimension filters (#actions / #toolbar); the body scrolls #stats (StatBar) and AdminBoardSection cards together.",
  },

  listHeader: { zh: "用户与配额管理", en: "Users & quota management" },
  issueCode: { zh: "发放兑换码", en: "Issue code" },
  refresh: { zh: "刷新", en: "Refresh" },
  searchPlaceholder: { zh: "搜索姓名、邮箱或 ID…", en: "Search name, email, or ID…" },
  allPlans: { zh: "全部档位", en: "All plans" },
  colUser: { zh: "用户", en: "User" },
  colPlan: { zh: "订阅档位", en: "Plan" },
  colQuota: { zh: "额度", en: "Quota" },
  colStatus: { zh: "状态", en: "Status" },
  statusActive: { zh: "正常", en: "Active" },
  statusLimited: { zh: "受限", en: "Limited" },

  configHeader: { zh: "系统运行与安全护栏", en: "Runtime & safety guardrails" },
  secAuthTitle: { zh: "注册与访问控制", en: "Signup & access control" },
  rowSignupLabel: { zh: "开放新用户自助注册", en: "Enable self-serve signup" },
  rowSignupHint: {
    zh: "关闭后仅允许持有有效团队邀请或兑换码的用户完成注册。",
    en: "When off, only users with a valid team invite or redeem code can register.",
  },
  rowQuotaLabel: { zh: "免费档日配额上限", en: "Free-tier daily token cap" },
  rowQuotaHint: {
    zh: "每日凌晨 00:00 (UTC+8) 自动重置的单账户免费额度。",
    en: "Per-account free quota reset daily at 00:00 (UTC+8).",
  },
  rowQuotaStatus: {
    zh: "当前生效值：50,000 tokens / 日",
    en: "Currently active: 50,000 tokens / day",
  },
  secRateTitle: { zh: "网关并发与速率限制", en: "Gateway concurrency & rate limits" },
  rowConcurrencyLabel: { zh: "单用户最大并发流数", en: "Max concurrent streams per user" },
  rowConcurrencyHint: {
    zh: "同时进行中的 SSE 推理连接数上限，超出返回 429。",
    en: "Maximum concurrent SSE inference connections per user before returning 429.",
  },
  rowBurstLabel: { zh: "每分钟请求突发上限", en: "Per-minute burst limit" },
  rowBurstHint: {
    zh: "防止自动化脚本高频刷接口的滑动窗口阈值。",
    en: "Sliding-window request cap protecting against automated scraping.",
  },

  detailHeader: { zh: "林知夏 · usr_01H9X8A", en: "Lin Zhixia · usr_01H9X8A" },
  backToUsers: { zh: "返回用户列表", en: "Back to users" },
  proPlan: { zh: "Pro 学术版", en: "Pro Academic" },
  adjustQuota: { zh: "调整额度", en: "Adjust quota" },
  cardQuotaLabel: { zh: "剩余可用额度", en: "Remaining quota" },
  cardQuotaSub: { zh: "本月已用 71,600 (35.8%)", en: "71,600 used this month (35.8%)" },
  cardQuotaAction: { zh: "充值明细", en: "Top-up log" },
  cardSourceLabel: { zh: "关联文库文献", en: "Library sources" },
  cardSourceVal: { zh: "142 篇", en: "142 items" },
  cardSourceSub: { zh: "占用存储 1.8 GB", en: "1.8 GB storage used" },
  cardBindLabel: { zh: "外部身份绑定", en: "Identity bindings" },
  cardBindSub: { zh: "已绑定企微与个人微信", en: "WeCom & WeChat linked" },
  detailTabOrders: { zh: "订阅订单", en: "Orders" },
  detailTabLogs: { zh: "调用记录", en: "Call logs" },
  detailTabPerms: { zh: "权限与角色", en: "Permissions" },

  boardHeader: { zh: "异步队列与健康监控", en: "Async queues & health monitor" },
  boardSec1Title: { zh: "Worker 消费队列健康度", en: "Worker queue health" },
  boardSec2Title: { zh: "最近配额审计流水", en: "Recent quota audit trail" },
  boardDrill: { zh: "查看全部队列 →", en: "View all queues →" },

  api: { zh: "接口", en: "API" },
} as const;

const searchKeyword = ref("");
const planFilter = ref("all");
const dirtyCount = ref(2);
const signupEnabled = ref(true);
const dailyQuota = ref(50000);
const maxConcurrency = ref(4);
const burstLimit = ref(60);
const detailDemoTab = ref("orders");

const planOptions = computed(() => [
  { label: t(s.allPlans), value: "all" },
  { label: "Pro", value: "pro" },
  { label: "Team", value: "team" },
  { label: "Free", value: "free" },
]);

const listRows = computed(() => [
  {
    id: "usr_01",
    name: t({ zh: "林知夏 (lin@tsinghua.edu.cn)", en: "Lin Zhixia (lin@tsinghua.edu.cn)" }),
    plan: "Pro",
    quota: "128,400",
    status: t(s.statusActive),
    active: true,
  },
  {
    id: "usr_02",
    name: t({ zh: "陈怀瑾 (chen@pku.edu.cn)", en: "Chen Huaijin (chen@pku.edu.cn)" }),
    plan: "Team",
    quota: "512,000",
    status: t(s.statusActive),
    active: true,
  },
  {
    id: "usr_03",
    name: t({ zh: "周予安 (zhou@zju.edu.cn)", en: "Zhou Yuan (zhou@zju.edu.cn)" }),
    plan: "Free",
    quota: "14,200",
    status: t(s.statusLimited),
    active: false,
  },
  {
    id: "usr_04",
    name: t({ zh: "宋清如 (song@fudan.edu.cn)", en: "Song Qingru (song@fudan.edu.cn)" }),
    plan: "Pro",
    quota: "96,000",
    status: t(s.statusActive),
    active: true,
  },
  {
    id: "usr_05",
    name: t({ zh: "顾北辰 (gu@sjtu.edu.cn)", en: "Gu Beichen (gu@sjtu.edu.cn)" }),
    plan: "Team",
    quota: "410,500",
    status: t(s.statusActive),
    active: true,
  },
  {
    id: "usr_06",
    name: t({ zh: "温书意 (wen@ustc.edu.cn)", en: "Wen Shuyi (wen@ustc.edu.cn)" }),
    plan: "Pro",
    quota: "84,900",
    status: t(s.statusActive),
    active: true,
  },
  {
    id: "usr_07",
    name: t({ zh: "沈清晏 (shen@nju.edu.cn)", en: "Shen Qingyan (shen@nju.edu.cn)" }),
    plan: "Pro",
    quota: "112,000",
    status: t(s.statusActive),
    active: true,
  },
]);

const boardStats = computed(() => [
  { label: t({ zh: "总用户数", en: "Total users" }), value: "12,840", tone: "default" as const, sub: "+4.2%" },
  { label: t({ zh: "今日活跃", en: "Active today" }), value: "1,429", tone: "accent" as const, sub: "Peak 14:00" },
  { label: "import-worker", value: "0", tone: "success" as const, sub: "P95 2.4s" },
  { label: t({ zh: "限流告警", en: "Rate alerts" }), value: "2", tone: "warning" as const, sub: "24h" },
]);
</script>

<template>
  <DocPage>
    <DocSection :title="s.demo" :desc="s.demoDesc">
      <UsagePlayground :entry="usage" />
    </DocSection>

    <DocSection :title="s.whenToUse">
      <ul class="doc-rules">
        <li data-kind="do" v-html="t(s.do1)" />
        <li data-kind="do" v-html="t(s.do2)" />
        <li data-kind="dont" v-html="t(s.dont1)" />
        <li data-kind="dont" v-html="t(s.dont2)" />
      </ul>
    </DocSection>

    <DocSection :title="s.anatomyTitle" :desc="s.anatomyDesc">
      <table class="doc-table">
        <thead>
          <tr>
            <th>{{ t(s.colShell) }}</th>
            <th>{{ t(s.colChrome) }}</th>
            <th>{{ t(s.colData) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>AdminListPage</code></td>
            <td>{{ t(s.rowListChrome) }}</td>
            <td>{{ t(s.rowListData) }}</td>
          </tr>
          <tr>
            <td><code>AdminConfigPage</code></td>
            <td>{{ t(s.rowConfigChrome) }}</td>
            <td>{{ t(s.rowConfigData) }}</td>
          </tr>
          <tr>
            <td><code>AdminDetailPage</code></td>
            <td>{{ t(s.rowDetailChrome) }}</td>
            <td>{{ t(s.rowDetailData) }}</td>
          </tr>
          <tr>
            <td><code>AdminBoardPage</code></td>
            <td>{{ t(s.rowBoardChrome) }}</td>
            <td>{{ t(s.rowBoardData) }}</td>
          </tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection :title="s.listTitle" :desc="s.listDesc">
      <Specimen themes="single" layout="stack">
        <div class="admin-shell-viewport">
          <AdminListPage :title="t(s.listHeader)" :teleport="false">
            <template #actions>
              <Button size="sm" :icon="Plus" :label="t(s.issueCode)" />
            </template>
            <template #filters>
              <InputText
                v-model="searchKeyword"
                :placeholder="t(s.searchPlaceholder)"
                style="width: 240px"
              />
              <Select
                v-model="planFilter"
                :options="planOptions"
                option-label="label"
                option-value="value"
                style="width: 148px"
              />
              <Button size="sm" variant="text" :icon="RefreshCw" :label="t(s.refresh)" />
            </template>
            <DataTable :value="listRows" data-key="id">
              <Column field="name" :header="t(s.colUser)" />
              <Column field="plan" :header="t(s.colPlan)" />
              <Column field="quota" :header="t(s.colQuota)" />
              <Column field="status" :header="t(s.colStatus)">
                <template #body="{ data }">
                  <Tag
                    :value="data.status"
                    :severity="data.active ? 'success' : 'warn'"
                  />
                </template>
              </Column>
            </DataTable>
            <template #pagination>
              <Paginator :first="0" :rows="20" :total-records="12840" />
            </template>
          </AdminListPage>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.configTitle" :desc="s.configDesc">
      <Specimen themes="single" layout="stack">
        <div class="admin-shell-viewport">
          <AdminConfigPage
            :title="t(s.configHeader)"
            :teleport="false"
            :dirty-count="dirtyCount"
            @save="dirtyCount = 0"
          >
            <ConfigSection :title="t(s.secAuthTitle)">
              <ConfigRow
                :label="t(s.rowSignupLabel)"
                key-hint="auth.signup_enabled"
                :hint="t(s.rowSignupHint)"
              >
                <ToggleSwitch v-model="signupEnabled" @update:model-value="dirtyCount += 1" />
              </ConfigRow>
              <ConfigRow
                :label="t(s.rowQuotaLabel)"
                key-hint="billing.daily_free_tokens"
                :hint="t(s.rowQuotaHint)"
                :status="t(s.rowQuotaStatus)"
                status-tone="success"
              >
                <InputNumber
                  v-model="dailyQuota"
                  :min="0"
                  :step="5000"
                  @update:model-value="dirtyCount += 1"
                />
              </ConfigRow>
            </ConfigSection>

            <ConfigSection :title="t(s.secRateTitle)">
              <ConfigRow
                :label="t(s.rowConcurrencyLabel)"
                key-hint="gateway.user_concurrency_limit"
                :hint="t(s.rowConcurrencyHint)"
              >
                <InputNumber
                  v-model="maxConcurrency"
                  :min="1"
                  :max="32"
                  @update:model-value="dirtyCount += 1"
                />
              </ConfigRow>
              <ConfigRow
                :label="t(s.rowBurstLabel)"
                key-hint="gateway.rpm_burst_limit"
                :hint="t(s.rowBurstHint)"
              >
                <InputNumber
                  v-model="burstLimit"
                  :min="10"
                  :step="10"
                  @update:model-value="dirtyCount += 1"
                />
              </ConfigRow>
            </ConfigSection>
          </AdminConfigPage>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.detailTitle" :desc="s.detailDesc">
      <Specimen themes="single" layout="stack">
        <div class="admin-shell-viewport admin-shell-viewport--tall">
          <AdminDetailPage
            show-back
            :back-label="t(s.backToUsers)"
            :teleport="false"
          >
            <template #title>
              <strong>{{ t(s.detailHeader) }}</strong>
              <Tag :value="t(s.proPlan)" severity="success" />
            </template>
            <template #actions>
              <Button size="sm" variant="outlined" :label="t(s.adjustQuota)" />
            </template>
            <template #cards>
              <StatCard
                :label="t(s.cardQuotaLabel)"
                value="128,400"
                :sub="t(s.cardQuotaSub)"
                :action-label="t(s.cardQuotaAction)"
              />
              <StatCard
                :label="t(s.cardSourceLabel)"
                :value="t(s.cardSourceVal)"
                :sub="t(s.cardSourceSub)"
              />
              <StatCard
                :label="t(s.cardBindLabel)"
                value="ORCID · 0000-0002"
                :sub="t(s.cardBindSub)"
              />
            </template>
            <template #tabs>
              <Tabs v-model:value="detailDemoTab">
                <TabList>
                  <Tab value="orders" :badge="12">{{ t(s.detailTabOrders) }}</Tab>
                  <Tab value="logs" :badge="48">{{ t(s.detailTabLogs) }}</Tab>
                  <Tab value="perms">{{ t(s.detailTabPerms) }}</Tab>
                </TabList>
              </Tabs>
            </template>
            <DataTable :value="listRows" data-key="id">
              <Column field="name" :header="t(s.colUser)" />
              <Column field="plan" :header="t(s.colPlan)" />
              <Column field="quota" :header="t(s.colQuota)" />
              <Column field="status" :header="t(s.colStatus)" />
            </DataTable>
          </AdminDetailPage>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.boardTitle" :desc="s.boardDesc">
      <Specimen themes="single" layout="stack">
        <div class="admin-shell-viewport admin-shell-viewport--tall">
          <AdminBoardPage :title="t(s.boardHeader)" :teleport="false">
            <template #actions>
              <Button size="sm" variant="text" :icon="RefreshCw" :label="t(s.refresh)" />
            </template>
            <template #stats>
              <StatBar :items="boardStats" />
            </template>
            <AdminBoardSection :title="t(s.boardSec1Title)">
              <template #drill>
                <Button size="xs" variant="text" :label="t(s.boardDrill)" />
              </template>
              <DataTable :value="listRows.slice(0, 3)" data-key="id">
                <Column field="name" :header="t(s.colUser)" />
                <Column field="plan" :header="t(s.colPlan)" />
                <Column field="quota" :header="t(s.colQuota)" />
              </DataTable>
            </AdminBoardSection>
            <AdminBoardSection :title="t(s.boardSec2Title)">
              <DataTable :value="listRows.slice(3, 6)" data-key="id">
                <Column field="name" :header="t(s.colUser)" />
                <Column field="status" :header="t(s.colStatus)" />
                <Column field="quota" :header="t(s.colQuota)" />
              </DataTable>
            </AdminBoardSection>
          </AdminBoardPage>
        </div>
      </Specimen>
    </DocSection>

    <DocSection :title="s.api">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>

<style scoped>
.admin-shell-viewport {
  display: flex;
  flex-direction: column;
  height: 360px;
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--border-subtle);
  background: var(--bg-canvas);
  overflow: hidden;
}

.admin-shell-viewport--tall {
  height: 400px;
}
</style>
