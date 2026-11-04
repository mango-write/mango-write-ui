# UI 组件库局部指引（`@mango-write/ui`）

适用于 `packages/ui/**`。先遵守主仓根 [`AGENTS.md`](../../AGENTS.md)，再使用本文件。

## 职责与定位

`packages/ui` 是全仓唯一共享 UI 基础组件与静态样式源，同时作为独立仓库发布。
详细架构契约、组件开发模板与业务页面架构模板见 [`../../docs/architecture/ui-components.md`](../../docs/architecture/ui-components.md)，设计 token 与密度体系见 [`../../docs/frontend-design-guide.md`](../../docs/frontend-design-guide.md)。

## 新增/修改组件强制清单（文件四件套）

任何基础组件的创建或重构必须同时完成以下四项，缺一不可：

1. **组件实现（`src/components/<Name>.vue`）**
   - 必须声明 `defineOptions({ name: "Mw<Name>" })`；含包裹层或多根节点时必须声明 `inheritAttrs: false`，将 `id`、`name`、`aria-*`、`data-*` 落到真实交互节点，将 `class` / `style` 合并到根容器。
   - 表单控件必须支持与 `FormField` 联动：`inputId?: string`、`invalid?: boolean`、`disabled?: boolean`、`readonly?: boolean`、`required?: boolean`，并输出 `:aria-invalid="invalid || undefined"` 与 `data-invalid` / `data-disabled`。
   - 交互底座优先使用原生 HTML（简单控件）或 `reka-ui` / `@tanstack/vue-table`（复杂浮层与表格）；**严禁引入 `reka-ui/internal`**。
2. **公共类型契约（`src/components/<kebab-name>.ts`）**
   - 组件公开的 Props、Emits、Option/Item 结构必须为 Mango 自有类型，**严禁直接 re-export 或透传 `reka-ui`、`@tanstack/vue-table`、`primevue` 的上游类型**。
3. **行为与无障碍单测（`src/components/<Name>.component.test.ts`）**
   - 覆盖受控值读写（`modelValue` / `open`）、禁用/只读/错误态、`aria-*`/`data-*` 落点与核心键盘路径。
4. **导出、子路径与展示登记**
   - 同步更新 `src/index.ts` 与 `package.json` 的 `exports` + `publishConfig.exports`（两者键集合必须 1:1 对齐，由 `src/package-exports.test.ts` 自动门禁校验）。
   - 在 `dev/pages/UiShowcase.vue` 补充完整状态矩阵（default / hover / focus-visible / invalid / disabled / readonly / empty / loading）。

## 静态样式与构建红线

- **Token 单一真相源**：所有颜色、圆角、阴影、字号、动效均取自 `src/var.css`，禁止硬编码颜色字面量或引用未定义变量。
- **静态 CSS 分层隔离**：
  - `src/base.css` 与 `src/components.css` 属于纯 Mango 静态样式层，**严禁引入 `primeicons`、`primevue-theme.css` 或 `--p-*` 变量**。
  - 输入/选择控件统一复用 `src/components.css` 中的 `.mw-control` 底座，并挂 `.mw-input` / `.mw-select` / `.mw-btn` 钩子类以自动适配 `.mw-toolbar` 32px 紧凑档位。
  - 状态选择器统一使用 `[data-state="..."]`、`[data-highlighted]`、`[data-disabled]`、`[data-invalid]`。
- **模块化构建与 Tree-shaking**：`vite.config.ts` 开启 `preserveModules: true`，确保消费方按子路径或按需引入时绝不连带 `@primeuix/themes`、`MangoPreset` 或无关组件。

## 验证命令

```bash
pnpm --dir packages/ui build
pnpm --dir packages/ui typecheck
pnpm --dir packages/ui test
```
