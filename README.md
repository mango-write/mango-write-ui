# MangoWrite UI

为 Vue 3 和 PrimeVue 应用提供一致的主题、设计 token 和常用交互组件。支持浅色与深色模式，适用于内容工具、数据工作台和产品网站。

## 功能

- **主题与样式**：MangoPreset、轻量主题、语义颜色、排版、间距和动效 token。
- **表单交互**：FormField 的标签/说明/错误关联，可搜索单选、多选与组合面板。
- **内容与反馈**：AsyncSlot 四态、自定义骨架、HoverCard 与带焦点管理的图片灯箱。
- **网站组件**：页头、页脚、导航、品牌与社交账号配置。
- **主题偏好**：浅色、深色、跟随系统，以及可配置的存储键和主题根节点。

## 安装

使用 Node.js 24+ 和 pnpm 10.20.0。

```bash
pnpm add @mango-write/ui@github:mango-write/mango-write-ui#v0.1.0
pnpm add vue primevue @primeuix/themes vue-i18n lucide-vue-next
pnpm add -D tailwindcss @tailwindcss/vite tailwindcss-primeui
```

安装时会生成 JavaScript、TypeScript 声明和 CSS 文件。

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
@plugin "tailwindcss-primeui";
@import "@mango-write/ui/theme.css";
@import "@mango-write/ui/components.css";
@source "../node_modules/@mango-write/ui/src";
```

在 `src/main.ts` 中配置主题和组件文案：

```ts
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import PrimeVue from "primevue/config";
import { initTheme, MangoPreset, mergeUiMessages, vTooltip } from "@mango-write/ui";
import App from "./App.vue";
import "./style.css";

const i18n = createI18n({ legacy: false, locale: "zh-CN", messages: {} });
mergeUiMessages(i18n);
initTheme();

createApp(App)
  .use(PrimeVue, {
    theme: { preset: MangoPreset, options: { darkModeSelector: '[data-theme="dark"]' } },
  })
  .use(i18n)
  .directive("tooltip", vTooltip)
  .mount("#app");
```

随后即可在组件中使用：

```vue
<script setup lang="ts">
import { ref } from "vue";
import { FormField, SearchableSelect } from "@mango-write/ui";

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

`MangoPreset` 提供完整组件主题；`MangoPresetLite` 包含 Select 和 ToggleSwitch 的主题。

`initTheme({ storageKey, rootEl })` 配置主题偏好的存储位置和主题属性写入的元素。`useThemePreference()` 提供当前偏好、解析后的主题与 `setTheme()`。

`SiteHeader` 通过 `items`、语言切换事件及插槽配置导航。`SiteFooter` 通过 `socials` 配置社交账号，通过 `brand`、`legal` 和默认插槽配置品牌、版权与网站链接；设置 `socials=[]` 可隐藏社交账号。

| 样式入口 | 用途 |
|---|---|
| `@mango-write/ui/theme.css` | 完整主题、token 和通用样式 |
| `@mango-write/ui/components.css` | Vue 组件样式 |
| `@mango-write/ui/tokens.css` | 设计 token |
| `@mango-write/ui/primevue-theme.css` | PrimeVue 样式扩展 |

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

`pnpm dev` 启动独立展示应用：组件库位于 `http://localhost:5174/dev/ui`，图标库位于 `http://localhost:5174/dev/icon`。两个页面及其路由只归本仓维护，宿主应用不注册这些路由。

构建输出位于 `dist/`，包含 ESM、类型声明和 CSS；`dev/` 不进入发布产物。参与开发请阅读[贡献指南](CONTRIBUTING.md)。

## 许可

[Apache-2.0](LICENSE) · [来源声明](NOTICE)
