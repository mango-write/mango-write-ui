<script setup lang="ts">
import { ref } from "vue";
import { MousePointerClick } from "lucide-vue-next";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  AppLogo,
  Avatar,
  Badge,
  Button,
  Checkbox,
  DataTable,
  Dialog,
  Column,
  FormField,
  HoverCard,
  InputText,
  Message,
  Paginator,
  Popover,
  ProgressBar,
  Select,
  SelectButton,
  Skeleton,
  Slider,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  ToggleSwitch,
  useNotify,
  useThemePreference,
  type ThemePreference,
} from "../../src";
import CodeBlock from "../kit/CodeBlock.vue";
import { docGroups } from "../registry";
import { apiEntries } from "../api";

const githubUrl = "https://github.com/mango-write/mango-write-ui";
const changelogUrl = `${githubUrl}/blob/main/CHANGELOG.md`;

const { preference, setTheme } = useThemePreference();
const themeOptions: { label: string; value: ThemePreference }[] = [
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
  { label: "系统", value: "system" },
];

function updateTheme(value: unknown) {
  if (value === "light" || value === "dark" || value === "system") setTheme(value);
}

/* 数字不手写:组件数、接口行数、规范篇数都从单一真相源统计,元数据更新即跟随。 */
const inventory = docGroups
  .filter((group) => group.base === "/dev/ui/components")
  .flatMap((group) => group.entries);
const componentCount = inventory.length;
const apiRowCount = Object.values(apiEntries).reduce((sum, entry) => sum + entry.rows.length, 0);
const foundationCount = docGroups.find((group) => group.id === "foundations")?.entries.length ?? 0;

const stats = [
  { value: String(componentCount), label: "个组件" },
  { value: String(apiRowCount), label: "个接口行" },
  { value: String(foundationCount), label: "篇设计规范" },
  { value: "2", label: "套主题" },
];

const features = [
  {
    demo: "tokens",
    title: "六层 Token 单源",
    body: "颜色、文字、尺寸、圆角、层级、动效各占一层,var.css 是唯一数值来源,机械门禁禁止裸值——设计决策有据可查。",
  },
  {
    demo: "materials",
    title: "纸与霜双材质",
    body: "纸面承载内容,霜面承载浮层;模糊、高光与投影成对出现,低性能与弱透明环境自动降级,压在哪都不脏。",
  },
  {
    demo: "themes",
    title: "浅深双主题",
    body: "每个语义色都有浅色基值与深色覆盖,跟随系统或手动指定;data-theme 可挂在任意子树,局部对照只需一个属性。",
  },
  {
    demo: "typescript",
    title: "TypeScript 全量",
    body: "全部 props、事件与插槽都有类型,示例代码可以直接粘进 lang=\"ts\" 的 SFC;接口表与类型同源维护。",
  },
  {
    demo: "a11y",
    title: "无障碍内建",
    body: "原生语义打底,aria 落点、焦点环与键盘路径开箱即用;触控目标不小于 44px,聚焦态永远看得见。",
  },
  {
    demo: "tree",
    title: "按需引入",
    body: "ESM 导出,tree-shaking 只打包你 import 的组件;样式单文件一次引入,不需要按组件分批搬运。",
  },
];

/* 试驾区状态:每个面板都是真的在跑。 */
const playgroundTab = ref("controls");
const demoTitle = ref("");
const demoSection = ref<string>();
const sectionOptions = [
  { label: "引言与文献综述", value: "intro" },
  { label: "材料与方法", value: "methods" },
  { label: "实验结果", value: "results" },
  { label: "讨论与局限", value: "discussion" },
];
const demoShare = ref(false);
const demoSync = ref(true);
const demoProgress = ref(64);

const notify = useNotify();
const filterFulltext = ref(true);
const filterPdf = ref(false);
const exportOpen = ref(false);
const accordionValue = ref<string | null>("import");
const paginatorFirst = ref(0);

const papers = [
  { id: 1, title: "引文锚点与偏移坐标系", venue: "情报学报", cited: 12 },
  { id: 2, title: "长文档分段改写的一致性", venue: "中文信息学报", cited: 23 },
  { id: 3, title: "协同编辑中的操作合并", venue: "CHI", cited: 8 },
  { id: 4, title: "多模态图表抽取", venue: "ICDAR", cited: 5 },
];

/* 快速上手示例(字符串里的闭合标签要转义,避免截断 SFC)。 */
const quickstartCode = [
  `<script setup lang="ts">`,
  `import { Button } from "@mango-write/ui";`,
  `<\/script>`,
  ``,
  `<template>`,
  `  <Button label="你好,纸与霜" />`,
  `</template>`,
].join("\n");
</script>

