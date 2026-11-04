# Mango 设计语言 ·「纸与霜」

> 本文是 `@mango-write/ui` 的设计规范正文：原则、结构、规则与理由。
> **数值只在 [`src/var.css`](src/var.css)**，可视化的活规格在展示站 `/dev/ui`（`pnpm dev`，端口 5176）。
> 文中出现的 token 名就是代码里的变量名。

## 1. 一句话

**内容是纸，浮层是霜，橙色只给动作。** 研究者长时间面对的是文字与资料，界面要安静、可预测、层次一眼可辨；
品牌存在于少数关键时刻（主操作、选中、焦点），不铺满画面。

## 2. 六条原则（冲突时按序取舍）

1. **纸先于一切（Paper first）**：正文落在不透明、偏暖的纸面上。界面框架（壳、工具条、侧栏）退后，不与内容抢亮度。
2. **浮起来的才是霜（Frost for floating）**：只有「浮在内容之上、底下会有东西滑过」的层用霜材质；同一时刻屏上的霜层 ≤ 2。
3. **着色不铺色（Tint, don't paint）**：组件内部的填充一律是墨色或强调色的**半透明叠层**（`--fill-*`、`--*-subtle`），
   因此同一个组件放在纸面、画布、霜面上都成立，霜面不会被内部的实色块打断。
4. **橙色只给动作（Ember for action）**：`--accent` 只用于主操作、选中态、焦点与关键数据强调。一个区块至多一个实心主按钮。
5. **一根尺寸轴（One size axis）**：控件的高度、字号、图标、内距、间隙、圆角由同一档位派生，不单独挑数。密度由容器决定，不由组件各自决定。
6. **安静的动（Quiet motion）**：动效解释因果（从哪来、到哪去），不表演。只动 transform / opacity / 颜色。

## 3. Token 结构

```
① Palette  原料色板（--palette-*）            只给 ③ 用；组件禁止引用
② Scale    尺寸 / 间距 / 字号 / 圆角 / 动效 / 布局 / 层级   与主题无关
③ Semantic 语义色（--bg-* / --text-* / --accent / --danger …）浅色基值 + 深色覆盖
④ Derived  派生（--fill-* / --border-* / --*-subtle / --focus-*）每个主题作用域重新求值
⑤ Domain   业务域（批注 / 划线 / 代码 / 灯箱 / 营销舞台）
⑥ Legacy   旧名映射，只给存量 app；packages/ui 内禁止引用，清空后删除
```

- 组件只读 ②③④⑤ 与自己的 `--mw-<组件>-*` 局部变量；`--mw-*` 带回落值即为组件对外的定制钩子。
- 主题作用域 `[data-theme="light|dark"]` 可以挂在任意元素上：深浅色可以在同一页面并排出现（展示站即如此）。
- 新增 token 的门槛：表达稳定语义、至少两个组件消费。只服务一个组件的值写成该组件的 `--mw-*`。

## 4. 颜色

### 4.1 面（从低到高）

| token | 角色 |
|---|---|
| `--bg-canvas` | 桌面 / 壳底：浮岛之间露出的那层，明显低于纸面 |
| `--bg-surface` | **纸面**：页面与工作区的默认底 |
| `--bg-raised` | 抬起的内容面：卡片、分组卡、表格 |
| `--bg-sunken` | 凹陷面：代码块、只读井、侧栏分组底 |
| `--bg-inverse` | 反色：tooltip 之外极少数的强对比块 |

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

- 系统字体栈（macOS → 苹方 + SF，Windows → 微软雅黑 + Segoe），不自托管，不基于某一款字体做字距决策。
- 字号与行高成对出现（`--type-<step>-size` / `--type-<step>-line`），行高落 4px 网格：

  `micro` · `caption` · `body-sm`（**界面默认**：控件、菜单、表格）· `body`（对话框正文、说明段落）· `body-lg`（长文阅读）·
  `title-sm` · `title` · `title-lg`（页面标题）· `headline` · `display` · `display-lg`（仅营销站）。
