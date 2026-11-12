# Mango 设计语言 ·「纸与霜」

> 本文是 `@mango-write/ui` 设计体系的**一核双翼（Core + Desktop + Mobile）**核心总纲与规范正文：原则、结构、规则与理由。
> - **Core 核心令牌**：[`packages/core/src/var.css`](packages/core/src/var.css)（数值唯一真相源，展示站 Foundations 直接读取这里）
> - **Desktop 桌面端设计规范**：[`DESIGN-DESKTOP.md`](DESIGN-DESKTOP.md)（Web / Electron 工作台 / Admin 后台）
> - **Mobile 移动端与小程序设计规范**：[`DESIGN-MOBILE.md`](DESIGN-MOBILE.md)（[`packages/core/src/mobile-tokens.css`](packages/core/src/mobile-tokens.css)，微信小程序 / 移动端 H5 / 原生移动伴侣）
> - 可视化活规格与双端对照见展示站文档页（`pnpm dev`）。文中出现的 token 名就是代码里的变量名。

## 1. 一句话与一核双翼架构

**内容是纸，浮层是霜，橙色只给动作。** 研究者长时间面对的是文字与资料，界面要安静、可预测、层次一眼可辨；品牌存在于少数关键时刻（主操作、选中、焦点），不铺满画面。

由于**键鼠桌面工作台**与**拇指手持伴侣（小程序/移动端）**在视距、输入精度、屏幕画幅与使用心流上存在物理代差，设计体系采用 **「一核双翼」** 协同架构：

| 层级 | 定位 | 权威规范与 Token 源 | 消费包 |
|---|---|---|---|
| **Core 核心设计语言** | 跨端不变量：色彩哲学、纸与霜材质、半透明叠层、黄金分割动效、4px 网格、字重阶梯与状态语义 | 本文（`DESIGN.md`）+ [`packages/core/src/var.css`](packages/core/src/var.css) | `@mango-write/ui-core` |
| **Desktop 桌面设计语言** | 精细工作台：`24/28/32/40px` 指针尺寸轴、`13px` 紧凑排版、描边控件、Hover/Focus Ring、画布多浮岛、锚定弹出层与后台四壳模板 | [`DESIGN-DESKTOP.md`](DESIGN-DESKTOP.md) + `var.css` 默认几何 | `@mango-write/ui-vue` / `@mango-write/ui-react` |
| **Mobile 移动设计语言** | 内容优先的掌上信息流：`36/44/48px` 胶囊交互尺寸、`15px/16px` 正文、全幅纸面通铺、单轨悬浮霜胶囊、左上返回圆钮与四周内缩厚霜抽屉 | [`DESIGN-MOBILE.md`](DESIGN-MOBILE.md) + [`packages/core/src/mobile-tokens.css`](packages/core/src/mobile-tokens.css) | `@mango-write/ui-mp` |

## 2. 六条原则（冲突时按序取舍）

1. **纸先于一切（Paper first）**：正文落在不透明、偏暖的纸面上。界面框架（壳、工具条、侧栏、导航栏）退后，不与内容抢亮度。
2. **浮起来的才是霜（Frost for floating）**：只有「浮在内容之上、底下会有东西滑过」的层用霜材质；同一时刻屏上的霜层 ≤ 2。
3. **着色不铺色（Tint, don't paint）**：组件内部的填充一律是墨色或强调色的**半透明叠层**（`--fill-*`、`--*-subtle`），
   因此同一个组件放在纸面、画布、霜面上都成立，霜面不会被内部的实色块打断。
4. **橙色只给动作（Ember for action）**：`--accent` 只用于主操作、选中态、焦点与关键数据强调。一个区块至多一个实心主按钮。
5. **一根尺寸轴（One size axis）**：控件的高度、字号、图标、内距、间隙、圆角由同一档位（`xs / sm / md / lg`）派生，不单独挑数。密度由容器和平台上下文决定，不由组件各自决定。
6. **安静的动（Quiet motion）**：动效解释因果（从哪来、到哪去），不表演。只动 transform / opacity / 颜色。

## 3. Token 结构

```
① Palette  原料色板（--palette-*）            只给 ③ 用；组件禁止引用
② Scale    尺寸 / 间距 / 字号 / 圆角 / 动效 / 布局 / 层级   与主题无关（Desktop 默认 + Mobile 作用域覆写）
③ Semantic 语义色（--bg-* / --text-* / --accent / --danger …）浅色基值 + 深色覆盖
④ Derived  派生（--fill-* / --border-* / --*-subtle / --focus-*）每个主题作用域重新求值
⑤ Domain   业务域（批注 / 划线 / 代码 / 灯箱 / 营销舞台）
⑥ Legacy   旧名映射，只给存量 app；packages/ui 内禁止引用，清空后删除
```

