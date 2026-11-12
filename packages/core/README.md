# @mango-write/ui-core

MangoWrite UI 的零框架依赖核心包，为 `@mango-write/ui-vue`、`@mango-write/ui-react` 与 `@mango-write/ui-mp` 提供统一的设计 Token、静态 CSS、无头交互状态机、公共类型契约与双语国际化词典。

## 职责

- **设计 Token（`tokens.css` / `var.css`、`mobile-tokens.css`）**：桌面与移动端亮/暗语义颜色、排版、间距、单尺寸轴控件几何、霜面材质（`.mw-frost*`）与动效曲线。
- **静态样式层（`base.css`、`components.css`、`theme.css`）**：无框架耦合的静态基础样式与桌面组件 BEM 类名（`.mw-*`），由 Vue 与 React 适配层直接消费。
- **无头状态机（`headless/*`）**：
  - `theme-core`：深浅色与跟随系统主题偏好同步（`<html data-theme>` + `localStorage` + `matchMedia`）
  - `confirm-core` / `notify-core`：命令式确认框队列与 Toast 通知状态机
  - `calendar-grid`：月份日历网格与日期范围计算
  - `option-accessor`：选择器选项值提取、过滤与去重
  - `overlay-slot` / `hover-card` / `scroll-fade-core`：浮层层级栈、悬停延迟状态机与滚动边缘渐隐计算
- **公共契约与国际化（`defs`、`locale`）**：跨框架共享的组件类型定义与 `zh-CN` / `en-US` 组件内置词典。

## 安装

使用 Node.js 24+ 和 pnpm 10.20.0：

```bash
pnpm add "@mango-write/ui-core@git+https://github.com/mango-write/mango-write-ui.git#v0.2.0&path:packages/core"
```

## 导出入口

| 子路径 | 说明 |
|---|---|
| `@mango-write/ui-core` | 核心工具、无头状态机、公共类型契约与国际化词典汇总导出 |
| `@mango-write/ui-core/tokens.css`（或 `/var.css`） | 桌面端设计 Token 变量表 |
| `@mango-write/ui-core/mobile-tokens.css` | 移动端与小程序设计 Token 变量表 |
| `@mango-write/ui-core/base.css` | 静态基础层（含 `tokens.css`、`.mw-frost*`、`.mw-toolbar*`、`.mw-group-card`、`.mw-scroll*`） |
| `@mango-write/ui-core/components.css` | 全量桌面组件静态样式表 |
| `@mango-write/ui-core/theme.css` | 聚合样式入口（= `base.css` + `components.css`） |
| `@mango-write/ui-core/locale` | `uiMessages`（`zh-CN` / `en-US`）词典与格式化工具 |
| `@mango-write/ui-core/defs` | 跨框架共享组件 Props / DTO 类型契约 |
| `@mango-write/ui-core/headless/<name>` | 独立无头状态机（`calendar-grid`、`confirm-core`、`hover-card`、`notify-core`、`option-accessor`、`overlay-slot`、`scroll-fade-core`、`theme-core`） |

## 许可

[Apache-2.0](LICENSE) · [来源声明](NOTICE)