- 字重只用四档：`--weight-regular`（正文）、`--weight-medium`（控件、字段名）、`--weight-semibold`（标题）、`--weight-bold`（营销展示）。
- 层级靠字重与颜色，不靠堆字号；数据密集界面不出现 `headline` 以上。
- 数字列加 `.mw-tabular`（等宽数字）；长正文行宽不超过 `--container-prose`。

## 6. 尺寸、间距与密度

### 6.1 尺寸轴

四档 `xs / sm / md / lg`，每档一次定义 `-h`（高）、`-font`、`-icon`、`-px`（横向内距）、`-gap`、`-radius`。

- **md 是默认档**（表单、对话框、页头）；sm 给工具条之外的紧凑行（表格行内、标签栏）；xs 只给嵌入式微控件；lg 给营销与空态主 CTA。
- 图标约为控件高度的一半；icon-only 控件恒为正方形。
- 触屏（`pointer: coarse`）下控件视觉不变，命中区由伪元素扩到 `--hit-min`。**不靠缩小控件换密度。**

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
| 1 抬起 | 卡片、分组卡、浮岛 | `--bg-raised` + `--border-subtle` | `--shadow-raised` |
| 2 浮动 | 菜单、下拉、Popover、Toast、Tooltip | 霜 | `--shadow-floating` |
| 3 覆盖 | Dialog、确认框 | 厚霜 + `--scrim` 遮罩 | `--shadow-overlay` |

写「第几层」，不写「要多重的阴影」。z 轴秩序只用 `--z-*`：sticky < dropdown < overlay < toast < tooltip。

## 9. 霜（Frost）

**我们不做「液态 / 折射玻璃」**：没有镜面高光、没有边缘折射、没有彩色透光。霜是一块均匀的毛玻璃。

- 配方唯一：`.mw-frost`（浮动层）与 `.mw-frost--thick`（覆盖层）。组件加类，不抄配方。
- **可读性优先**：霜底色不透明度高（浅色 ≥ 0.8、深色 ≥ 0.78），模糊只负责暗示「底下有内容」。
  `.mw-frost` 自带 `color: var(--text-primary)`——霜面文字永远不继承底层内容的颜色。
  霜面上：正文用 primary / secondary；tertiary 只给 ≥ 12px 的元信息与快捷键提示；不在霜面上放大段 disabled 级文字。
- **整体性**：霜面内部禁止不透明底色（`--bg-surface / raised / sunken / canvas`），只用 `--fill-*`、`--*-subtle`、`--control-bg`
  这类半透明叠层；分隔线用 `--border-subtle`。由门禁 `opaque-in-frost` 检查浮层组件。
- 遮罩（`--scrim`）只压暗，不模糊——模糊遮罩会让面板底下变成一片灰，霜就失去了意义。
- 降级：不支持 backdrop-filter、`prefers-reduced-transparency`、`html.mw-lowfx` 时退为不透明 `--frost-fallback`，读感不变。
- 工作台浮岛不是霜：它们是 `--bg-surface` 纸面 + 发丝边 + `--shadow-raised`，浮在 `--bg-canvas` 上。

## 10. 动效

| 时长 | 用途 |
|---|---|
| `--duration-instant` | 浮层退出、tooltip |
| `--duration-fast` | hover / 按下 / 颜色切换 |
| `--duration-base` | 浮层进入、展开收起 |
| `--duration-slow` | 对话框进入、区域切换 |
| `--duration-slower` | 页面级空间转场 |

| 曲线 | 用途 |
|---|---|
| `--ease-standard` | 状态切换 |
| `--ease-enter` | 进入（快启动、长减速） |
| `--ease-exit` | 退出（加速离场） |
| `--ease-emphasized` | 空间位移、对话框 |
| `--ease-spring-snap / -pop` | 只给小物体归位（位移 < 24px 或缩放），时长 ≤ base |