- 组件只读 ②③④⑤ 与自己的 `--mw-<组件>-*` 局部变量；`--mw-*` 带回落值即为组件对外的定制钩子。
- 主题作用域 `[data-theme="light|dark"]`（以及小程序类名 `.mw-theme-light|dark`）可以挂在任意元素上：深浅色可以在同一页面并排出现（展示站即如此）。
- 平台尺寸作用域隔离：`:root` 恒定提供 Desktop Scale；仅在 `page` 或 `.mw-mp-root`（`MpThemeProvider`）作用域内将 `--size-xs/sm/md/lg-*` 与 `--control-*` 映射至 Mobile 触控尺寸轴，绝不污染桌面端全局 `:root`。
- 新增 token 的门槛：表达稳定语义、至少两个组件消费。只服务一个组件的值写成该组件的 `--mw-*`。

## 4. 颜色

### 4.1 面（从低到高）

| token | 角色 | Desktop 用法 | Mobile 用法 |
|---|---|---|---|
| `--bg-canvas` | 桌面 / 壳底：明显低于纸面 | 工作台浮岛之间露出的那层 | **页面默认底壳**：衬托内缩分组纸卡 |
| `--bg-surface` | **纸面**：内容与阅读面 | 页面与工作区的默认底 | 全宽内容页、底部抽屉或沉浸阅读底 |
| `--bg-raised` | 抬起的内容面 | 卡片、分组卡、表格 | **Inset Grouped 内缩分组纸卡** |
| `--bg-sunken` | 凹陷面 | 代码块、只读井、侧栏分组底 | 代码块或凹陷只读区 |
| `--bg-inverse` | 反色 | tooltip 之外极少数的强对比块 | 胶囊轻提示或反色强调块 |

深色下层级靠亮度递增表达（canvas 最暗 → raised 最亮），阴影只负责分离。

### 4.2 文字

`--text-primary`（正文、标题）· `--text-secondary`（说明、次要标签）· `--text-tertiary`（元信息、占位符）·
`--text-disabled`（禁用，豁免对比度）· `--text-accent`（品牌色文字、链接）· `--text-on-accent` / `--text-on-danger`（实心面上的前景）。
primary / secondary / tertiary / accent 在纸面上均 ≥ 4.5:1，由 `var-css-dark-parity.test.ts` 锁死。

### 4.3 填充与边框（全部半透明）

- `--fill-subtle`（静息底）→ `--fill-default`（hover）→ `--fill-strong`（按下）；`--fill-selected(-hover)` 选中。
- `--border-subtle`（分隔线、卡片边）→ `--border-default`（控件边）→ `--border-strong`（hover / 强调边）。
- 状态四色各有 `--x`（实色，仅图标 / 圆点 / 实心按钮）、`--x-subtle`（底）、`--x-border`（边）、`--x-text`（文字）。

### 4.4 强调与状态的用法

- 实心按钮只有三种：`primary`（橙）、`danger`（红）、`contrast`（反色）。success / info / warning 不承担动作，作为按钮时自动退为 tinted。
- 状态色永远配图标或文字，不单靠颜色表达。

## 5. 文字排版

- 系统字体栈（macOS / iOS → 苹方 + SF，Windows → 微软雅黑 + Segoe，Android → HarmonyOS Sans / Roboto），不自托管，不基于某一款字体做字距决策。
- 字号与行高成对出现（`--type-<step>-size` / `--type-<step>-line`），行高落 4px 网格：

  `micro` · `caption` · `body-sm`（**Desktop 界面默认**：控件、菜单、表格）· `body`（对话框正文、说明段落）· `body-lg`（长文阅读）·
  `title-sm` · `title` · `title-lg`（页面标题）· `headline` · `display` · `display-lg`（仅营销站）。
  （Mobile 掌上阶梯 `--mp-type-*` 详见 [`DESIGN-MOBILE.md`](DESIGN-MOBILE.md)：控件与正文默认 `16px`，重点阅读用 `17px`。）
- 字重只用四档：`--weight-regular`（正文）、`--weight-medium`（控件、字段名）、`--weight-semibold`（标题）、`--weight-bold`（营销展示）。
- 层级靠字重与颜色，不靠堆字号；数据密集界面不出现 `headline` 以上。
- 数字列加 `.mw-tabular`（等宽数字）；长正文行宽不超过 `--container-prose`。

## 6. 尺寸、间距与密度

### 6.1 尺寸轴

四档 `xs / sm / md / lg`，每档一次定义 `-h`（高）、`-font`、`-icon`、`-px`（横向内距）、`-gap`、`-radius`。

- **md 是默认档**（表单、对话框、页头）；sm 给工具条之外的紧凑行（表格行内、标签栏）；xs 只给嵌入式微控件；lg 给营销与空态主 CTA。
- 图标约为控件高度的一半；icon-only 控件恒为正方形。
- 桌面端在触屏（`pointer: coarse`）下控件视觉不变，命中区由伪元素扩到 `--hit-min`。**不靠缩小控件换密度。**
- 双端物理数值对照：