<template>
  <div class="landing">
    <header class="landing-topbar mw-frost">
      <div class="landing-brand">
        <AppLogo />
        <span class="landing-brand__name">MangoWrite UI</span>
      </div>
      <span class="landing-topbar__spacer" />
      <SelectButton
        class="landing-theme"
        :model-value="preference"
        :options="themeOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        size="sm"
        aria-label="颜色主题"
        @update:model-value="updateTheme"
      />
      <Button
        class="landing-topbar__product"
        href="https://rewrite.mangowrite.com"
        target="_blank"
        rel="noreferrer"
        size="sm"
        variant="outlined"
        severity="secondary"
        label="降 AI"
      />
      <Button
        class="landing-topbar__product"
        href="https://mangowrite.com"
        target="_blank"
        rel="noreferrer"
        size="sm"
        label="科研平台"
      />
      <a
        class="landing-gh"
        :href="githubUrl"
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub 仓库"
      >
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      </a>
    </header>

    <main class="landing-main">
      <div class="landing-container">
        <!-- 首屏:文案 + 真组件霜卡拼贴 -->
        <section class="hero">
        <div class="hero__stage" aria-hidden="true">
          <i class="hero__glow hero__glow--a" />
          <i class="hero__glow hero__glow--b" />
          <i class="hero__glow hero__glow--c" />
          <i class="hero__dots" />
        </div>
        <div class="hero__grid">
          <div class="hero__copy">
            <div class="hero__chips anim-rise" style="--rise-delay: 40ms">
              <a class="hero__chip" :href="changelogUrl" target="_blank" rel="noreferrer">
                v0.1.0 · 更新日志
              </a>
              <span class="hero__chip">Apache-2.0</span>
              <span class="hero__chip">Vue 3 · TypeScript</span>
            </div>
            <h1 class="hero__title anim-rise" style="--rise-delay: 120ms">
              <span class="hero__title-ink">纸与霜</span>设计语言
            </h1>
            <p class="hero__lede anim-rise" style="--rise-delay: 200ms">
              MangoWrite 全线产品共用的设计语言与 Vue 3
              组件库:六层 token 单一真相源,纸面与霜面双材质,浅色深色双主题——为长时间阅读与写作而生。
            </p>
            <div class="hero__cta anim-rise" style="--rise-delay: 280ms">
              <RouterLink class="hero__cta-primary" to="/dev/ui/getting-started/installation">
                快速上手
              </RouterLink>
              <a class="hero__cta-ghost" :href="githubUrl" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <span class="hero__cta-note">旁边三张霜卡都是真组件,现在就能拖</span>
            </div>
            <dl class="hero__stats anim-rise" style="--rise-delay: 360ms">
              <div v-for="stat in stats" :key="stat.label" class="hero__stats-item">
                <dt class="hero__stats-value">{{ stat.value }}</dt>
                <dd class="hero__stats-label">{{ stat.label }}</dd>
              </div>
            </dl>
          </div>

          <div class="collage" role="group" aria-label="真组件拼贴:三张霜卡,可交互">
            <div
              class="collage-card collage-card--a anim-rise"
              data-theme="dark"
              style="--rise-delay: 300ms; --bob-delay: 0s; --bob-dur: 8s"
            >
              <span class="collage-card__label">深色 · 同一套 Token</span>
              <FormField v-slot="{ inputId }" input-id="collage-title" label="论文标题" required>
                <InputText
                  v-model="demoTitle"
                  :id="inputId"
                  placeholder="给论文起个标题"
                  size="sm"
                  fluid
                />
              </FormField>
              <label class="collage-card__check">
                <ToggleSwitch v-model="demoSync" aria-label="自动同步" />
                <span>自动同步到云端</span>
              </label>
              <div class="collage-card__actions">
                <Button size="sm" label="保存草稿" />
                <Button size="sm" variant="text" severity="secondary" label="预览" />
              </div>
            </div>

            <div
              class="collage-card collage-card--b anim-rise"
              style="--rise-delay: 420ms; --bob-delay: -2.5s; --bob-dur: 7s"
            >
              <span class="collage-card__label">实时联动 · 拖动滑块</span>
              <Slider v-model="demoProgress" :max="100" aria-label="示例进度" />
              <ProgressBar :value="demoProgress" />
              <div class="collage-card__row">
                <label class="collage-card__check">
                  <Checkbox v-model="demoShare" binary aria-label="共享给团队" />
                  <span>共享给团队</span>
                </label>
                <Avatar label="芒" shape="circle" size="sm" aria-label="芒果写作" />
              </div>
            </div>

            <div
              class="collage-card collage-card--c anim-rise"
              style="--rise-delay: 540ms; --bob-delay: -5s; --bob-dur: 9s"
            >
              <span class="collage-card__label">状态与反馈</span>
              <div class="collage-card__tags">
                <Tag value="已收录" severity="success" rounded />
                <Tag value="评审中" severity="warn" rounded />
                <Badge value="3" severity="info" size="sm" aria-label="3 条新批注" />
              </div>
              <Message severity="success">文献去重完成,移除 2 条重复。</Message>
              <div class="collage-card__actions">
                <Button size="sm" variant="outlined" severity="secondary" label="导出" />
                <Button size="sm" label="继续写作" />
              </div>
            </div>
          </div>
        </div>
        </section>
      </div>

      <!-- 组件清单:真实目录跑马灯,每一枚都链到对应文档 -->
      <div class="mq" aria-label="组件清单">
        <div class="mq__track">
          <ul class="mq__list">
            <li v-for="entry in inventory" :key="entry.slug">
              <RouterLink :to="`/dev/ui/components/${entry.slug}`" class="mq__item">
                <b>{{ entry.en }}</b>
                <span>{{ entry.title }}</span>
              </RouterLink>
            </li>
          </ul>
          <ul class="mq__list" aria-hidden="true">
            <li v-for="entry in inventory" :key="'dup-' + entry.slug">
              <RouterLink :to="`/dev/ui/components/${entry.slug}`" class="mq__item" tabindex="-1">
                <b>{{ entry.en }}</b>
                <span>{{ entry.title }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="landing-container">
        <!-- 试驾区 -->
        <section class="sec">
        <header class="sec__head">
          <div>
            <p class="sec__eyebrow">试驾</p>
            <h2 class="sec__title">真组件,不是截图</h2>
            <p class="sec__desc">
              下面每一处都是这个库真实渲染的东西——点、拖、展开都可以,Tab
              键能到达每个控件,焦点环会告诉你它在哪。
            </p>
          </div>
          <span class="pg-hint"><MousePointerClick :size="14" aria-hidden="true" />全部可交互</span>
        </header>

        <div class="pg">
          <Tabs v-model:value="playgroundTab">
            <TabList>
              <Tab value="controls">控件</Tab>
              <Tab value="feedback">反馈</Tab>
              <Tab value="overlays">浮层</Tab>
              <Tab value="structure">结构</Tab>
            </TabList>
            <TabPanels>
              <TabPanel value="controls">
                <div class="pg__grid">
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">文本框</h3>
                    <FormField
                      v-slot="{ inputId, describedBy }"
                      input-id="pg-title"
                      label="论文标题"
                      hint="输入法组合期间不回写,组合结束一次提交"
                    >
                      <InputText
                        v-model="demoTitle"
                        :id="inputId"
                        :aria-describedby="describedBy"
                        placeholder="论文标题"
                        fluid
                      />
                    </FormField>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">下拉选择</h3>
                    <FormField v-slot="{ inputId }" input-id="pg-section" label="章节">
                      <Select
                        v-model="demoSection"
                        :id="inputId"
                        :options="sectionOptions"
                        option-label="label"
                        option-value="value"
                        placeholder="选择章节"
                        show-clear
                        fluid
                      />
                    </FormField>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">复选与开关</h3>
                    <div class="pg-stack">
                      <label class="pg-check">
                        <Checkbox v-model="demoShare" binary aria-label="共享给团队" />
                        <span>共享给团队</span>
                      </label>
                      <label class="pg-check">
                        <ToggleSwitch v-model="demoSync" aria-label="自动同步" />
                        <span>自动同步到云端</span>
                      </label>
                    </div>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">滑块</h3>
                    <Slider v-model="demoProgress" :max="100" aria-label="示例进度" />
                    <p class="pg-note">当前值 {{ demoProgress }} —— 拖动时,「反馈」页的进度条与首页霜卡同步走。</p>
                  </div>
                </div>
              </TabPanel>

              <TabPanel value="feedback">
                <div class="pg__grid">
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">轻提示</h3>
                    <div class="pg__row">
                      <Button
                        size="sm"
                        severity="success"
                        label="保存成功"
                        @click="notify.success('草稿已保存', '自动同步到云端。')"
                      />
                      <Button
                        size="sm"
                        severity="warning"
                        label="空间不足"
                        @click="notify.warn('存储空间不足', '免费档位剩余 12%。')"
                      />
                      <Button
                        size="sm"
                        severity="danger"
                        label="校验失败"
                        @click="notify.error('检查失败', '3 处引用缺少年份。')"
                      />
                    </div>
                    <p class="pg-note">通知从右上角滑入,悬停会暂停自动关闭。</p>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">提示条</h3>
                    <div class="pg-stack">
                      <Message severity="info">引用格式已按 GB/T 7714 重排。</Message>
                      <Message severity="success">文献去重完成,移除 2 条重复。</Message>
                      <Message severity="warn">有 3 条来源缺少年份。</Message>
                    </div>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">进度与骨架</h3>
                    <ProgressBar :value="demoProgress" />
                    <div class="pg-skeleton">
                      <Skeleton shape="circle" size="40px" aria-hidden="true" />
                      <div class="pg-skeleton__lines">
                        <Skeleton width="100%" height="14px" aria-hidden="true" />
                        <Skeleton width="64%" height="14px" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>

              <TabPanel value="overlays">
                <div class="pg__row pg__row--wrap">
                  <div class="pg-cell pg-cell--inline">
                    <h3 class="pg-cell__label">弹出层</h3>
                    <Popover aria-label="筛选文献">
                      <template #trigger>
                        <Button variant="outlined" severity="secondary" label="筛选" />
                      </template>
                      <div class="pg-stack">
                        <label class="pg-check">
                          <Checkbox v-model="filterFulltext" binary aria-label="仅全文" />
                          <span>仅全文</span>
                        </label>
                        <label class="pg-check">
                          <Checkbox v-model="filterPdf" binary aria-label="附 PDF" />
                          <span>附 PDF</span>
                        </label>
                        <Button
                          variant="text"
                          severity="secondary"
                          size="sm"
                          label="清除"
                          @click="filterFulltext = false; filterPdf = false"
                        />
                      </div>
                    </Popover>
                  </div>
                  <div class="pg-cell pg-cell--inline">
                    <h3 class="pg-cell__label">悬停卡片</h3>
                    <HoverCard placement="top">
                      <span class="pg-anchor">芒果写作</span>
                      <template #content>
                        <div class="pg-hovercard">
                          <AppLogo />
                          <div>
                            <strong>纸与霜设计语言</strong>
                            <p>MangoWrite 全线产品共用,长文阅读不刺眼。</p>
                          </div>
                        </div>
                      </template>
                    </HoverCard>
                  </div>
                  <div class="pg-cell pg-cell--inline">
                    <h3 class="pg-cell__label">文字提示</h3>
                    <Button
                      variant="text"
                      severity="secondary"
                      label="悬停我"
                      v-tooltip="'悬停与聚焦都会展开,Escape 立即收起'"
                    />
                  </div>
                  <div class="pg-cell pg-cell--inline">
                    <h3 class="pg-cell__label">对话框</h3>
                    <Button label="导出为 PDF" @click="exportOpen = true" />
                  </div>
                </div>
              </TabPanel>

              <TabPanel value="structure">
                <div class="pg__grid">
                  <div class="pg-cell pg-cell--wide">
                    <h3 class="pg-cell__label">数据表格</h3>
                    <DataTable :value="papers" data-key="id" striped-rows row-hover>
                      <Column field="title" header="标题" sortable />
                      <Column field="venue" header="来源" />
                      <Column field="cited" header="被引" sortable />
                    </DataTable>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">折叠面板</h3>
                    <Accordion v-model:value="accordionValue">
                      <AccordionPanel value="import">
                        <AccordionHeader>样式如何引入?</AccordionHeader>
                        <AccordionContent>
                          <code class="pg-code">import "@mango-write/ui/theme.css"</code>
                          聚合入口一次引入基础与组件样式,不需要按组件分批搬运。
                        </AccordionContent>
                      </AccordionPanel>
                      <AccordionPanel value="tree">
                        <AccordionHeader>支持按需引入吗?</AccordionHeader>
                        <AccordionContent>
                          支持。ESM 导出 + tree-shaking,没 import 的组件不会进产物。
                        </AccordionContent>
                      </AccordionPanel>
                    </Accordion>
                  </div>
                  <div class="pg-cell">
                    <h3 class="pg-cell__label">分页</h3>
                    <Paginator
                      v-model:first="paginatorFirst"
                      :rows="10"
                      :total-records="87"
                      aria-label="文献分页"
                    />
                    <p class="pg-note">共 87 条 · 当前从第 {{ paginatorFirst + 1 }} 条开始</p>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>

        <Dialog v-model:open="exportOpen" title="导出为 PDF" description="包含全部正文与图表">
          <p class="pg-dialog-body">导出范围与版式可在下一步确认。</p>
          <template #footer>
            <Button variant="text" severity="secondary" label="取消" @click="exportOpen = false" />
            <Button
              label="开始导出"
              @click="
                exportOpen = false;
                notify.success('已开始导出', '完成后会在通知中心提示你。');
              "
            />
          </template>
        </Dialog>
      </section>

        <!-- LLM 产物:固定墨色舞台 -->
        <section class="sec">
        <div class="llm">
          <div class="llm__copy">
            <p class="llm__eyebrow">LLM 友好</p>
            <h2 class="llm__title">把整库文档喂给任何模型</h2>
            <p class="llm__desc">
              文档在构建期从接口元数据生成,与页面表格、站内搜索共用同一份真相源——模型读到什么,页面就是什么。
            </p>
            <ul class="llm__files">
              <li>
                <a href="/llms.txt" target="_blank" rel="noreferrer">llms.txt</a>
                <span>入口索引</span>
              </li>
              <li>
                <a href="/llms-full.txt" target="_blank" rel="noreferrer">llms-full.txt</a>
                <span>整库单文件,一次读完</span>
              </li>
              <li>
                <a href="/api/button.md" target="_blank" rel="noreferrer">api/button.md</a>
                <span>单组件接口 + 示例,共 {{ componentCount }} 份</span>
              </li>
            </ul>
          </div>
          <div class="llm__term" aria-label="产物内容示例">
            <p class="llm__term-head">终端 · 产物一览</p>
            <pre class="llm__term-body"><span>$ ls</span>
api/            llms.txt
CHANGELOG.md    llms-full.txt
<span>$ head -6 llms-full.txt</span>
# @mango-write/ui · 纸与霜设计语言
Vue 3 组件库 · {{ componentCount }} 组件 · Apache-2.0
## 按钮 Button
| 名称 | 取值 | 说明 |
| --- | --- | --- |
| variant | primary · outlined · text | 视觉变体…</pre>
          </div>
        </div>
      </section>

      <!-- 特性 -->
      <section class="sec">
        <header class="sec__head">
          <div>
            <p class="sec__eyebrow">为什么是纸与霜</p>
            <h2 class="sec__title">设计决策有据可查</h2>
            <p class="sec__desc">六层 token、双材质、双主题,以及一套机械门禁——下面每一张卡里都是真的在生效。</p>
          </div>
        </header>
        <div class="feat__grid">
          <article v-for="feature in features" :key="feature.title" class="feat">
            <div class="feat__demo" aria-hidden="true">
              <div v-if="feature.demo === 'tokens'" class="feat-tokens">
                <i class="feat-tokens__dot" data-c="accent" />
                <i class="feat-tokens__dot" data-c="success" />
                <i class="feat-tokens__dot" data-c="warning" />
                <i class="feat-tokens__dot" data-c="info" />
                <i class="feat-tokens__dot" data-c="danger" />
                <code>--accent</code>
              </div>
              <div v-else-if="feature.demo === 'materials'" class="feat-mats">
                <span class="feat-mats__paper">纸</span>
                <span class="feat-mats__frost mw-frost">霜</span>
              </div>
              <div v-else-if="feature.demo === 'themes'" class="feat-themes">
                <span class="feat-themes__half" data-theme="light">
                  <i /><b>浅色</b>
                </span>
                <span class="feat-themes__half" data-theme="dark">
                  <i /><b>深色</b>
                </span>
              </div>
              <code v-else-if="feature.demo === 'typescript'" class="feat__code">
                &lt;Button variant="outlined" /&gt;
              </code>
              <div v-else-if="feature.demo === 'a11y'" class="feat-focus">
                <span class="feat-focus__ring">focus-visible</span>
              </div>
              <code v-else class="feat__code">import { Button } from "@mango-write/ui"</code>
            </div>
            <h3 class="feat__title">{{ feature.title }}</h3>
            <p class="feat__body">{{ feature.body }}</p>
          </article>
        </div>
      </section>

      <!-- 快速上手 -->
      <section class="sec">
        <div class="qs">
          <div class="qs__copy">
            <p class="sec__eyebrow">接入</p>
            <h2 class="sec__title">三行开始</h2>
            <ol class="qs__steps">
              <li>
                <code>pnpm add @mango-write/ui</code>
                <span>安装依赖</span>
              </li>
              <li>
                <code>import "@mango-write/ui/theme.css"</code>
                <span>在入口引入样式(聚合基础与组件样式)</span>
              </li>
              <li>
                <code>import { Button } from "@mango-write/ui"</code>
                <span>按需取用,想用哪个 import 哪个</span>
              </li>
            </ol>
            <RouterLink class="hero__cta-primary" to="/dev/ui/getting-started/installation">
              阅读完整指引
            </RouterLink>
          </div>
          <div class="qs__code">
            <CodeBlock title="App.vue" :code="quickstartCode" />
          </div>
        </div>
      </section>

      <!-- 由它驱动的产品 -->
      <section class="sec">
        <header class="sec__head">
          <div>
            <p class="sec__eyebrow">实战</p>
            <h2 class="sec__title">由它驱动的产品</h2>
          </div>
        </header>
        <div class="prod__grid">
          <a
            class="prod mw-frost"
            href="https://mangowrite.com"
            target="_blank"
            rel="noreferrer"
          >
            <h3 class="prod__title">芒果写作 · 科研平台</h3>
            <p class="prod__body">AI 科研写作工作台:素材、理解、沉淀、写作、发布的数据闭环。</p>
            <span class="prod__cta">前往科研平台 →</span>
          </a>
          <a
            class="prod mw-frost"
            href="https://rewrite.mangowrite.com"
            target="_blank"
            rel="noreferrer"
          >
            <h3 class="prod__title">芒果写作降 AI</h3>
            <p class="prod__body">论文降 AI 率、降 AIGC 率与 AI 率检测,改写全程可追溯。</p>
            <span class="prod__cta">前往降 AI →</span>
          </a>
        </div>
      </section>
      </div>
    </main>

    <footer class="landing-footer">
      <span>© 2026 MangoWrite · 以 Apache-2.0 发布</span>
      <nav class="landing-footer__links" aria-label="机器可读文档">
        <a href="/llms.txt" target="_blank" rel="noreferrer">llms.txt</a>
        <a href="/llms-full.txt" target="_blank" rel="noreferrer">llms-full.txt</a>
        <a :href="githubUrl" target="_blank" rel="noreferrer">github.com/mango-write/mango-write-ui</a>
      </nav>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-canvas);
  color: var(--text-primary);
}

