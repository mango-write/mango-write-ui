# Mango 移动端与微信小程序设计规范 ·「纸与霜 · 掌上版」

> 适用于 `@mango-write/ui-mp`、`apps/write-mp` 与移动 H5。跨端核心哲学与色彩语义归 [`DESIGN.md`](DESIGN.md)，移动端几何与触控数值唯一真源是 [`packages/core/src/mobile-tokens.css`](packages/core/src/mobile-tokens.css)。

## 1. 核心准则：守住「纸与霜」，重塑掌上空间

移动端是研究信息流伴侣（快速记录、可靠查阅、带当前空间上下文提问），不是桌面工作台的缩小版，也不照搬传统贴边切割式移动端模板。

1. **单一材质语义（不另立玻璃层）**：跨端严守**「内容是纸，浮层是霜，橙色只给动作」**。阅读与列表内容落在不透明暖纸/画布（`--bg-canvas` / `--bg-surface` / `--bg-raised`）上；脱离内容流的悬浮控制与模态抽屉统一使用 `.mw-frost` / `.mw-frost--thick`，不引入第二套玻璃材质概念。
2. **全幅纸面通铺，控制层悬浮退后**：正文与列表滚动区全幅通铺直达视口顶底，禁止用贴边实心横条或贯通分割线把屏幕切成三段；导航与输入化作脱离屏幕四边的悬浮霜胶囊，内容从胶囊下方自然滑过。
3. **霜内「着色不铺色」**：凡可进入霜面胶囊或厚霜抽屉的移动端控件（`MpInput`、`MpSearchBar`、`MpTextarea`、`MpFilterChip`、`MpButton(outlined)`），静息态统一使用半透明墨色叠层（`--fill-subtle` / `--control-bg`），聚焦态升为 `--control-bg-hover` + `--accent-border` + `--focus-shadow`，**严禁出现 `--bg-sunken` / `--bg-surface` 等不透明实心块打穿霜面**（由 `check-tokens.mjs` 的 `FLOATING` 门禁强制）。
4. **同屏霜层预算**：同一时刻视口内可见霜层严格 **≤ 2**；遮罩（`--scrim`）只压暗、不模糊。

## 2. 顶部排布法则：唯一原生导航 + 左上悬浮返回圆钮

1. **禁止自绘顶部导航栏**：微信小程序自带原生导航栏与右上角系统胶囊，组件库**不提供自定义顶栏组件**，避免出现双导航冲突或「真胶囊底下垫假横条」。
2. **常规页走宿主原生导航**：一级页面默认启用微信原生导航栏（`navigationStyle: "default"`，深浅色切换时同步原生栏配色）；页面标题、空间上下文入口与描述统一归入内容流首屏的 **`MpPageHeader`**（通过 `#eyebrow` / `#trailing` 插槽承载空间切换胶囊等轻量上下文）。
3. **沉浸式二级页至多一颗左上返回圆钮**：使用 `navigationStyle: "custom"` 的二级页或全屏详情页，顶部**最多只在左上角悬浮一颗 `44×44px` 圆形霜材质返回按钮（`MpBackButton`）**，与右上角微信原生胶囊同轴呼应；内容流通过 `MpPageHeader.capsuleSafe` 自动预留安全区顶距。

## 3. 底部单轨悬浮法则（严禁双层底栏叠罗汉）

所有常驻导航、主动作与提问输入共享**唯一一条距屏幕边缘与底部安全区悬浮内缩（`--mp-float-inset: 12px`）的水平底轨**。外层轨道容器 `pointer-events: none`，间隙透出底层纸面内容且不阻断滑动：

1. **纯导航态（如文库页）**：底部居中悬浮单一 `.mw-frost` 全胶囊 `MpTabBar`（外高 `56px`，内嵌 `48px` 同心选中胶囊，无顶部分割线）。
2. **导航 + 主动作同轨分体态（如日志页）**：左侧悬浮 `.mw-frost` 胶囊 `MpTabBar`，右侧同一水平基线并排一颗独立的实心品牌橙主动作圆钮/短胶囊（`MpTabBar` 的 `#action` 插槽，间距 `--mp-rail-gap: 10px`），纵向只占单轨高度。
3. **同轨折叠输入态（如 AI 助手页）**：进入提问输入上下文时，`MpTabBar` 启用 `collapsed` 折叠态——左侧收敛为一颗 `56×56px` 圆形 `.mw-frost` 导航展开钮，右侧整条同轨让位给悬浮 `.mw-frost` 胶囊输入舱 `MpComposer`（内含无框透明输入区 + 右侧圆形品牌橙发送钮）；点击左侧展开圆钮即可在同轨切回完整导航胶囊。
4. **二级页独立动作态（如日志编辑页）**：无一级导航时，`MpBottomActionBar` 或独立 `MpComposer` 作为纯透明悬浮底轨承载胶囊主按钮或提问舱，键盘弹起时随 `--mw-mp-keyboard-offset` 上移。