| 档位 | Desktop 桌面端（键鼠指针 · 1px 精度） | Mobile 掌上端（拇指触控 · `.mw-mp-root` 作用域） |
|---|---|---|
| `xs` | 高 `24px` · 字 `12px` · 圆角 `6px`（行内微控件） | 高 `28px` · 字 `12px` · 圆角 `9999px`（静态标签，不承担独立动作） |
| `sm` | 高 `28px` · 字 `12px` · 圆角 `6px`（紧凑行、表格行内） | 高 `36px` · 字 `13px` · 圆角 `9999px`（行内次级与紧凑胶囊按钮） |
| `md`（**默认**） | 高 `32px` · 字 `13px` · 圆角 `8px`（表单、对话框、页头） | 高 `44px` · 字 `15px` · 圆角 `9999px`（默认胶囊按钮与单行输入） |
| `lg` | 高 `40px` · 字 `14px` · 圆角 `10px`（营销与空态主 CTA） | 高 `48px` · 字 `16px` · 圆角 `9999px`（底部主动作胶囊） |

### 6.2 密度上下文

组件读继承的 `--control-h / -font / -icon / -px / -gap / -radius`。

- 组件传 `size` = 该组件定档（内部挂 `.mw-size-*`）。
- 容器挂 `.mw-size-*` = 容器内所有未定档的控件跟随——这是改密度的唯一方式。
- `.mw-toolbar` 是一种**角色**：控件去底、只留发丝边、生效态挂 `.is-active` 着色。

### 6.3 间距

4px 网格（`--space-1` = 4px）。组件内部用 1 / 1.5 / 2 / 3；组件之间用 2 / 3 / 4；区块之间用 6 / 8；页面级用 12 / 16。
页面左右留白 `--page-gutter` 随视口三档变化。

## 7. 圆角

刻度 `--radius-2xs … --radius-2xl / --radius-full`，加语义名：`--radius-item`（菜单项、列表行）、`--radius-card`、
`--radius-float`（菜单、弹出层、Toast）、`--radius-dialog`、`--radius-sheet`（工作台浮岛）。

**同心规则**：容器套容器时，内圆角 = 外圆角 − 内边距（`--radius-float` − `--float-padding` = `--radius-item`）。
控件圆角随尺寸档走（`--control-radius`），不单独指定。

## 8. 层级与阴影

| 层 | 用途 | 面 | 阴影 |
|---|---|---|---|
| 0 平面 | 纸面、页面 | `--bg-surface` | 无 |
| 1 抬起 | 卡片、分组卡、浮岛 | `--bg-raised` + `--border-subtle` | `--shadow-raised` / `--shadow-sheet` |
| 2 浮动 | 菜单、下拉、Popover、Toast、Tooltip | 霜 | `--shadow-floating` |
| 3 覆盖 | Dialog、确认框、Bottom Sheet | 厚霜 + `--scrim` 遮罩 | `--shadow-overlay` |

写「第几层」，不写「要多重的阴影」。z 轴秩序只用 `--z-*`：sticky < dropdown < overlay < toast < tooltip。

## 9. 霜（Frost）与工作台光影

霜是浮层材质：高不透明度的半透明底色配合背景模糊、斜向微光（`--frost-specular`）与顶缘内高光（`--frost-highlight`），不做夸张折射或彩色炫光。

- 配方唯一：`.mw-frost`（浮动层）与 `.mw-frost--thick`（覆盖层）。组件加类，不抄配方。
- **可读性优先**：霜底色不透明度高（浅色 ≥ 0.8、深色 ≥ 0.78），模糊只负责暗示「底下有内容」。
  `.mw-frost` 自带 `color: var(--text-primary)`——霜面文字永远不继承底层内容的颜色。
  霜面上：正文用 primary / secondary；tertiary 只给 ≥ 12px 的元信息与快捷键提示；不在霜面上放大段 disabled 级文字。
- **整体性**：霜面内部禁止不透明底色（`--bg-surface / raised / sunken / canvas`），只用 `--fill-*`、`--*-subtle`、`--control-bg`
  这类半透明叠层；分隔线用 `--border-subtle`。由门禁 `opaque-in-frost` 检查浮层组件。
- 遮罩（`--scrim`）只压暗，不模糊——模糊遮罩会让面板底下变成一片灰，霜就失去了意义。
- 降级：不支持 backdrop-filter、`prefers-reduced-transparency`、`html.mw-lowfx` 时退为不透明 `--frost-fallback` 并移除微光渐变，读感不变。
- 工作台浮岛（Sheet）：以 `--bg-surface` 纸面为基底，叠加环境柔光渐变（`--gradient-surface`）、镜片边缘内高光（`--effect-lens-edge`）与浮岛阴影（`--shadow-sheet`），浮在带极淡暖芒的画布（`--bg-canvas` + `--gradient-canvas`）之上。

## 10. 动效

动效体系建立在**黄金分割律**（$\varphi \approx 0.618$，$1 - \varphi \approx 0.382$，$\varphi^3 \approx 0.236$，$\varphi^4 \approx 0.146$）之上：时长阶梯按 $\times 1.618$ 等比演进并收敛为**快、中、慢三档语义速度**，贝塞尔曲线控制点严格取黄金分割谐波坐标。

### 10.1 快 · 中 · 慢三档速度与黄金时长阶梯（$\times 1.618$）