/* ── 顶栏 ─────────────────────────────────────────── */
.landing-topbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  border-radius: 0;
  border-width: 0 0 var(--border-width);
}

.landing-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.landing-brand__name {
  font-size: var(--type-title-size);
  font-weight: var(--weight-semibold);
}

.landing-topbar__spacer {
  flex: 1;
}

.landing-gh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-sm-h);
  height: var(--size-sm-h);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.landing-gh:hover {
  background: var(--fill-default);
  color: var(--text-primary);
}

/* ── 首屏 ─────────────────────────────────────────── */
.landing-main {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 0 var(--space-12);
}

.landing-container {
  width: 100%;
  max-width: var(--container-content);
  margin: 0 auto;
  padding: 0 var(--space-6);
  box-sizing: border-box;
}

.hero {
  position: relative;
  overflow: clip;
  padding: var(--space-10) 0 var(--space-8);
}

.hero__stage {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero__glow {
  position: absolute;
  border-radius: var(--radius-full);
}

/* 光斑溢出量必须小于 (尺寸 − 0.7×半径)/2 的安全余量,否则会在 overflow:clip 处留下硬切线 */
.hero__glow--a {
  top: calc(var(--space-16) * -1);
  right: calc(var(--space-16) * -1);
  width: calc(var(--space-20) * 7);
  height: calc(var(--space-20) * 7);
  background: radial-gradient(closest-side, color-mix(in srgb, var(--accent) 16%, transparent), transparent 72%);
}

.hero__glow--b {
  bottom: calc(var(--space-16) * -1);
  left: calc(var(--space-16) * -1);
  width: calc(var(--space-20) * 6);
  height: calc(var(--space-20) * 6);
  background: radial-gradient(closest-side, color-mix(in srgb, var(--accent-pressed) 10%, transparent), transparent 70%);
}

.hero__glow--c {
  top: calc(var(--space-16));
  left: calc(var(--space-20) * 3);
  width: calc(var(--space-20) * 4);
  height: calc(var(--space-20) * 4);
  background: radial-gradient(closest-side, color-mix(in srgb, var(--info) 8%, transparent), transparent 70%);
}

.hero__dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(color-mix(in srgb, var(--ink-rgb) 15%, transparent) 1px, transparent 1px);
  background-size: var(--space-4) var(--space-4);
  -webkit-mask-image: linear-gradient(to bottom, color-mix(in srgb, var(--text-primary) 85%, transparent), transparent 82%);
  mask-image: linear-gradient(to bottom, color-mix(in srgb, var(--text-primary) 85%, transparent), transparent 82%);
}

