# `@mango-write/ui-react`

MangoWrite 桌面工作台与产品站点的 React 组件库，基于 Radix UI、`@tanstack/react-table`、`lucide-react` 与 `@mango-write/ui-core`，与 `@mango-write/ui-vue` 保持 100% 桌面组件及子路径对等。

## 安装

使用 Node.js 24+ 和 pnpm 10.20.0。

```bash
pnpm add "@mango-write/ui-core@git+https://github.com/mango-write/mango-write-ui.git#<commit-sha>&path:packages/core"
pnpm add "@mango-write/ui-react@git+https://github.com/mango-write/mango-write-ui.git#<commit-sha>&path:packages/react"
pnpm add react react-dom lucide-react
```

安装 Git 依赖时会自动执行 `prepare` 构建，生成 ESM 产物、`.d.ts` 类型声明与静态 CSS。

## 样式引入

在应用全局样式入口按需分层引入（或直接使用 `@mango-write/ui-react/theme.css` 聚合入口）：

```css
@import "@mango-write/ui-react/tokens.css";
@import "@mango-write/ui-react/base.css";
@import "@mango-write/ui-react/components.css";
```

| 样式入口 | 用途 |
|---|---|
| `@mango-write/ui-react/tokens.css`（或 `@mango-write/ui-core/tokens.css`） | 纯设计 Token（`var.css`，亮/暗语义变量与材质、动效、圆角变量） |
| `@mango-write/ui-react/base.css`（或 `@mango-write/ui-core/base.css`） | Mango 静态基础层（包含 `tokens.css`、`.mw-frost*`、`.mw-toolbar*`、`.mw-group-card`、`.mw-scroll*`） |
| `@mango-write/ui-react/components.css` | Mango 静态组件层（`.mw-control` 公共控件状态 + 全量桌面组件样式） |
| `@mango-write/ui-react/theme.css` | 聚合入口（= `base.css` + `components.css`） |

## 初始化主题与全局宿主

在应用根节点初始化主题偏好，并挂载国际化与确认/通知宿主：

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

## 组件使用示例

表单控件通过 `FormField` 自动注入关联 `inputId`、`aria-describedby`、`invalid` 与 `required`（也可使用渲染函数显式读取）：

```tsx
import { useState } from "react";
import {
  Button,
  FormField,
  SearchableSelect,
  Tooltip,
  useConfirm,
  useNotify,
} from "@mango-write/ui-react";

const FIELD_OPTIONS = [
  { label: "生物学", value: "biology" },
  { label: "社会学", value: "sociology" },
];

export function ResearchFieldForm() {
  const [selected, setSelected] = useState<string | null>(null);
  const confirm = useConfirm();
  const notify = useNotify();

  async function handleReset() {
    const accepted = await confirm.ask({
      header: "重置研究领域",
      message: "确认清空当前已选择的研究领域吗？",
      acceptSeverity: "danger",
    });
    if (!accepted) return;
    setSelected(null);
    notify.success({ summary: "已重置" });
  }

  return (
    <div className="mw-group-card">
      <FormField
        inputId="research-field"
        label="研究领域"
        hint="选择最接近当前论文的方向"
        required
      >
        <SearchableSelect
          value={selected}
          onValueChange={setSelected}
          options={FIELD_OPTIONS}
          optionLabel="label"
          optionValue="value"
          placeholder="选择研究领域"
        />
      </FormField>

      <Tooltip content="清空当前选择">
        <Button variant="outlined" severity="secondary" onClick={handleReset}>
          重置
        </Button>
      </Tooltip>
    </div>
  );
}
```

## 子路径按需导出

除根入口 `@mango-write/ui-react` 外，全部组件、领域套件与工具均提供与 `@mango-write/ui-vue` 对称的独立子路径（`preserveModules` 构建，严格隔离无关模块）：

- **组件与领域套件**：`@mango-write/ui-react/components/<ComponentName>`、`@mango-write/ui-react/components/admin/<AdminComponent>`、`@mango-write/ui-react/components/site/<SiteComponent>` 及配套契约子路径（如 `@mango-write/ui-react/components/dialog`、`@mango-write/ui-react/components/data-table`、`@mango-write/ui-react/components/form-field-context`）
- **运行时与 Hooks**：`@mango-write/ui-react/lib/theme`、`@mango-write/ui-react/lib/confirm`、`@mango-write/ui-react/lib/notify`、`@mango-write/ui-react/lib/tooltip`、`@mango-write/ui-react/lib/scroll-fade`、`@mango-write/ui-react/lib/hover-card`、`@mango-write/ui-react/lib/overlay-layer`、`@mango-write/ui-react/lib/useComboPanel`、`@mango-write/ui-react/lib/area-transition`、`@mango-write/ui-react/lib/text-fit`
- **国际化**：`@mango-write/ui-react/locale`

## 许可

[Apache-2.0](LICENSE) · [来源声明](NOTICE)