全阶按黄金比 $\Phi \approx 1.618$ 等比递进（`70ms → 110ms → 180ms → 290ms → 470ms → 760ms`）：

| 速度档位 | 语义 token | 底层时长 token | 数值 | 用途 |
|---|---|---|---|---|
| —（瞬态） | — | `--duration-instant` | `70ms` | 浮层快速退出、tooltip 收起 |
| —（微交互） | — | `--duration-fast` | `110ms` | hover / 按下 / 颜色切换 |
| **快（Fast）** | `--speed-fast` | `--duration-base` | `180ms` | 浮层进入、展开收起、区域过渡（与 `area-transition.ts` 同源） |
| **中（Medium）** | `--speed-medium` | `--duration-slow` | `290ms` | 对话框进入、日月图标旋转变形 |
| —（空间） | — | `--duration-slower` | `470ms` | 页面级空间转场、降级色彩过渡 |
| **慢（Slow）** | `--speed-slow` | — | `760ms` | 全屏主题径向揭幕、仪式级大型过渡 |

### 10.2 黄金分割与 Apple `cubic-bezier` 曲线族

在 `[0, 1] × [0, 1]` 归一化时空中，提供**黄金分割谐波曲线族**（`0.146` / `0.236` / `0.382` / `0.618` / `0.764`）与 **Apple 经典物理阻尼曲线族**：