## 4. 同心曲率阶梯与四周内缩厚霜浮层

遵循「内圆角 = 外圆角 − 内边距」同心几何法则，贴合现代手机屏幕大 R 角与拇指触面：

| 层级 | 圆角与内缩 | 适用组件与形态规则 |
|---|---|---|
| **独立交互与悬浮胶囊层** | `--radius-full`（外边距 `--mp-float-inset: 12px`） | `MpTabBar`、`MpBackButton`、`MpComposer`、`MpButton`、`MpSearchBar`、`MpFilterChip`、`MpTag`、`MpToast` |
| **内容分组纸卡与多行输入** | `--mp-card-radius: 20px` | `MpCellGroup`（默认圆角纸卡，`overflow: hidden` 同心裁切行按压态；霜面抽屉内传 `flush` 退为 `12px` 半透明叠层行）、`MpTextarea`、`MpNotice`、用户消息气泡 |
| **内缩厚霜模态浮层** | `--mp-sheet-radius: 28px`（四周内缩 `--mp-sheet-inset: 12px`） | `MpSheet`、`MpSelectSheet`、`MpActionSheet`、`MpConfirmHost`（统一挂 `.mw-frost--thick`） |

- **`MpSheet` / `MpSelectSheet`**：四周微内缩 `12px` 悬浮厚霜卡（四角同心 `28px` 圆角），最大高度 `88%`（短阔屏 `78%`）；顶部居中抓手条 + 右上角圆形半透明关闭钮（`--fill-default`），底部操作区直接排列胶囊按钮，不画贯通硬分割线。
- **`MpActionSheet`**：废除旧式贴边直角列表与 `8px` 灰槽，统一为四周内缩 `12px`、四角 `28px` 圆角的 `.mw-frost--thick` 悬浮命令卡，底部内嵌半透明胶囊取消按钮。
- **`MpConfirmHost`**：废除旧式 T 字分割线网格按钮，统一为 `28px` 圆角 `.mw-frost--thick` 居中面板 + 内嵌并排双胶囊按钮（默认聚焦左侧半透明取消胶囊，右侧为实心品牌橙或危险红确认胶囊）。
- **`MpToastHost`**：单条最新 `.mw-frost` 悬浮胶囊（`--shadow-floating`），自动避让底部单轨高度，普通消息 `polite`、错误消息 `assertive` 播报，支持手动关闭。

## 5. 排版、触控与状态

| 语义 | 大小 / 行高 | 用途 |
|---|---|---|
| micro | 11 / 16px | 底部导航标签、通知徽标 |
| caption | 12 / 18px | 时间、计数与辅助元信息 |
| subhead | 13 / 20px | 摘要、作者、筛选胶囊、设置说明 |
| body | 15 / 22px | 控件、列表标题、问答正文 |
| reading | 16 / 26px | 日志正文与重点阅读内容 |
| title-sm | 16 / 22px | 弹窗标题与紧凑小标题 |
| title | 18 / 24px | Sheet 与详情标题 |
| title-lg | 22 / 28px | 一级任务大标题（`MpPageHeader`） |

- **尺寸轴与触控目标**：交互按钮提供 `sm=36px`（行内紧凑辅助）、`md=44px`（默认标准）、`lg=48px`（底轨与主操作）三档，静态标签 `xs=28px`；筛选胶囊视觉高 `32px` 并经伪元素扩展至 `44px` 触控区；左上悬浮返回圆钮 `44×44px`，悬浮底轨净高 `56px`。
- **图标与按压反馈**：统一使用 `MpIcon` 线性矢量图标（18/20/22/24px 角色尺寸），图标按钮必须声明可访问名称；按压立即触发轻微弹性缩放（`--mp-press-scale: 0.97`）与叠层加深，不依赖 `:hover`，`prefers-reduced-motion` 与 `prefers-reduced-transparency` 均有降级。
- **双翼语义一致**：动作与状态命名严格对齐桌面端 `@mango-write/ui-vue`——按钮统一采用 `variant="filled | tinted | outlined | text"`（默认 `filled`，支持 `outlined` / `text` 布尔简写）、`severity="primary | secondary | danger | contrast | info | success | warn"`（`filled + secondary` 为纸面有界次按钮，反色深底使用 `contrast`，状态色自动退为 `tinted`）与 `fluid` 撑满宽度；`MpTag` 与 `MpNotice` 统一采用 `severity`。纸面控件专用的 `--control-inset` 严禁叠在实心有色或反色胶囊上。
- **语义边界**：`MpTag` 仅作静态展示，选择走 `MpFilterChip` / `MpFilterBar`，布尔开关走 `MpSwitch`（`role="switch"`）；`MpActionSheet` 只发一次性命令，单选值归 `MpSelectSheet`；`MpEmpty` 与 `MpLoading` 分离。