.hero__grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.04fr) minmax(0, 0.96fr);
  gap: var(--space-10);
  align-items: center;
}

.hero__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
}

.hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.hero__chip {
  display: inline-flex;
  align-items: center;
  height: var(--size-sm-h);
  padding: 0 var(--space-2-5);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  text-decoration: none;
}

a.hero__chip:hover {
  border-color: var(--border-strong);
  color: var(--text-primary);
}

.hero__title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: calc(var(--type-display-lg-size) * 1.45);
  line-height: var(--type-display-lg-line);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-display);
}

.hero__title-ink {
  background-image: linear-gradient(104deg, var(--accent) 20%, var(--text-accent) 88%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero__lede {
  margin: 0;
  max-width: 38em;
  font-size: var(--type-body-lg-size);
  line-height: var(--type-body-lg-line);
  color: var(--text-secondary);
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.hero__cta-primary,
.hero__cta-ghost {
  display: inline-flex;
  align-items: center;
  height: var(--size-lg-h);
  padding: 0 var(--size-lg-px);
  border-radius: var(--size-lg-radius);
  font-size: var(--size-lg-font);
  font-weight: var(--weight-medium);
  text-decoration: none;
}

.hero__cta-primary {
  background: var(--accent);
  color: var(--text-on-accent);
}

.hero__cta-primary:hover {
  background: var(--accent-hover);
}

.hero__cta-primary:active {
  background: var(--accent-pressed);
}

.hero__cta-ghost {
  border: var(--border-width) solid var(--border-default);
  color: var(--text-primary);
}

.hero__cta-ghost:hover {
  background: var(--fill-default);
}

.hero__cta-note {
  font-size: var(--type-caption-size);
  color: var(--text-tertiary);
}

.hero__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
  margin: var(--space-2) 0 0;
}

.hero__stats-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.hero__stats-value {
  font-size: var(--type-headline-size);
  line-height: var(--type-headline-line);
  font-weight: var(--weight-semibold);
}

.hero__stats-label {
  margin: 0;
  font-size: var(--type-caption-size);
  color: var(--text-tertiary);
}

/* ── 霜卡拼贴(签名元素:真组件,不是截图) ───────────── */
.collage {
  position: relative;
  min-height: calc(var(--space-12) * 12);
}

.collage-card {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-card);
  animation:
    rise var(--duration-slower) var(--ease-enter) backwards var(--rise-delay, 0s),
    bob var(--bob-dur, 8s) ease-in-out infinite alternate var(--bob-delay, 0s);
}

.mw-frost.collage-card,
.collage-card.mw-frost {
  border-radius: var(--radius-card);
}

.collage-card--a {
  top: 0;
  left: 0;
  width: 62%;
  max-width: calc(var(--space-12) * 6.5);
  rotate: -2deg;
}

.collage-card--b {
  top: calc(var(--space-12) * 2.6);
  right: 0;
  width: 56%;
  max-width: calc(var(--space-12) * 5.8);
  rotate: 1.6deg;
}

.collage-card--c {
  top: calc(var(--space-12) * 6.9);
  left: calc(var(--space-8));
  width: 66%;
  max-width: calc(var(--space-12) * 7);
  rotate: -1.2deg;
}

.collage-card--a,
.collage-card--b,
.collage-card--c {
  box-shadow: var(--shadow-floating);
}

.collage-card:not([data-theme="dark"]) {
  background: var(--bg-surface);
  border: var(--border-width) solid var(--border-subtle);
}

.collage-card--a {
  background: var(--bg-surface);
  border: var(--border-width) solid var(--border-subtle);
}

.collage-card__label {
  font-size: var(--type-micro-size);
  line-height: var(--type-micro-line);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.collage-card__check {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  color: var(--text-secondary);
  cursor: pointer;
}

.collage-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.collage-card__tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.collage-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* ── 组件清单跑马灯(真实目录) ─────────────────────── */
.mq {
  overflow: hidden;
  border-top: var(--border-width) solid var(--border-subtle);
  border-bottom: var(--border-width) solid var(--border-subtle);
  background: var(--bg-surface);
  padding: var(--space-3) 0;
  margin: var(--space-6) 0 0;
}

.mq__track {
  display: flex;
  width: max-content;
  animation: marquee 72s linear infinite;
}

.mq:hover .mq__track {
  animation-play-state: paused;
}

.mq__list {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: 0 var(--space-2) 0 0;
  list-style: none;
}

.mq__item {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-1-5);
  white-space: nowrap;
  padding: var(--space-1) var(--space-3);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--bg-canvas);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  text-decoration: none;
  color: var(--text-secondary);
}

