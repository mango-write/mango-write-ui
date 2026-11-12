# MangoWrite UI

跨框架共享设计系统与组件库平级 Monorepo，以「纸与霜（Paper & Frost）」材质语义为 Vue 3、React 18/19 及移动/微信小程序提供一致的设计 Token、静态样式与无障碍交互组件。支持浅色与深色模式，适用于内容工具、数据工作台、管理后台与产品网站。

## 包架构

| 包名 | 目录 | 定位 |
|---|---|---|
| `@mango-write/ui-core` | `packages/core` | 零框架依赖核心：设计 Token（`var.css` / `mobile-tokens.css`）、静态基础层 `base.css`、桌面组件静态样式 `components.css`、无头状态机 `headless/*`、公共契约 `defs/*` 与国际化词典 `locale` |
| `@mango-write/ui-vue` | `packages/vue` | Vue 3 桌面工作台组件库与领域套件（`admin/*`、`site/*`），基于 Reka UI、`@tanstack/vue-table` 与 `lucide-vue-next` |
| `@mango-write/ui-react` | `packages/react` | React 18/19 桌面工作台组件库与领域套件，与 `@mango-write/ui-vue` 100% 桌面组件与子路径对等，基于 Radix UI、`@tanstack/react-table` 与 `lucide-react` |
| `@mango-write/ui-mp` | `packages/mp` | 移动 H5 与微信小程序（`uni-app` Vue 3）组件库及 WXSS Token 编译管线 |

## 功能

- **主题与样式**：轻量静态 CSS、语义颜色、排版、单尺寸轴控件几何、霜面材质与动效 Token。
- **表单与选择**：FormField、InputText、InputNumber、Textarea、Select、MultiSelect、SearchableSelect、SearchableMultiSelect、AsyncSearchSelect、DatePicker、Calendar、ColorPicker、FileDropZone。
- **数据与导航**：受控 DataTable + Column + Paginator、Tabs、Accordion、Menu、ActionMenu、Popover。
- **内容与反馈**：AsyncSlot 四态、ConfirmProvider / ConfirmHost、NotifyProvider / ToastHost、Tooltip、HoverCard 与带焦点管理的 ImageLightbox。
- **领域套件**：通用用户组件（UserChip、UserCard、UserSelect）、管理后台页面壳（`admin/*`：AdminListPage、AdminConfigPage、AdminDetailPage、AdminBoardPage、StatBar、StatCard）与站点组件（`site/*`：SiteHeader、SiteFooter、PageHeader、NotFoundPage、AppLogo）。

## 安装

使用 Node.js 24+ 和 pnpm 10.20.0。Git 依赖使用完整 commit SHA 固定源码，安装时通过 `prepare` 自动生成 ESM、`.d.ts` 类型声明和静态 CSS。

### Vue 3 应用

```bash
pnpm add "@mango-write/ui-core@git+https://github.com/mango-write/mango-write-ui.git#<commit-sha>&path:packages/core"
pnpm add "@mango-write/ui-vue@git+https://github.com/mango-write/mango-write-ui.git#<commit-sha>&path:packages/vue"
pnpm add vue vue-i18n lucide-vue-next
```

### React 应用

```bash
pnpm add "@mango-write/ui-core@git+https://github.com/mango-write/mango-write-ui.git#<commit-sha>&path:packages/core"
pnpm add "@mango-write/ui-react@git+https://github.com/mango-write/mango-write-ui.git#<commit-sha>&path:packages/react"
pnpm add react react-dom lucide-react
```

详细用法见各子包文档：[`packages/vue/README.md`](packages/vue/README.md)、[`packages/react/README.md`](packages/react/README.md)、[`packages/mp/README.md`](packages/mp/README.md)。

## 快速上手

### 在 Vue 3 中使用

在全局样式中引入：

```css
@import "@mango-write/ui-vue/tokens.css";
@import "@mango-write/ui-vue/base.css";
@import "@mango-write/ui-vue/components.css";
```

在 `src/main.ts` 初始化主题、国际化与指令：

```ts
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { initTheme, mergeUiMessages, vTooltip } from "@mango-write/ui-vue";
import App from "./App.vue";
import "./style.css";

const i18n = createI18n({ legacy: false, locale: "zh-CN", messages: {} });
mergeUiMessages(i18n);
initTheme();

createApp(App).use(i18n).directive("tooltip", vTooltip).mount("#app");
```

### 在 React 中使用

在入口引入静态样式并挂载全局 Provider 与宿主：

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  ConfirmHost,
  ConfirmProvider,
  NotifyProvider,
  ToastHost,
  UiLocaleProvider,
  initTheme,
} from "@mango-write/ui-react";
import "@mango-write/ui-react/tokens.css";
import "@mango-write/ui-react/base.css";
import "@mango-write/ui-react/components.css";
import { App } from "./App";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UiLocaleProvider locale="zh-CN">
      <ConfirmProvider>
        <NotifyProvider>
          <App />
          <ConfirmHost />
          <ToastHost />
        </NotifyProvider>
      </ConfirmProvider>
    </UiLocaleProvider>
  </StrictMode>,
);
```

## 样式入口与子路径导出

组件深浅色由 `<html data-theme>` 驱动（见 `initTheme` 与 `useThemePreference`）。`@mango-write/ui-vue` 与 `@mango-write/ui-react` 提供完全对称的样式入口与按需子路径（`preserveModules` 构建，源码 `mango-source` 与 `dist` 均严格 Tree-shaking 隔离）：

| 样式入口（`<pkg>` 为 `ui-vue` 或 `ui-react`） | 用途 |
|---|---|
| `@mango-write/<pkg>/tokens.css`（或 `@mango-write/ui-core/tokens.css`） | 纯设计 Token（`var.css`，亮/暗语义变量与材质、动效、圆角变量） |
| `@mango-write/<pkg>/base.css`（或 `@mango-write/ui-core/base.css`） | Mango 静态基础层（包含 `tokens.css`、`.mw-frost*`、`.mw-toolbar*`、`.mw-group-card`、`.mw-scroll*`） |
| `@mango-write/<pkg>/components.css` | Mango 静态组件层（`.mw-control` 公共控件状态 + 全量桌面组件样式） |
| `@mango-write/<pkg>/theme.css` | 聚合入口（= `base.css` + `components.css`，一行引全） |

- **组件子路径**：`@mango-write/<pkg>/components/<ComponentName>`、`@mango-write/<pkg>/components/admin/<AdminComponent>`、`@mango-write/<pkg>/components/site/<SiteComponent>` 及配套类型子路径（如 `@mango-write/<pkg>/components/dialog`）
- **工具子路径**：`@mango-write/<pkg>/lib/theme`、`lib/confirm`、`lib/notify`、`lib/tooltip`、`lib/scroll-fade`、`lib/hover-card`、`lib/useComboPanel`、`lib/area-transition`（React 另提供 `lib/overlay-layer`、`lib/text-fit`）
- **国际化子路径**：`@mango-write/<pkg>/locale`（或 `@mango-write/ui-core/locale`）

## 开发与验证

```bash
git clone https://github.com/mango-write/mango-write-ui.git
cd mango-write-ui
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm build:playground
pnpm typecheck
pnpm test
```

`pnpm dev` 启动独立展示站（支持桌面组件 `Vue` / `React` 切换预览与移动端 `/mp.html` 预览）。`pnpm build:playground` 将展示站构建为静态站点（`dist-playground/`），与各子包 `dist/` 发布产物物理隔离。参与开发请阅读[贡献指南](CONTRIBUTING.md)。

## 许可

[Apache-2.0](LICENSE) · [来源声明](NOTICE)
