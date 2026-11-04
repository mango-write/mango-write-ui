# UI 组件库局部指引（`@mango-write/ui`）

适用于 `packages/ui/**`。先遵守主仓根 [`AGENTS.md`](../../AGENTS.md)，再使用本文件。

## 职责与定位

`packages/ui` 是全仓唯一共享 UI 基础组件与静态样式源，同时作为独立仓库发布。
设计语言（「纸与霜 / Paper & Frost」）、6 层 token 体系、尺寸轴、圆角同心律与霜面纪律的唯一权威规格见 [`DESIGN.md`](DESIGN.md)；详细架构契约、组件开发模板与业务页面架构模板见 [`../../docs/architecture/ui-components.md`](../../docs/architecture/ui-components.md)，业务层消费速查见 [`../../docs/frontend-design-guide.md`](../../docs/frontend-design-guide.md)。

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
   - 在 `dev/registry.ts` 登记并在 `dev/pages/components/<slug>.vue` 提供完整文档页（何时使用、纸/霜双底面 Specimen、尺寸与状态矩阵、接口表）。

## 静态样式与构建红线

- **Token 单一真相源与机械门禁**：所有颜色、圆角、阴影、字号、间距、动效均取自 `src/var.css`，由 `node scripts/check-tokens.mjs`（及 `scripts/check-tokens.test.ts`）强制零违规（禁止硬编码颜色/长度/时长/字重/z-index、禁止组件内引用 `--palette-*` 或 legacy token、禁止霜面内放不透明底色）。
- **单尺寸轴与材质规则**：
  - 控件几何统一读 `--control-{h,font,icon,px,gap,radius}`（或显式 `--size-{xs,sm,md,lg}-*`）；组件私有衍生变量必须以 `--_` 开头。
  - 浮层面板统一挂 `.mw-frost`（模态/抽屉用 `.mw-frost--thick`）；面板内部填充一律使用半透明墨色/语义阶（`--fill-*`、`--*-subtle`、`--control-bg`）。
- **静态 CSS 分层隔离**：
  - `src/base.css` 与 `src/components.css` 属于纯 Mango 静态样式层，**严禁引入 `primeicons`、`primevue-theme.css` 或 `--p-*` 变量**。
  - `src/components.css` 仅保留 `.mw-control` 公共底座；各组件样式统一内聚在各自的 `.vue` 单文件组件中。
  - 状态选择器统一使用 `[data-state="..."]`、`[data-highlighted]`、`[data-disabled]`、`[data-invalid]`。
- **模块化构建与 Tree-shaking**：`vite.config.ts` 开启 `preserveModules: true`，确保消费方按子路径或按需引入时绝不连带 `@primeuix/themes`、`MangoPreset` 或无关组件。

## 验证命令

```bash
node scripts/check-tokens.mjs
pnpm --dir packages/ui build
pnpm --dir packages/ui typecheck
pnpm --dir packages/ui test
```