.mq__item b {
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.mq__item span {
  color: var(--text-tertiary);
}

.mq__item:hover {
  border-color: var(--border-strong);
  background: var(--fill-default);
}

/* ── 通用段落 ─────────────────────────────────────── */
.sec {
  margin-top: calc(var(--space-12) * 2);
}

.sec__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.sec__eyebrow {
  margin: 0;
  color: var(--text-accent);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
}

.sec__title {
  margin: var(--space-1) 0 0;
  font-family: var(--font-serif);
  font-size: var(--type-headline-size);
  line-height: var(--type-headline-line);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-title);
}

.sec__desc {
  max-width: var(--container-prose);
  margin: var(--space-2) 0 0;
  color: var(--text-secondary);
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
}

.pg-hint {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1-5);
  padding: 0 var(--space-2-5);
  height: var(--size-sm-h);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--text-tertiary);
  font-size: var(--type-caption-size);
  white-space: nowrap;
}

/* ── 试驾区 ───────────────────────────────────────── */
.pg {
  padding: var(--space-5) var(--space-5) var(--space-6);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  box-shadow: var(--shadow-raised);
}

.pg__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: var(--space-4);
  padding-top: var(--space-4);
}

.pg-cell {
  padding: var(--space-4) var(--space-5);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-card);
  background: var(--bg-raised);
  min-width: 0;
}

