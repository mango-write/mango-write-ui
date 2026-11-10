# Mango 桌面端设计规范 ·「精细工作台」（Desktop）

> 本文定义 `@mango-write/ui` 在 **Desktop 桌面与宽屏 Web 端**（`@mango-write/ui-vue`、`@mango-write/ui-react`、`apps/web`、`apps/write-desktop`）的专属设计规范。
> 跨端共享色彩、材质与动效总纲见 [`DESIGN.md`](DESIGN.md)；掌上与小程序端规范见 [`DESIGN-MOBILE.md`](DESIGN-MOBILE.md)。

## 1. 桌面端人机假设

1. **高精度指针输入（Mouse / Trackpad）**：指针精度 1px，具备持续的悬停态（`:hover`）与右键/快捷键上下文；
2. **中远视距（50–65cm）与大画幅视口（1280px–2560px）**：单屏同时承载导航、文档树、正文编辑器与 AI 副驾多列信息，要求**高信息密度、低视觉噪点**；
3. **键盘可达性（Keyboard Navigation）**：高频通过 `Tab`、`Cmd+K`、方向键与 `Esc` 操作，每个可交互元素必须具备清晰的键盘焦点环（Focus Ring）或焦点晕（Focus Halo）。

## 2. 桌面端尺寸轴与密度上下文

桌面端以 **`md (32px)`** 为默认档位，界面正文字号默认取 **`13px`（`--type-body-sm-size`）**：

| 档位 | 高度 (`-h`) | 字号 (`-font`) | 图标 (`-icon`) | 横向内距 (`-px`) | 间隙 (`-gap`) | 圆角 (`-radius`) | 典型场景 |
|---|---|---|---|---|---|---|---|
| `xs` | `24px` | `12px` | `14px` | `6px` | `4px` | `6px` | 编辑器/表格内嵌微按钮、行内胶囊 |
| `sm` | `28px` | `12px` | `14px` | `8px` | `6px` | `6px` | 顶部工具条、表格筛选栏、紧凑卡片操作 |
| `md`（**默认**） | `32px` | `13px` | `16px` | `12px` | `6px` | `8px` | 标准表单、对话框、常规页面顶栏 |
| `lg` | `40px` | `14px` | `18px` | `16px` | `8px` | `10px` | 营销落地页主按钮、登录页与空状态主 CTA |

- **容器定档**：容器挂 `.mw-size-sm` 即令内部所有未定档控件同步切换至紧凑档；`.mw-toolbar` 角色去除控件底色、仅保留发丝边与 `.is-active` 选中着色。
- **触屏偶发兼容**：桌面端在 `@media (pointer: coarse)` 下保持视觉尺寸不变，仅用伪元素将可点热区扩展至 `--hit-min (44px)`。

## 3. 控件形态與交互状态（Hover & Focus Ring）

1. **清晰描边与微体积感（Bordered Controls）**：
   - 大屏背光环境下，输入控件与次要按钮依靠 `1px solid var(--control-border)`、微渐变表面 `--control-face` 与顶底内高光 `--control-inset` 界定清晰边界。
2. **Hover → Active → Focus 三态递进**：
   - **Hover**：鼠标移入时，背景从静息态切换至 `--fill-default` 或 `--control-bg-hover`，边框升为 `--border-strong`（耗时 `--duration-fast: 110ms`）；
   - **Focus**：按钮、Tab、复选框采用外扩焦点环（`outline: 2px solid var(--focus-color); outline-offset: 2px`）；输入框与选择器采用焦点晕（`border-color: var(--focus-color); box-shadow: var(--focus-shadow)`）。

## 4. 空间拓扑：画布多浮岛与边缘渐隐

- **多浮岛工作台（Floating Islands on Canvas）**：底层为 `--shell-canvas` 画布，其上并排悬浮 Sidebar（`260px`）/ Rail（`48px`）、主工作区纸面浮岛（Sheet，圆角 `--radius-sheet: 12px`，间距 `--shell-gutter: 6px`）与右侧 Copilot 面板（`320px`）。
- **滚动边缘渐隐（Scroll Edge Fade）**：溢出容器的内容通过 `v-scroll-fade`（`mask-image` alpha 裁切，默认 `24px`、紧凑档 `12px`）在内容出口侧呈现柔和渐隐，贴边到底时立即撤去遮罩。

## 5. 桌面端浮层范式：锚定弹出与四档居中弹窗

桌面端空间充裕，遵循**「就近锚定（Anchored to Trigger）」**原则：

1. **轻量选择与菜单（Popover / Select / Menu / HoverCard）**：直接锚定在触发按钮旁弹出（`.mw-frost` + `--shadow-floating`），进场伴随 `4px` 位移与 `0.97` 缩放（`180ms`）。
2. **居中模态弹窗（Dialog 四档标准宽度）**：
   - `sm (440px)`：单一动作窄表单；
   - `md (640px)`：多分段双栏配置窗（`.mw-dialog-grid`）；
   - `lg (860px)`：主从表、权限勾选矩阵（锁死外层滚动，仅表体内滚、表头吸顶）；
   - `xl (min(1100px, 94vw))`：看板多维下钻分析窗（常驻 `#scope` 范围条与 `#toolbar` 筛选条）。

## 6. 管理后台四壳模板与下钻规范（Admin Console Shells）

所有后台业务视图必须装入 4 套标准外壳，严格区分**固定常驻页面要素（Page Chrome）**与**唯一可滚动数据层（Data Plane）**：

1. **`AdminListPage`（列表检索页）**：页头 `#actions` + `#summary` 汇总条 + 单行 `#filters`（回车/变更即查，无搜索重置按钮） + `DataTable`（表头实底吸顶、仅 `tbody` 内滚） + 底栏 `Paginator`。
2. **`AdminConfigPage`（配置表单页）**：页头右侧常驻「N 项未保存」与唯一「保存」按钮 + `.admin-config-page__body` 独立滚动承载 `ConfigSection` 与三列 `ConfigRow`（`168px` 标签 / `280px` 控件 / 余宽后果说明）。
3. **`AdminDetailPage`（对象详情页）**：经 `ADMIN_HEADER_LEAD_TAKEN` 将返回按钮与对象名注入宿主顶栏左侧 + 顶部常驻 `StatCard` 网格 + 页内 `Tabs` + 唯一滚动明细区。
4. **`AdminBoardPage`（数据看板页）**：全局时间窗与维度筛选上呈页头右侧 + 下方数据区流式滚动承载 `StatBar` 与 `AdminBoardSection`（右上角 `#drill` 触发同窗多级下钻，严禁弹窗叠弹窗）。