## 6. 掌上动效编排（对齐 Core M1–M5）

遵循 [`DESIGN.md`](DESIGN.md) §10.3 五级触发矩阵，H5 与微信小程序双端同源 CSS 驱动（不依赖 Web 专属 API）：

1. **M1 拇指触觉反馈**：按钮、可点列表行、筛选芯片与悬浮圆钮按压即触发 `--duration-fast`（`110ms`）弹性微缩（`--mp-press-scale: 0.97` / `0.985`）与叠层加深，不依赖 `:hover`。
2. **M2 轨内归属滑移**：`MpTabBar` 内置常驻同心选中胶囊指示器（`.mw-mp-tabbar__indicator`），切换一级页签时按 `290ms` + `--ease-emphasized` 平滑滑移；`MpSwitch` 滑块同步平移归位。
3. **M3 底部单轨连续形变（严禁 `v-if` 硬切闪跳）**：`MpTabBar` 切换 `collapsed` 时，左侧霜面导航舱与右侧动作/输入槽常驻同轨（隐藏侧自动挂 `aria-hidden="true"`、`tabindex="-1"` 与 `pointer-events: none`），两侧仅由单一 `flex-grow` 按 `290ms` + `--ease-emphasized`（`0.236, 0.618, 0.382, 1`，避免 `x2=0` 长平缓尾在整数像素布局上产生阶梯顿挫）做守恒推拉，展开图标固定锚在左侧 `56×56px` 圆区，内部标签与图标按 `110ms` 先隐 → `180ms` 错峰浮现；`backdrop-filter` 保持恒定不进动画。
4. **M4 浮层有进必有出**：`MpSheet` / `MpActionSheet` 按 `290ms` + `--ease-apple-sheet` 上浮入场、关闭时按 `180ms` + `--ease-exit` 下滑淡出后再卸载 DOM；`MpConfirmHost` 与 `MpToastHost` 按 `180ms` 入场、`110ms` 微缩/微沉淡出；离场期间统一挂 `pointer-events: none`，绝不阻断底层触控。
5. **M5 页面转场与无障碍降级**：页面栈进出交由微信宿主原生导航动画；`prefers-reduced-motion: reduce` 下所有形变、滑移与进出场位移全部归零。

## 7. 设备视口基准与验收边界

| 预设档位 | 逻辑视口（CSS px） | 比例 / 物理分辨率 / DPR | 屏幕形态与适配策略 |
|---|---|---|---|
| **iPhone 18 Pro（默认开发基准）** | **402 × 874** | `19.5:9` · `1206 × 2622` · `@3x` | 6.3" 灵动岛 + Home Bar；移动端组件与页面的 1:1 标准开发视口（`compact`） |
| **iPhone 18 Pro Max** | **440 × 956** | `19.5:9` · `1320 × 2868` · `@3x` | 6.9" iOS 大屏；检验宽幅单栏排版与大屏纵向留白（`compact`） |
| **Android 主流新机（21:9 修长屏）** | **414 × 966** | `21:9` · `1242 × 2898` · `@3x` | 6.7" 居中挖孔 + 手势条；检验主流 414px 宽、21:9 修长信息流与悬浮底轨（`compact`） |
| **HUAWEI Pura X（16:10 阔折叠）** | **440 × 706** | `16:10` · `1320 × 2120` · `@3x` | 6.3" 阔折叠内屏；触发 `.mw-mp-root--wide-short`，收敛 Sheet 最大高度（`78%`）、紧凑动作项高度（`44px`）与空态上下间距 |
| **iPhone Duo（折叠展开态）** | **688 × 874** | `4:5` · `2064 × 2622` · `@3x` | 7.8" 书本式折叠内屏；触发 `.mw-mp-root--expanded`，`MpSheet` / `MpActionSheet` / `MpToast` 居中限宽（`480px`），底轨 `MpTabBar` / `MpBottomActionBar` / `MpComposer` 居中限宽（`520px`），`.mw-mp-split` 与 `.mw-mp-grid-adaptive` 自动升维为双栏布局 |

- 状态统一使用语义类名，WXSS 不依赖属性选择器；主题与视口形态由 `MpThemeProvider` 统一挂载，预览容器通过 `contained` 在真实手机视口内定位，不使用桌面 `100vh` 冒充手机高度。
- 同一份 Vue 源码同时构建 H5 与 `mp-weixin`；H5 预览不替代微信模拟器与真机验收。