.pg-cell--wide {
  grid-column: 1 / -1;
}

.pg-cell--inline {
  flex: 1 1 auto;
}

.pg-cell__label {
  margin: 0 0 var(--space-3);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-weight: var(--weight-medium);
  color: var(--text-tertiary);
}

.pg-stack {
  display: grid;
  gap: var(--space-3);
}

.pg__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.pg__row--wrap {
  align-items: stretch;
  padding-top: var(--space-4);
}

.pg__row--wrap .pg-cell {
  flex: 1 1 220px;
}

.pg-check {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  color: var(--text-secondary);
  cursor: pointer;
}

.pg-note {
  margin: var(--space-3) 0 0;
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  color: var(--text-tertiary);
}

.pg-skeleton {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.pg-skeleton__lines {
  flex: 1;
  display: grid;
  gap: var(--space-2);
}

.pg-anchor {
  color: var(--text-accent);
  font-weight: var(--weight-medium);
  text-decoration: underline dotted;
  text-underline-offset: calc(var(--space-0-5) * 2);
  cursor: help;
}

.pg-hovercard {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  max-width: 260px;
}

.pg-hovercard p {
  margin: var(--space-1) 0 0;
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  color: var(--text-secondary);
}

.pg-code {
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  padding: 0 var(--space-1);
  border-radius: var(--radius-xs);
  background: var(--fill-default);
}

.pg-dialog-body {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
}

/* ── LLM 舞台(墨色,不随主题翻转) ─────────────────── */
.llm {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-8);
  padding: var(--space-8);
  border-radius: var(--radius-2xl);
  background: var(--site-ink);
  color: var(--site-on-ink);
}

