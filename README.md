# MangoWrite UI

为 Vue 3 应用提供一致的静态样式、设计 token 和常用交互组件。支持浅色与深色模式，适用于内容工具、数据工作台和产品网站。

## 功能

- **主题与样式**：轻量主题、语义颜色、排版、间距和动效 token。
- **表单交互**：FormField、FileDropZone、可搜索单选、多选与组合面板。
- **内容与反馈**：AsyncSlot 四态、ActionMenu、HoverCard 与带焦点管理的图片灯箱。
- **用户组件**：UserChip、UserCard 与 UserSelect，使用通用用户 DTO，不依赖宿主路由或团队契约。
- **网站组件**：PageHeader、SiteHeader、SiteFooter、导航、品牌与社交账号配置。
- **主题偏好**：浅色、深色、跟随系统，以及可配置的存储键和主题根节点。

## 安装

使用 Node.js 24+ 和 pnpm 10.20.0。

```bash
pnpm add "@mango-write/ui-core@git+https://github.com/mango-write/mango-write-ui.git#6d9ac4cbaf9621d8c8f577f974e2c8f485aa712d&path:packages/core"
pnpm add "@mango-write/ui-vue@git+https://github.com/mango-write/mango-write-ui.git#6d9ac4cbaf9621d8c8f577f974e2c8f485aa712d&path:packages/vue"
pnpm add vue vue-i18n lucide-vue-next
pnpm add -D tailwindcss @tailwindcss/vite
```

安装时会生成 JavaScript、TypeScript 声明和 CSS 文件。

## 版本与升级

Git 依赖使用完整 commit 固定源码；上面的安装示例钉选已公开的提交。升级时显式更新依赖与锁文件，不使用浮动分支。正式版本的标签、package version、发布包和校验值应一致，已发布标签与产物不覆盖。

历史 `v0.1.0` 存在同名标签指向不同提交的情况；已有安装请保留锁定的完整 SHA，新契约使用新版本承接，避免仅凭旧标签重装。当前包保持 `private: true`，可安装 Git 源码；若使用发布页预构建包，应同时核对校验文件。不能假设 npm registry 已提供此包。

## 在 Vue 应用中使用

在 Vite 配置中启用 Vue 和 Tailwind：

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [vue(), tailwindcss()] });
```

在 `src/style.css` 中引入样式：

```css
@import "tailwindcss" prefix(tw);
@import "@mango-write/ui-vue/theme.css";
@import "@mango-write/ui-vue/components.css";
@source "../node_modules/@mango-write/ui-vue/src";
```

在 `src/main.ts` 中配置主题和组件文案：

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

const selected = ref<unknown>(null);
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
`AsyncSlot` 统一 `loading / empty / error / ready`，`#loading` 可替换为与真实内容同形的骨架，
`#empty-action` 提供下一步，`@retry` 处理重试。

## 定制

组件主题随 CSS 入口携带（深浅色由 `<html data-theme>` 驱动，见 `initTheme`），不经过预设对象。

`initTheme({ storageKey, rootEl })` 配置主题偏好的存储位置和主题属性写入的元素。`useThemePreference()` 提供当前偏好、解析后的主题与 `setTheme()`。

`SiteHeader` 通过 `items`、语言切换事件及插槽配置导航。`SiteFooter` 通过 `socials` 配置社交账号，通过 `brand`、`legal` 和默认插槽配置品牌、版权与网站链接；设置 `socials=[]` 可隐藏社交账号。

| 样式入口 | 用途 |
|---|---|
| `@mango-write/ui-vue/tokens.css`（或 `@mango-write/ui-core/tokens.css`） | 纯设计 token（`var.css`，亮/暗语义变量与材质、动效、圆角变量） |
| `@mango-write/ui-vue/base.css`（或 `@mango-write/ui-core/base.css`） | Mango 静态基础层（包含 `tokens.css`、Tailwind `@theme` 映射、`.mw-glass*`、`.mw-toolbar*`、`.mw-group-card`、`.mw-scroll*` 等纯静态底座） |
| `@mango-write/ui-vue/components.css` | Mango 静态组件层（`.mw-control` 公共控件状态 + 全部组件样式，源码与 `dist` 双模式可用） |
| `@mango-write/ui-vue/theme.css` | 聚合入口（= `base.css` + `components.css`，一行引全） |

### 子路径按需导出

除根入口 `@mango-write/ui-vue` 与 `@mango-write/ui-core` 外，支持按模块子路径独立引用（源码 `mango-source` 与构建产物 `dist` 均严格 Tree-shaking 隔离，不连带无关组件）：

- **组件子路径**：`@mango-write/ui-vue/components/<ComponentName>`（如 `@mango-write/ui-vue/components/FormField`、`@mango-write/ui-vue/components/PageHeader`、`@mango-write/ui-vue/components/site/SiteHeader`）及配套类型子路径（如 `@mango-write/ui-vue/components/action-menu`）
- **工具子路径**：`@mango-write/ui-vue/lib/theme`、`@mango-write/ui-vue/lib/tooltip`、`@mango-write/ui-vue/lib/scroll-fade`、`@mango-write/ui-vue/lib/hover-card`、`@mango-write/ui-vue/lib/useComboPanel`、`@mango-write/ui-vue/lib/area-transition`
- **国际化子路径**：`@mango-write/ui-vue/locale`（或 `@mango-write/ui-core/locale`）

## 开发

```bash
git clone https://github.com/mango-write/mango-write-ui.git
cd mango-write-ui
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm typecheck
pnpm test
```

`pnpm dev` 启动独立展示应用：首页即组件库入口，图标规范位于 `/foundations/icon`。页面及其路由只归本仓维护，宿主应用不注册这些路由。

`pnpm build:playground` 把展示站构建为静态站点（`dist-playground/`），供宿主仓部署预览环境。

库构建输出位于 `dist/`，包含 ESM、类型声明和 CSS；`dev/` 与 `dist-playground/` 不进入发布产物。参与开发请阅读[贡献指南](CONTRIBUTING.md)。

## 许可

[Apache-2.0](LICENSE) · [来源声明](NOTICE)