| 曲线 token | 坐标 | 节奏结构与用途 |
|---|---|---|
| `--ease-standard` | `cubic-bezier(0.382, 0, 0.236, 1)` | **38.2% 蓄力 + 61.8% 缓冲**：日常状态切换、色彩与边框过渡 |
| `--ease-enter` | `cubic-bezier(0.146, 0.618, 0.382, 1)` | **快响应 + 黄金减速着陆**：下拉、Popover 等浮层进入（离场时长约为进入的 $0.618 \approx 60\%$） |
| `--ease-exit` | `cubic-bezier(0.382, 0, 0.764, 0.236)` | **黄金蓄力加速离场**：浮层关闭、元素退场（与 `--ease-enter` 镜像对称） |
| `--ease-emphasized` | `cubic-bezier(0.236, 0.618, 0.382, 1)` | **饱满中段 + 长尾减速**：对话框、抽屉与中大尺度空间位移 |
| `--ease-golden` | `cubic-bezier(0.382, 0, 0.618, 1)` | **对称黄金 S 曲线（38.2% : 61.8%）**：全屏深浅色径向揭幕、跨视口仪式级过渡 |
| `--ease-apple-default` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | **Apple Core Animation 默认**：温和起势、长尾收束，适合细腻色彩与透明度过渡 |
| `--ease-apple-sheet` | `cubic-bezier(0.32, 0.72, 0, 1)` | **iOS Sheet / Modal 气垫阻尼**：前 1/3 快速到位，后 2/3 极长阻尼贴合，适合抽屉与浮岛聚合 |
| `--ease-apple-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | **Apple Keynote 丝滑揭幕**：零迟滞启动、绵长舒展落位，适合大画幅展开与营销舞台 |
| `--ease-spring-snap / -pop` | `linear(...)` | 只给小物体归位（位移 < 24px 或缩放），时长 ≤ `--speed-medium` |

- 浮层进入：透明度 + 自锚点方向位移 `--motion-enter-offset` + 缩放 `--motion-enter-scale`；退出只淡出，时长约为进入的 $1/\Phi \approx 61.8\%$（`290ms` 进入 → `180ms` / `110ms` 退出）。
- 主题切换：基于 View Transitions API，以触发点为圆心，按 `--speed-slow`（`760ms`）+ `--ease-apple-out`（`cubic-bezier(0.16, 1, 0.3, 1)`）向外径向揭幕。
- `filter` / `backdrop-filter` 永不进 transition 与 keyframes。
- `prefers-reduced-motion` 下只保留透明度变化。

### 10.3 动效触发与编排矩阵（M1–M5 · When & How）

动效只解释空间因果（从哪来、到哪去、谁把空间让给了谁），绝不表演。所有交互状态变化统一按物理尺度归入 M1–M5 五级判据：

| 等级 | 触发时机（何时必须上动画） | 时长 × 曲线配方 | 允许动的属性与编排铁律 | 双端典型落点（Desktop ↔ Mobile） |
|---|---|---|---|---|
| **M1 · 触觉微反馈** | 手指按压/抬起、指针悬停、输入框获焦 | `--duration-fast` (`110ms`) × `--ease-standard` | 桌面端只动色彩/边框/阴影；移动端触控物叠加 `scale(0.97 / 0.985)` 按压缩放 | `Button` / `MpButton`、`MpCell`、`MpFilterChip`、`MpBackButton` |
| **M2 · 轨内归属游走** | 同一轨道内激活胶囊或滑块从 A 移向 B | `--speed-fast / medium` (`180–290ms`) × `--ease-emphasized` 或 `--ease-spring-snap` | **指示物常驻 DOM**，只动 `transform: translateX(...)`；严禁旧项淡出、新项淡入的闪烁切法 | `ToggleSwitch` / `MpSwitch`、`SelectButton`、`MpTabBar` 选中胶囊滑移 |
| **M3 · 同轨容器形变** | 同一常驻栏内两个控件互换空间主导权（收折 ↔ 展开） | 外壳几何 `--speed-medium` (`290ms`) × `--ease-emphasized`；内部内容 `110ms` 先隐 → `180ms` 错峰后显 | **严禁 `v-if` 拆建外骨骼与双约束互搏**：双端舱体常驻同轨由单一 `flex-grow` 驱动守恒交接（禁用 `x2=0` 的 `--ease-apple-sheet` 跑布局宽度，防尾段 1px 阶梯卡顿），内部子层固定锚点并保持合成层；`backdrop-filter` 恒定不进动画 | `MpTabBar` 同轨折叠/展开（左导航舱 + 右动作圆钮 ↔ 左展开圆钮 + 右 `MpComposer`） |
| **M4 · 浮层进出场** | 模态抽屉、对话框、菜单、确认框、Toast 唤起与关闭 | **入场** `180–290ms` × `--ease-apple-sheet` / `--ease-enter`；**离场** $\approx 0.618$ 倍（`110–180ms`）× `--ease-exit` | **有进必有出**：关闭时先播收拢/下滑淡出动画并挂 `pointer-events: none`，播完再卸载 DOM，严禁 `v-if` 秒切；遮罩只动 `opacity` | `Popover` / `Dialog` / `MpSheet` / `MpActionSheet` / `MpConfirmHost` / `MpToastHost` |
| **M5 · 区域与视口换装** | 页签内容切换、异步四态切换、跨页转场、全屏主题切换 | 区域交叉淡入 `--speed-fast` (`180ms`) × `--ease-standard`；主题径向揭幕 `--speed-slow` (`760ms`) × `--ease-apple-out` | 区域切换走交叉淡入（禁用 `out-in` 防连点空白）；小程序一级页走宿主原生导航栈 | `AsyncSlot`、`Tabs`、主题切换 |

**三条「禁止加动画」的红线**：
1. 高频实时输入（打字回显、检索词过滤列表）不加逐项位移动画，保证零输入粘滞；
2. 跨尺度异构元素（如 `60px` 列表行 ↔ 全屏详情页）不做共享元素拉伸变形；
3. `prefers-reduced-motion: reduce` 下所有位移、缩放与容器形变时长归零，仅保留透明度切换或直达终态。

## 11. 图标

- 桌面端统一使用 `lucide-vue-next` 线性图标（24 栅格，描边 `--icon-stroke`），跟随 `currentColor`；小程序端通过 `MpIcon` 消费同源 Lucide SVG mask 数据 URI；同一区块不混填充与描边，不再使用 `pi pi-*` 类名图标。
- 尺寸只取 `--icon-xs … --icon-2xl` 或控件上下文 `--control-icon`，**不跟随字号**。
- 桌面端组件的 `icon` 参数只接受 Vue `Component`（Lucide 图标组件），尺寸由组件上下文 token 决定。
- 装饰性图标用 `--text-tertiary`；可点击的 icon-only 控件必须有可访问名称。

## 12. 布局与滚动边界

- 断点：`640 / 768 / 1024 / 1280 / 1536`（CSS 变量不能用于媒体查询，这里是唯一约定）。
- 容器：`--container-prose`（长文）、`--container-content`（内容页）、`--container-page`（整页上限）。
- 工作台壳：`--shell-topbar-h`、`--shell-sidebar-w`、`--shell-rail-w`、`--shell-aside-w`、浮岛间距 `--shell-gutter`、浮岛圆角 `--radius-sheet`。
- 1280 宽不出现横向滚动；390 宽主链路可达。

### 滚动边缘渐隐（Scroll Edge Fade）

凡滚动溢出容器窗口的内容，在**内容出口方向**（有内容滚出或待滚入的一侧）必须呈现渐变的淡入淡出效果；已滚到尽头（贴边无溢出）的一侧立即撤去遮罩、恢复清晰边界，向用户明确传达「这一侧还有内容」与「这一侧已到头」。

- **两档过渡带尺度**：
  - `--scroll-fade-size`（`24px`，默认档）：页面主滚动区、工作台岛内列表、对话框主体（`Dialog`）、数据表格（`DataTable`）。
  - `--scroll-fade-size-sm`（`12px`，紧凑档）：下拉选择面板（`Select` / `MultiSelect` / `SearchableSelect` / `SearchableMultiSelect` / `AsyncSearchSelect`）、列表框（`Listbox`）、横向标签栏（`TabList`）及小尺寸横向胶囊条。
- **材质正交（只用 `mask-image`，不用背景色伪元素遮罩）**：通过 `mask-image: linear-gradient(...)` 直接裁切滚动视口边缘的 alpha 通道（横纵双向同时溢出时经 `mask-composite: intersect` 合成），因此同一套渐隐在纸面（`--bg-surface`）、抬起卡（`--bg-raised`）、凹陷井（`--bg-sunken`）、半透明霜面（`.mw-frost`）与深浅色下均自然成立，绝不出现实色雾条穿帮或遮挡鼠标热区。
- **动态感知与吸顶让位**：由 `v-scroll-fade`（紧凑档 `v-scroll-fade.sm`）或 `attachScrollFade` 监听滚动位置、容器尺寸与子节点变化，动态维护 `data-scroll-fade-y="top|bottom|both"` 与 `data-scroll-fade-x="left|right|both"`；含吸顶表头（如 `DataTable` 的 `.mw-datatable__thead`）时自动将顶部渐隐起点下移 `--mw-scroll-fade-top-offset`，吸顶层保持完整清晰，仅表体行在滑入表头下方时柔和消融。

## 13. 状态

每个交互组件都必须定义并在展示站展示：**默认 / hover / 按下 / 焦点 / 选中 / 禁用 / 只读 / 错误 / 加载 / 空**（不适用的写明不适用）。

- 焦点有两种配方：**环**（按钮、勾选、标签页等可点击物：`outline` `--focus-width` + `--focus-offset`）与**晕**（可输入面：边框转 `--focus-color` + `--focus-shadow`）。
- 禁用 = `--opacity-disabled` 或 `--text-disabled`，并保留原因提示；**只读 ≠ 禁用**：只读是完整可读的内容，底色 `--control-bg-readonly`，文字不降级。
- 错误：边框 `--danger` + 晕 `--focus-shadow-danger` + 字段下方 `--danger-text` 说明。

## 14. 组件契约

- 几何全部来自 `--control-*` 与 ② 层 token；颜色全部来自 ③④；不写裸 px（1px 发丝线除外）、裸色值、裸时长、裸字重。
- 跨框架通用组件样式沉淀在 `@mango-write/ui-core` 的 `styles/components/*.css`（其中 `control.css` 作为 `.mw-control` 公共底座排在各组件特化规则之前），Vue 交互组件专属样式放在组件自己的 `<style>`。
- 浮层组件根节点挂 `.mw-frost` 或 `.mw-frost--thick`，自身不再声明背景色。
- 每个组件在展示站有一页：用途 / 何时不用 · 档位 · 变体 · 状态矩阵 · 纸面 / 画布 / 霜面三种底 × 深浅两色。

## 15. 后台页面规章与四壳模板（Admin Console Shells）

管理后台是高频运营工具，核心目标是**高密度、强主次、跨页操作位置恒定**。所有后台业务视图必须且只能装入以下 4 套页面外壳（配合通用 `Tabs` 的 `hideWhenSingle` / `badge` 与通用 `Dialog` 的四档尺寸及同窗下钻能力），禁止页面自起标题或自造布局骨架。

### 15.1 四壳模板与统一页头契约

1. **统一页头契约（`#admin-header-lead` / `#admin-header-actions`）**
   - 页头由外层宿主统一提供，左侧默认显示当前菜单项标题，右侧为 `#admin-header-actions` 操作槽；页面内部**不再写 `<h1>`/`<h2>` 页面标题、副标题或面包屑**。
   - 多子视图页面使用 `Tabs`（`TabList` 开启 `hide-when-single`，`Tab` 可配 `badge` 计数）紧贴页头下方；当按权限或服务可用性过滤后**仅剩 1 个可见页签时自动隐藏页签栏**。
2. **四种标准页面外壳**
   - **列表检索页（`AdminListPage`）**：主操作上呈页头右侧（`#actions`）→ 可选列表顶部汇总条（`#summary`）→ 单行筛选条（`#filters`，左搜索回车即查、右下拉/日期变更即查，不放「搜索/重置」按钮）→ `DataTable` 占满余高（表头实底吸顶、仅表体数据行内滚，行内操作固定最右列）→ 底栏 `Paginator`（`#pagination`）。
   - **配置表单页（`AdminConfigPage` + `ConfigSection` + `ConfigRow`）**：「N 项未保存」与唯一「保存」按钮上呈页头右侧（无改动禁用；动钱/动密钥/动权限/批量影响用户的改动传入 `confirmMessage` 触发一句后果确认）→ 可选固定工具条（`#toolbar`）→ 下方 `.admin-config-page__body` 独立滚动，每段一张 `ConfigSection` 分组卡（顶部短词标题 + 行间内缩分隔线）→ `ConfigRow` 三列栅格（`168px` 单行标签配技术键名 Tooltip / `280px` 定宽控件 / 余宽填满一句后果说明，窄容器自动折行）。
   - **对象详情页（`AdminDetailPage` + `StatCard`）**：通过 `ADMIN_HEADER_LEAD_TAKEN` 将返回按钮与对象名/状态标签送入页头左侧（不另起独立返回行）；页头右侧放 1–2 个高频主操作，低频与危险操作收进 `ActionMenu`（`⋯`）→ 顶部 `StatCard` 状态摘要卡网格（`#cards`，常驻固定，数值等宽 + 右上角 1 个行内编辑弹窗入口）→ 页内子标签导航栏（`#tabs` 或 `<Tabs>` 的 `TabList`，常驻固定）→ 下方 `.admin-detail-page__body`（或当前 `TabPanel`）作为唯一滚动数据区。
   - **数据看板页（`AdminBoardPage` + `StatBar` + `AdminBoardSection`）**：全局时间窗/产品/端筛选上呈页头右侧（`#actions`，配合可选固定 `#toolbar` 常驻顶部）→ 下方 `.admin-board-page__body` 作为滚动数据区，承载顶部 `StatBar` 核心指标摘要行（`#stats`，等宽数字）与 `AdminBoardSection` 趋势与监控分段卡（右上角 `#drill` 明细下钻入口）一同流式滚动。

### 15.2 页面要素 vs 数据层：垂直三层滚动规范（Page Chrome vs. Data Plane Scrolling）

后台页面与复杂弹窗必须严格区分**「页面要素（Page Chrome，固定常驻）」**与**「数据部分（Data Plane，唯一可滚动内容）」**，严禁把导航/控制要素和业务数据混在同一个滚动容器里，也严禁出现双滚动条套娃或多表格高度塌陷：

1. **垂直三层解剖模型**
   - **L1 全局导航与页头层（Shell Chrome · 绝对固定）**：侧栏、页头标题 / 返回按钮+对象身份（`#lead`）、页头主操作 / 未保存计数+保存按钮 / 全局时间窗（`#actions`）、模块级路由页签（`TabList`）。全部 `flex-shrink: 0`；即使在 `:teleport="false"` 独立渲染模式下，页头 `.mw-admin-shell-header` 也位于滚动容器之外，永不随内容滚走。
   - **L2 局部控制与上下文锚点层（Context & Controls · 固定常驻）**：按页面类型承载筛选搜索栏、对象状态卡、页内视图切换栏、表格列头与底部分页器，恒为 `flex-shrink: 0` 或 `sticky`。
   - **L3 数据载荷层（Data Plane · 唯一滚动区）**：全视图唯一允许出现纵向滚动条的区域（`flex: 1; min-height: 0; overflow-y: auto`），挂载 `v-scroll-fade` 边缘渐隐并预留 `var(--space-1)` 焦点环安全槽。

2. **四壳与弹窗的「固定要素 vs 滚动数据」边界表**

| 容器组件 | 固定常驻的页面要素（`flex-shrink: 0` / `sticky`，不滚） | 可滚动的数据部分（唯一滚动区） |
|---|---|---|
| `AdminListPage` | 页头（标题 + `#actions`）、`#summary` 顶部汇总、`#filters` 筛选条、`DataTable` 实心表头 `thead th`（`sticky`）、`#pagination` 底部分页栏 | 仅 `.mw-datatable__table-container`（`tbody` 数据行）独立内滚 |
| `AdminConfigPage` | 页头（标题 + `#actions` + `N 项未保存` + `保存` 按钮）、`#toolbar` 顶部固定工具栏 | 仅 `.admin-config-page__body` 内的 `ConfigSection` 配置分组流滚动 |
| `AdminDetailPage` | 页头（返回按钮 + `#title` 对象身份 + `#actions` 操作）、`#cards` 状态摘要卡网格、`#tabs` 页内 Tab 切换栏（或默认槽直传 `<Tabs>` 的 `.mw-tab-list`） | 仅 `.admin-detail-page__body`（或当前激活的 `.mw-tab-panels` 明细内容区）滚动；内嵌表格 `thead th` 实底吸顶 |
| `AdminBoardPage` | 页头（标题 + `#actions` 全局时间窗/维度筛选器）、`#toolbar` 二级固定工具条 | `.admin-board-page__body` 内的 `#stats`（`StatBar` 大盘指标条）与 `AdminBoardSection` 图表/排行区块流一同滚动 |
| `Dialog` | 弹窗 Header（返回 + 标题 + `#header-extra` + 关闭）、`#scope` 上下文范围条、`#toolbar`（子表单 `.mw-dialog-subform` / 弹窗筛选条 / 汇总 Tag）、Footer（`#footer-left` + `#footer`） | `sm`/`md` 滚 `.mw-dialog__body` 表单字段流；`lg`/`xl` 表类弹窗锁死外层（`:body-scroll="false"`），仅表体 `tbody` 或 `.mw-dialog-scroll` 滚动、表头实底吸顶 |

3. **内嵌表格防塌陷守则**
   - 在 `.admin-panel--scrollable` 流式数据区内，直接子块默认 `flex-shrink: 0`，内嵌 `DataTable`（未声明 `.mw-datatable--flex-scrollable`）自动退回 `flex: none; height: auto` 按实际行数撑开，表头 `thead th` 保持 `position: sticky; top: 0; z-index: 2; background: var(--mw-datatable-head-bg, var(--bg-raised))`。

### 15.3 复杂弹窗规范（Complex Dialogs · `Dialog` 四档尺寸）

后台严禁手写 `.admin-modal*` 遮罩或散装弹窗样式，复杂表单、主从表维护与多维下钻统一使用通用 `Dialog` 的四档标准宽度（`size="sm | md | lg | xl"`）与内部滚动纪律：

| 档位 (`size`) | 宽度上限 | 适用场景 | 布局与滚动纪律 |
|---|---|---|---|
| `sm` | `440px` (`27.5rem`) | 单一动作窄表单（新建角色、绑定通道、修改授权到期日、发放兑换码） | Header + `#scope` + Footer 固定；单列 `FormField` 栈在 `.mw-dialog__body` 内流式滚动 |
| `md` | `640px` (`40rem`) | 多分段双栏配置窗（模型编辑 + 计费单价、套餐参数编辑） | 使用 `.mw-dialog-grid` 双列栅格、`.mw-dialog-span` 跨列项、`.mw-dialog-divider` 分割线与 `.mw-dialog-section-title` 分节小标题；底栏支持 `#footer-left` 与 `#footer` 左右分栏 |
| `lg` | `860px` (`53.75rem`) | 主从表 / 批量勾选 / 表+内嵌子表单弹窗（角色权限勾选矩阵、角色成员表 + 添加授权栏、模型模板批量导入） | 传入 `:body-scroll="false"` 锁定弹窗主体高度；子表单或筛选器放入固定 `#toolbar` 插槽（`.mw-dialog-subform`），仅 `.mw-dialog-scroll` 或 `DataTable` 表体独立内滚、表头吸顶 |
| `xl` | `min(1100px, 94vw)` (`68.75rem`) | 数据看板多维下钻分析窗、卡密批次明细窗（用量分群下钻、营收对账明细、AI 遥测下钻、队列健康度下钻） | 顶栏下方通过 `scopeText`/`#scope` 常驻展示当前查询范围条，通过 `#toolbar` 常驻展示筛选条与统计标签；正文数据表表头吸顶、表体内滚 |

### 15.4 下钻与上下文保持规范（Drill-Down & Context Continuity）

后台从「全局概览 → 分群/趋势切片 → 单日/单格成员名单 → 实体档案详情」遵循四条可逆下钻契约：

1. **同窗多级下钻，严禁弹窗叠弹窗（Single-Dialog In-Place Drill-Down）**
   - **模式一：顶栏返回栈（Header Back Stack）**：在 `Dialog` 内从汇总表或日趋势点击进入下一层明细时，在**同一个 `Dialog`** 内切换视图并开启 `:can-back="true"`（标题前自动出现返回箭头按钮并触发 `@back`），严禁在 `Dialog` 之上再叠开第二个 `Dialog`。唯一允许叠在 `Dialog` 之上的浮层是 `useConfirm()` 的单句高危确认框。
   - **模式二：矩阵-名单同窗联动（Matrix-to-Members Inline Focus）**：在 `xl` 下钻弹窗中点击上部二维矩阵单元格或趋势柱时，高亮该单元格并在**同一弹窗下半区**就地展开或过滤关联用户名单表，同时在 `#scope` 范围条右侧渲染当前聚焦条件胶囊与清除按钮（返回全量视图）。
2. **URL 查询参数单一真相源（URL Query Continuity）**
   - 看板与列表的筛选及下钻状态（`from`、`to`、`product`、`client`、`environment`、`detail`、`detailDay`）同步写入路由 `query`；刷新页面、复制链接分享给协作者或点击浏览器后退，均可精确还原当前打开的下钻弹窗与时间切片。
3. **跨页实体下钻与返回闭环（Cross-Page Entity Drill-Down）**
   - 点击表格整行或用户标识胶囊（`UserChip`）跳转至 `AdminDetailPage` 时，路由携带来源上下文 `query`；`AdminDetailPage` 经 `ADMIN_HEADER_LEAD_TAKEN` 将返回按钮注入宿主顶栏左侧，点击返回即原路恢复原列表或看板上下文。
4. **分段卡与状态卡右上角轻入口（Section Header Drill Trigger）**
   - 看板区块的下钻入口统一放在 `AdminBoardSection` 右上角 `#drill` 插槽，详情状态卡的单项维护入口统一放在 `StatCard` 右上角 `actionLabel`；图表区与卡片正文中不重复堆砌主数字或散落多处下钻按钮。

## 16. 门禁

`scripts/check-tokens.mjs` 對 `packages/core`、`packages/vue` 与 `packages/mp` 统一强制：

| 规则 | 含义 |
|---|---|
| `undefined-token` | 引用了未定义的变量（静默失效的头号来源） |
| `mobile-token-in-desktop` | 桌面端样式或组件引用了 `--mp-*` / `--mw-mp-*` 移动端变量 |
| `mobile-scope-leak` | 移动端样式出现裸 `:root` 或未限定在 `page / .mw-mp-root / .mw-mp-*` 作用域内的选择器 |
| `legacy-token` | 引用了 ⑥ 旧名 |
| `palette-in-component` | 组件直接读色板 |
| `local-token-prefix` | 组件局部变量不以 `--mw-` 开头 |
| `raw-length` / `raw-duration` / `raw-font-weight` / `raw-z-index` / `color-literal` | 裸值 |
| `opaque-in-frost` | 浮层组件使用不透明面（确有必要时同行注释 `opaque-ok` 并说明） |
| `no-pi-icon` | 禁止使用 `pi pi-*` 图标类名或 `primeicons` |