.llm__eyebrow {
  margin: 0;
  color: var(--accent-hover);
  font-size: var(--type-caption-size);
  line-height: var(--type-caption-line);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
}

.llm__title {
  margin: var(--space-2) 0 0;
  font-family: var(--font-serif);
  font-size: var(--type-headline-size);
  line-height: var(--type-headline-line);
  font-weight: var(--weight-semibold);
}

.llm__desc {
  margin: var(--space-3) 0 0;
  max-width: 32em;
  color: var(--site-on-ink-muted);
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
}

.llm__files {
  margin: var(--space-5) 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--space-2);
}

.llm__files li {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.llm__files a {
  font-family: var(--font-mono);
  font-size: var(--type-body-sm-size);
  color: var(--site-on-ink);
  text-decoration: underline;
  text-decoration-color: var(--site-ink-line);
  text-underline-offset: calc(var(--space-0-5) * 2);
}

.llm__files a:hover {
  text-decoration-color: var(--accent-hover);
}

.llm__files span {
  color: var(--site-on-ink-muted);
  font-size: var(--type-caption-size);
}

.llm__term {
  overflow: hidden;
  border: var(--border-width) solid var(--site-ink-line);
  border-radius: var(--radius-card);
  background: var(--site-ink-raised);
}

.llm__term-head {
  margin: 0;
  padding: var(--space-2) var(--space-4);
  border-bottom: var(--border-width) solid var(--site-ink-line);
  color: var(--site-on-ink-muted);
  font-size: var(--type-micro-size);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
}

.llm__term-body {
  margin: 0;
  padding: var(--space-4);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  line-height: var(--type-body-sm-line);
  color: var(--site-on-ink);
}

.llm__term-body span {
  color: var(--accent-hover);
}

/* ── 特性 ─────────────────────────────────────────── */
.feat__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: var(--space-4);
}

.feat {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-card);
  background: var(--bg-surface);
}

.feat__demo {
  display: flex;
  align-items: center;
  min-height: calc(var(--space-12) * 1.5);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--bg-sunken);
  overflow: hidden;
}

.feat__title {
  margin: 0;
  font-size: var(--type-title-lg-size);
  line-height: var(--type-title-lg-line);
  font-weight: var(--weight-semibold);
}

.feat__body {
  margin: 0;
  font-size: var(--type-body-sm-size);
  line-height: var(--type-body-sm-line);
  color: var(--text-secondary);
}

