# Mango 移动端与微信小程序设计规范

> 适用于 `@mango-write/ui-mp` 与移动 H5。数值唯一真源是 [`packages/core/src/mobile-tokens.css`](packages/core/src/mobile-tokens.css)，颜色与共享语义来自 `var.css`。

## 产品原则

移动端是研究信息流，不是桌面组件的缩小版。设计围绕快速记录、可靠查阅、带当前空间上下文提问三个任务展开。

1. **内容先于装饰**：标题、正文和来源拥有完整宽度，元信息独立成行，不前导符号、时间和箭头挤压内容。
2. **任务先于零件**：一个视图只有一个主要动作。日志新建、文库查阅与摘录、助手提问各有明确落点。
3. **空间始终可见**：顶栏提供空间入口，助手显示当前上下文；列表、搜索与问答不跨空间泄漏。
4. **来源随内容流动**：文献摘录进入日志时保留标题与 DOI。
5. **反馈诚实且不阻塞**：演示与真实服务结果可区分，Toast 不堆叠、不遮挡主操作、不复活旧消息。

## 信息架构

- **顶栏**：只承载返回或当前空间入口及编辑页标题。微信端按真实胶囊信息避让，不绘制伪胶囊，空间业务通过 `leading` 插槽接入。
- **内容区**：`MpPageHeader` 进入内容流，`MpSectionHeader` 组织次级层级。默认使用通栏单列信息流，`MpCellGroup.grouped` 仅用于确需分组的短行。
- **底部导航**：一级目的地使用 24px 矢量图标与 12px 标签；数量只在确有通知语义时使用 `MpBadge`。
- **主操作区**：使用 `MpBottomActionBar`，AI 提问使用 `MpComposer`；内容区预留对应高度。
- **浮层**：轻量详情使用 `MpSheet`，单选使用 `MpSelectSheet`，条目动作使用 `MpActionSheet`；长文编辑使用独立全屏页，居中确认只用于需要明确决定的操作。

## 排版与内容

| 语义 | 大小 / 行高 | 用途 |
|---|---|---|
| micro | 11 / 16px | 底部导航、通知徽标 |
| caption | 12 / 18px | 时间、计数与辅助元信息 |
| subhead | 13 / 20px | 摘要、作者、筛选胶囊、设置说明 |
| body | 15 / 22px | 控件、列表标题、问答正文 |
| reading | 16 / 26px | 日志正文与重点阅读内容 |
| title-sm | 16 / 22px | 编辑页导航标题 |
| title | 18 / 24px | Sheet 与详情标题 |
| title-lg | 22 / 28px | 一级任务标题 |

长英文、DOI 与混合中英文必须允许断行。摘要最多两行，详情进入页面或 Sheet；列表标题与时间不得争夺同一横向轨道。

## 触控、图标与色彩

- 交互按钮提供 `sm=36px`（行内/次级紧凑动作）、`md=44px`（默认触控标准）、`lg=48px`（底部主操作）三档，静态标签 `xs=28px`；筛选胶囊视觉高 `32px` 并通过扩展触控区满足 `44px` 点击舒适度。顶栏净高 `44px`，底部导航净高 `52px`。
- 图标使用 18/20/22/24px 角色尺寸和 `MpIcon` 的统一矢量路径、线宽与旋转动效，不用 Unicode 字符模拟图标。
- 图标按钮必须有可访问名称，装饰图标对辅助技术隐藏。
- 浅色使用暖灰画布（`--bg-canvas`）与凹陷输入面（`--bg-sunken` + `--border-subtle`，聚焦时升起为 `--bg-raised` + `--accent-border`），确保输入框在白卡与霜面抽屉内边界清晰。
- 橙色主动作与用户消息气泡统一使用品牌「橙底白字」（`--mp-accent-ink: var(--text-on-accent)`），画布元信息使用 `--mp-text-meta`。
- 按压反馈立即出现，只使用轻微缩放或填充变化，不依赖 hover；减少动效与减少透明度均有降级。

## 组件语义与公共模式