- 浮层进入：透明度 + 自锚点方向位移 `--motion-enter-offset` + 缩放 `--motion-enter-scale`；退出只淡出，时长约为进入的 60%。
- `filter` / `backdrop-filter` 永不进 transition 与 keyframes。
- `prefers-reduced-motion` 下只保留透明度变化。

## 11. 图标

- 全仓统一使用 `lucide-vue-next` 线性图标（24 栅格，描边 `--icon-stroke`），跟随 `currentColor`；同一区块不混填充与描边，不再使用 `pi pi-*` 类名图标。
- 尺寸只取 `--icon-xs … --icon-2xl` 或控件上下文 `--control-icon`，**不跟随字号**。
- 组件的 `icon` 参数只接受 Vue `Component`（Lucide 图标组件），尺寸由组件上下文 token 决定。
- 装饰性图标用 `--text-tertiary`；可点击的 icon-only 控件必须有可访问名称。

## 12. 布局

- 断点：`640 / 768 / 1024 / 1280 / 1536`（CSS 变量不能用于媒体查询，这里是唯一约定）。
- 容器：`--container-prose`（长文）、`--container-content`（内容页）、`--container-page`（整页上限）。
- 工作台壳：`--shell-topbar-h`、`--shell-sidebar-w`、`--shell-rail-w`、`--shell-aside-w`、浮岛间距 `--shell-gutter`、浮岛圆角 `--radius-sheet`。
- 1280 宽不出现横向滚动；390 宽主链路可达。

## 13. 状态

每个交互组件都必须定义并在展示站展示：**默认 / hover / 按下 / 焦点 / 选中 / 禁用 / 只读 / 错误 / 加载 / 空**（不适用的写明不适用）。

- 焦点有两种配方：**环**（按钮、勾选、标签页等可点击物：`outline` `--focus-width` + `--focus-offset`）与**晕**（可输入面：边框转 `--focus-color` + `--focus-shadow`）。
- 禁用 = `--opacity-disabled` 或 `--text-disabled`，并保留原因提示；**只读 ≠ 禁用**：只读是完整可读的内容，底色 `--control-bg-readonly`，文字不降级。
- 错误：边框 `--danger` + 晕 `--focus-shadow-danger` + 字段下方 `--danger-text` 说明。

## 14. 组件契约

- 几何全部来自 `--control-*` 与 ② 层 token；颜色全部来自 ③④；不写裸 px（1px 发丝线除外）、裸色值、裸时长、裸字重。
- 一个组件的样式只有一个落点：组件自己的 `<style>`；`components.css` 只放跨组件共享底座（`.mw-control`）。
- 浮层组件根节点挂 `.mw-frost` 或 `.mw-frost--thick`，自身不再声明背景色。
- 每个组件在展示站有一页：用途 / 何时不用 · 档位 · 变体 · 状态矩阵 · 纸面 / 画布 / 霜面三种底 × 深浅两色。

## 15. 门禁

`scripts/check-tokens.mjs`（`pnpm test` 内的 `check-tokens.test.ts`）对 `src/components/**` 与 `components.css` 检查：

| 规则 | 含义 |
|---|---|
| `undefined-token` | 引用了未定义的变量（静默失效的头号来源） |
| `legacy-token` | 引用了 ⑥ 旧名 |
| `palette-in-component` | 组件直接读色板 |
| `local-token-prefix` | 组件局部变量不以 `--mw-` 开头 |
| `raw-length` / `raw-duration` / `raw-font-weight` / `raw-z-index` / `color-literal` | 裸值 |
| `opaque-in-frost` | 浮层组件使用不透明面（确有必要时同行注释 `opaque-ok` 并说明） |
| `no-pi-icon` | 禁止使用 `pi pi-*` 图标类名或 `primeicons` |