.feat-tokens {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.feat-tokens__dot {
  width: calc(var(--space-4));
  height: calc(var(--space-4));
  border-radius: var(--radius-full);
}

.feat-tokens__dot[data-c="accent"] { background: var(--accent); }
.feat-tokens__dot[data-c="success"] { background: var(--success); }
.feat-tokens__dot[data-c="warning"] { background: var(--warning); }
.feat-tokens__dot[data-c="info"] { background: var(--info); }
.feat-tokens__dot[data-c="danger"] { background: var(--danger); }

.feat-tokens code {
  margin-left: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  color: var(--text-tertiary);
}

.feat-mats {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.feat-mats__paper,
.feat-mats__frost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--space-12) * 1.5);
  height: calc(var(--space-12) * 1.5);
  border-radius: var(--radius-md);
  font-size: var(--type-body-sm-size);
  color: var(--text-secondary);
}

.feat-mats__paper {
  background: var(--bg-raised);
  border: var(--border-width) solid var(--border-subtle);
}

.feat-mats__frost {
  border-radius: var(--radius-md);
}

.feat-themes {
  display: flex;
  width: 100%;
  max-width: calc(var(--space-12) * 6);
  border: var(--border-width) solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.feat-themes__half {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  background: var(--bg-surface);
}

.feat-themes__half i {
  width: var(--space-3);
  height: var(--space-3);
  border-radius: var(--radius-full);
  background: var(--accent);
}

.feat-themes__half b {
  font-size: var(--type-caption-size);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
}

.feat__code {
  font-family: var(--font-mono);
  font-size: var(--type-caption-size);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow-x: auto;
}

.feat-focus__ring {
  display: inline-flex;
  align-items: center;
  height: var(--control-h);
  padding: 0 var(--control-px);
  border: var(--border-width) solid var(--accent);
  border-radius: var(--control-radius);
  box-shadow: var(--focus-shadow);
  font-size: var(--control-font);
  color: var(--text-primary);
}

/* ── 快速上手 ─────────────────────────────────────── */
.qs {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: center;
}

.qs__steps {
  margin: var(--space-4) 0 var(--space-6);
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--space-3);
  counter-reset: qs-step;
}

.qs__steps li {
  position: relative;
  padding-left: var(--space-8);
  counter-increment: qs-step;
}

.qs__steps li::before {
  content: counter(qs-step);
  position: absolute;
  left: 0;
  top: 50%;
  translate: 0 -50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--space-5));
  height: calc(var(--space-5));
  border-radius: var(--radius-full);
  background: var(--accent-subtle);
  color: var(--text-accent);
  font-size: var(--type-caption-size);
  font-weight: var(--weight-semibold);
}

.qs__steps code {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--type-body-sm-size);
  color: var(--text-primary);
}

.qs__steps span {
  font-size: var(--type-caption-size);
  color: var(--text-tertiary);
}

.qs__code {
  min-width: 0;
}

/* ── 产品 ─────────────────────────────────────────── */
.prod__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.prod {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-6);
  border-radius: var(--radius-card);
  text-decoration: none;
  color: inherit;
  transition: transform var(--duration-base) var(--ease-standard);
}

.prod:hover {
  transform: translateY(calc(var(--space-1) * -1));
}

.prod__title {
  margin: 0;
  font-size: var(--type-title-lg-size);
  line-height: var(--type-title-lg-line);
  font-weight: var(--weight-semibold);
}

.prod__body {
  margin: 0;
  font-size: var(--type-body-size);
  line-height: var(--type-body-line);
  color: var(--text-secondary);
}

.prod__cta {
  margin-top: var(--space-1);
  font-size: var(--type-body-sm-size);
  font-weight: var(--weight-medium);
  color: var(--text-accent);
}

/* ── 页脚 ─────────────────────────────────────────── */
.landing-footer {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: var(--border-width) solid var(--border-subtle);
  font-size: var(--type-caption-size);
  color: var(--text-tertiary);
}

.landing-footer a {
  color: inherit;
}

.landing-footer a:hover {
  color: var(--text-primary);
}

.landing-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

/* ── 动效 ─────────────────────────────────────────── */
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(var(--motion-enter-offset));
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes bob {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(var(--space-2) * -1));
  }
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.anim-rise {
  animation: rise var(--duration-slower) var(--ease-enter) backwards var(--rise-delay, 0s);
}

/* ── 降级与响应式 ─────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .anim-rise,
  .collage-card,
  .mq__track {
    animation: none;
  }
}

@media (max-width: 1080px) {
  .hero__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .collage {
    min-height: 0;
    display: grid;
    gap: var(--space-4);
    margin-top: var(--space-4);
  }

  .collage-card {
    position: static;
    width: 100%;
    max-width: calc(var(--space-12) * 11);
  }

  .collage-card--a,
  .collage-card--b,
  .collage-card--c {
    rotate: 0deg;
  }

  .llm,
  .qs {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 720px) {
  .landing-topbar {
    gap: var(--space-2);
    padding: var(--space-3) var(--space-3);
  }

  .landing-topbar__product {
    display: none;
  }

  .landing-container {
    padding: 0 var(--space-4);
  }

  .hero {
    padding-top: var(--space-6);
  }

  .hero__title {
    font-size: var(--type-display-lg-size);
  }

  .sec {
    margin-top: calc(var(--space-12) * 1.5);
  }

  .sec__head {
    flex-direction: column;
    align-items: flex-start;
  }

  .prod__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero__stats {
    gap: var(--space-5);
  }
}

@media (max-width: 480px) {
  .landing-brand__name {
    display: none;
  }
}
</style>
