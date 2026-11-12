# @mango-write/ui-vue

MangoWrite UI 的 Vue 3 桌面工作台组件库与领域套件，以「纸与霜（Paper & Frost）」材质语义提供一致的设计 Token、纯静态 CSS 与无障碍交互组件。支持浅色与深色模式，适用于内容工具、数据工作台、管理后台与产品网站。

## 功能

- **主题与样式**：纯静态 CSS（零 Tailwind / PrimeVue 运行时依赖）、语义颜色、排版、单尺寸轴控件几何、霜面材质（`.mw-frost*`）与动效 Token。
- **表单交互**：FormField、InputText、InputNumber、Textarea、Select、MultiSelect、SearchableSelect、SearchableMultiSelect、AsyncSearchSelect、DatePicker、Calendar、ColorPicker、FileDropZone 与组合面板。
- **数据与导航**：受控 DataTable + Column + Paginator、Tabs、Accordion、Menu、ActionMenu、Popover。
- **内容与反馈**：AsyncSlot 四态、ConfirmProvider / ConfirmHost、NotifyProvider / ToastHost、HoverCard、vTooltip 与带焦点管理的 ImageLightbox。
- **领域套件**：通用用户组件（UserChip、UserCard、UserSelect）、管理后台页面壳（`admin/*`：AdminListPage、AdminConfigPage、AdminDetailPage、AdminBoardPage、StatBar、StatCard）与网站组件（`site/*`：PageHeader、SiteHeader、SiteFooter、NotFoundPage、AppLogo）。

## 安装

使用 Node.js 24+ 和 pnpm 10.20.0：

```bash
pnpm add "@mango-write/ui-core@git+https://github.com/mango-write/mango-write-ui.git#v0.2.0&path:packages/core"
pnpm add "@mango-write/ui-vue@git+https://github.com/mango-write/mango-write-ui.git#v0.2.0&path:packages/vue"
pnpm add vue vue-i18n lucide-vue-next
```

安装时会通过 `prepare` 自动生成 ESM、`.d.ts` 类型声明和静态 CSS 文件。

## 在 Vue 3 应用中使用

在 `src/style.css` 中引入静态样式（或直接使用 `@import "@mango-write/ui-vue/theme.css";` 一行引全）：

```css
@import "@mango-write/ui-vue/tokens.css";
@import "@mango-write/ui-vue/base.css";
@import "@mango-write/ui-vue/components.css";
```

在 `src/main.ts` 中配置主题、国际化词典和指令：

```ts
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { initTheme, mergeUiMessages, vTooltip } from "@mango-write/ui-vue";
import App from "./App.vue";
import "./style.css";

const i18n = createI18n({ legacy: false, locale: "zh-CN", messages: {} });
mergeUiMessages(i18n);
initTheme();

createApp(App)
  .use(i18n)
  .directive("tooltip", vTooltip)
  .mount("#app");
```

随后即可在组件中使用：

```vue
<script setup lang="ts">
import { ref } from "vue";
import { FormField, SearchableSelect } from "@mango-write/ui-vue";

const selected = ref<string | null>(null);
const options = [
  { label: "生物学", value: "biology" },
  { label: "社会学", value: "sociology" },
];
</script>

<template>
  <FormField
    input-id="research-field"
    label="研究领域"
    hint="选择最接近当前论文的方向"
    required
    v-slot="{ inputId, describedBy, invalid, required }"
  >
    <SearchableSelect
      :input-id="inputId"
      v-model="selected"
      :options="options"
      option-label="label"
      option-value="value"
      :aria-describedby="describedBy"
      :invalid="invalid"
      :required="required"
      placeholder="选择研究领域"
    />
  </FormField>
</template>
```

`FormField` 的 `error` 会同时生成关联错误和 `invalid` 状态；不要用 placeholder 代替标签。
`AsyncSlot` 统一 `loading / empty / error / ready`，`#loading` 可替换为与真实内容同形的骨架，`#empty-action` 提供下一步，`@retry` 处理重试。

## 样式入口与子路径导出

组件主题随静态 CSS 入口携带（深浅色由 `<html data-theme>` 驱动，见 `initTheme` 与 `useThemePreference`）。

| 样式入口 | 用途 |
|---|---|
| `@mango-write/ui-vue/tokens.css`（或 `@mango-write/ui-core/tokens.css`） | 纯设计 Token（`var.css`，亮/暗语义变量与材质、动效、圆角变量） |
| `@mango-write/ui-vue/base.css`（或 `@mango-write/ui-core/base.css`） | Mango 静态基础层（包含 `tokens.css`、`.mw-frost*`、`.mw-toolbar*`、`.mw-group-card`、`.mw-scroll*`） |
| `@mango-write/ui-vue/components.css` | Mango 静态组件层（`.mw-control` 公共控件状态 + 全部组件样式，源码与 `dist` 双模式可用） |
| `@mango-write/ui-vue/theme.css` | 聚合入口（= `base.css` + `components.css`，一行引全） |

### 子路径按需导出

除根入口 `@mango-write/ui-vue` 外，支持按模块子路径独立引用（源码 `mango-source` 与构建产物 `dist` 均严格 Tree-shaking 隔离，不连带无关组件）：

- **组件子路径**：`@mango-write/ui-vue/components/<ComponentName>`（如 `@mango-write/ui-vue/components/FormField`、`@mango-write/ui-vue/components/admin/AdminListPage`、`@mango-write/ui-vue/components/site/SiteHeader`）及配套类型子路径（如 `@mango-write/ui-vue/components/action-menu`）
- **工具子路径**：`@mango-write/ui-vue/lib/theme`、`@mango-write/ui-vue/lib/confirm`、`@mango-write/ui-vue/lib/notify`、`@mango-write/ui-vue/lib/tooltip`、`@mango-write/ui-vue/lib/scroll-fade`、`@mango-write/ui-vue/lib/hover-card`、`@mango-write/ui-vue/lib/useComboPanel`、`@mango-write/ui-vue/lib/area-transition`
- **国际化子路径**：`@mango-write/ui-vue/locale`（或 `@mango-write/ui-core/locale`）

## 许可

[Apache-2.0](LICENSE) · [来源声明](NOTICE)