- `MpTag` 只展示静态分类，`MpFilterChip` / `MpFilterBar` 才承担选择，`MpSwitch` 承担布尔开关并暴露 `role="switch"` 与 `aria-checked`。
- `MpCell` 区分 clickable 按钮与 selectable option；`MpActionSheet` 不拥有选择值，`MpSelectSheet` 才拥有单选 `v-model`。
- `MpEmpty` 负责空数据与错误恢复，加载由 `MpLoading` 独立表达，空态的 `#action` 必须真实渲染。
- `MpFormField` 关联 label、hint、error 与真实输入节点；placeholder 不替代标签。
- `MpPageHeader`、`MpSectionHeader`、`MpFilterBar`、`MpBottomActionBar`、`MpComposer`、`MpNotice`、`MpMessage` 是通用交互模式，不持有业务请求或业务 store。
- 公共组件显式转发容器和交互属性；`class/style` 与 `id/name/aria-*/data-*` 的落点不得依赖 Vue 的偶然透传。

## 浮层与反馈

- Sheet 顶角 22px，最大高度为包含块的 88%；正文可滚动，底部动作保持稳定。
- 所有模态浮层共享初始焦点、焦点约束、最内层 Esc、关闭后焦点恢复和卸载清理；H5 同时管理背景滚动，小程序无 DOM 时安全降级。
- Confirm 默认聚焦取消。普通 Toast 使用 polite 播报，错误使用 assertive；只展示最新一条，可手动关闭且不清空输入。
- 预览容器使用 `contained` 绝对定位，真实页面使用 fixed 定位；预览根节点不得以桌面浏览器的 `100vh` 代替手机视口。

## 设备视口基准与验收边界

| 预设档位 | 逻辑视口（CSS px） | 比例 / 物理分辨率 / DPR | 屏幕形态与适配策略 |
|---|---|---|---|
| **iPhone 18 Pro（默认开发基准）** | **402 × 874** | `19.5:9` · `1206 × 2622` · `@3x` | 6.3" 灵动岛 + Home Bar；所有移动端组件与页面的 1:1 标准开发视口（`compact`） |
| **iPhone 18 Pro Max** | **440 × 956** | `19.5:9` · `1320 × 2868` · `@3x` | 6.9" iOS 大屏；检验宽幅单栏排版与大屏纵向留白（`compact`） |
| **Android 主流新机（21:9 修长屏）** | **414 × 966** | `21:9` · `1242 × 2898` · `@3x` | 6.7" 居中挖孔 + 手势条；检验主流 414px 宽、21:9 修长信息流与吸底交互（`compact`） |
| **HUAWEI Pura X（16:10 阔折叠）** | **440 × 706** | `16:10` · `1320 × 2120` · `@3x` | 6.3" 阔折叠内屏；触发 `.mw-mp-root--wide-short`，收敛 Sheet 最大高度（`78%`）、紧凑操作项高度（`44px`）与空态上下间距，防止短高屏溢出 |
| **iPhone Duo（折叠展开态）** | **688 × 874** | `4:5` · `2064 × 2622` · `@3x` | 7.8" 书本式折叠内屏；触发 `.mw-mp-root--expanded`，`MpSheet` / `MpActionSheet` / `MpToast` 居中限宽（`max-width: 480px`），`MpBottomActionBar` / `MpComposer` 居中限宽（`max-width: 520px`），`.mw-mp-split` 与 `.mw-mp-grid-adaptive` 自动升维为双栏布局 |

- 状态使用语义类名，WXSS 不依赖属性选择器；主题与视口形态（`compact` / `wide-short` / `expanded`）由 `MpThemeProvider` 统一挂载，同时兼容小程序 WXSS 与 H5/Playground 1:1 容器预览。
- 同一 Vue 源码必须构建 H5 与 `mp-weixin`；H5 预览不替代微信验收。
- 组件库只拥有通用组件与模式，产品页面、演示数据、路由与业务状态归 `apps/write-mp`。
- playground 按注册表提供真实预览、有效配置和生成代码；预览舞台默认按 **iPhone 18 Pro（402 × 874 px）1:1 真实宽高渲染**（不随桌面窗口拉伸变形），切换到 **iPhone Duo（688 × 874 px）** 时右侧舞台自动拓宽承载 1:1 展开态，并提供 `1:1 原尺寸 / 自适应` 查看模式。
- 自动化覆盖功能、控制台异常、焦点、触控尺寸与区域重叠；`402×874`（iPhone 18 Pro 基准）、`440×956`（Pro Max）、`414×966`（Android 21:9）、`440×706`（Pura X 16:10 阔折叠）、`688×874`（iPhone Duo 折叠展开态）、深浅色、中英文与长内容是基础矩阵，模拟器与真机结果分别报告。
