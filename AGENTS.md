# UI 组件库局部指引（`@mango-write/ui-core` / `@mango-write/ui-vue`）

适用于 `packages/ui/**`。先遵守主仓根 [`AGENTS.md`](../../AGENTS.md)，再使用本文件。

## 职责与定位

`packages/ui` 是全仓唯一共享 UI 基础组件与静态样式源，同时作为独立平级 Monorepo 仓库发布：
- `packages/core` (`@mango-write/ui-core`)：跨框架零依赖核心（6 层设计 Token `var.css`、静态底座 `base.css`、22 族通用组件静态样式 `styles/components/*.css`、纯 TS 无头逻辑 `headless/*`、公共契约类型 `defs/*` 与国际化字典 `locale`）。
- `packages/vue` (`@mango-write/ui-vue`)：Vue 3 组件库与领域套件（对标未来 `@mango-write/ui-react` 与微信小程序 `@mango-write/ui-mp`）。
- `playground` (`@mango-write/ui-playground`)：独立文档与交互展示站，与库发布包物理隔离。

设计语言（「纸与霜 / Paper & Frost」）、6 层 token 体系、尺寸轴、圆角同心律与霜面纪律的唯一权威规格见 [`DESIGN.md`](DESIGN.md)；详细架构契约、组件开发模板与业务页面架构模板见 [`../../docs/architecture/ui-components.md`](../../docs/architecture/ui-components.md)，业务层消费速查见 [`../../docs/frontend-design-guide.md`](../../docs/frontend-design-guide.md)。

## 新增/修改组件强制清单（文件四件套）

任何基础组件的创建或重构必须同时完成以下四项，缺一不可：

1. **组件实现（`packages/vue/src/components/<Name>.vue`）**
   - 必须声明 `defineOptions({ name: "Mw<Name>" })`；含包裹层或多根节点时必须声明 `inheritAttrs: false`，将 `id`、`name`、`aria-*`、`data-*` 落到真实交互节点，将 `class` / `style` 合并到根容器。
   - 表单控件必须支持与 `FormField` 联动：`inputId?: string`、`invalid?: boolean`、`disabled?: boolean`、`readonly?: boolean`、`required?: boolean`，并输出 `:aria-invalid="invalid || undefined"` 与 `data-invalid` / `data-disabled`。
   - 交互底座优先使用原生 HTML（简单控件）或 `reka-ui` / `@tanstack/vue-table`（复杂浮层与表格）；**严禁引入 `reka-ui/internal`**。
2. **公共类型契约（`packages/vue/src/components/<kebab-name>.ts` 及跨框架 `packages/core/src/defs`）**
   - 组件公开的 Props、Emits、Option/Item 结构必须为 Mango 自有类型，**严禁直接 re-export 或透传 `reka-ui`、`@tanstack/vue-table`、`primevue` 的上游类型**。
   - `@mango-write/ui-core` 严禁引入 `vue`、`react`、`reka-ui` 等任何视图框架包（由 `packages/core/src/core-purity.test.ts` 门禁钉死）。
3. **行为与无障碍单测（`packages/vue/src/components/<Name>.component.test.ts`）**
   - 覆盖受控值读写（`modelValue` / `open`）、禁用/只读/错误态、`aria-*`/`data-*` 落点与核心键盘路径。
4. **导出、子路径与展示登记**
   - 同步更新 `packages/vue/src/index.ts` 与 `packages/vue/package.json` 的 `exports` + `publishConfig.exports`（两者键集合必须 1:1 对齐，由 `packages/vue/src/package-exports.test.ts` 自动门禁校验）。
   - 在 `playground/dev/registry-data.ts` 登记（标题与页首 lead 的中英双语单源，`playground/dev/registry.ts` 只补懒加载）并在 `playground/dev/pages/components/<slug>.vue` 提供完整文档页（在线演示、何时使用、纸/霜双底面 Specimen、尺寸与状态矩阵、接口表）。
   - **展示站文案一律内联双语**：页面/套件/api 数据的每条用户可见文案写成 `{ zh, en }`（`playground/dev/i18n.ts` 的 `Bi`），模板经 `t()` 取词——漏译直接 typecheck 红；没进 Bi 的裸中文由 `node scripts/check-dev-locale.mjs` 棘轮拦截（`i18n-allow` 行内/块级标记可放行，注释不扫）。

## 静态样式与构建红线

- **Token 单一真相源与机械门禁**：所有颜色、圆角、阴影、字号、间距、动效均取自 `packages/core/src/var.css`，由 `node scripts/check-tokens.mjs`（及 `scripts/check-tokens.test.ts`）强制零违规（禁止硬编码颜色/长度/时长/字重/z-index、禁止组件内引用 `--palette-*` 或 legacy token、禁止霜面内放不透明底色）。
- **单尺寸轴与材质规则**：
  - 控件几何统一读 `--control-{h,font,icon,px,gap,radius}`（或显式 `--size-{xs,sm,md,lg}-*`）；组件内局部变量必须以 `--mw-` 开头。
  - 浮层面板统一挂 `.mw-frost`（模态/抽屉用 `.mw-frost--thick`）；面板内部填充一律使用半透明墨色/语义阶（`--fill-*`、`--*-subtle`、`--control-bg`）。
- **静态 CSS 分层隔离**：
  - `packages/core/src/base.css` 与 `packages/core/src/components.css` 属于纯 Mango 静态样式层，**严禁引入 `primeicons`、`primevue-theme.css` 或 `--p-*` 变量**。
  - 跨框架通用组件样式归 `packages/core/src/styles/components/*.css` 并汇总于 `@mango-write/ui-core/components.css`；`packages/vue/src/components.css` 经 `@import "@mango-write/ui-core/components.css"` 聚合并在构建期合并 Vue 专有 SFC 样式。
  - 状态选择器统一使用 `[data-state="..."]`、`[data-highlighted]`、`[data-disabled]`、`[data-invalid]`。
- **声明文件跨平台唯一性**：组件与类型契约的文件名不能仅靠大小写区分（如 `Calendar` / `calendar`）；macOS 构建会覆盖声明。契约使用 `calendar-defs.ts` 这类独立名称，公开子路径通过 exports 映射保持稳定。
- **模块化构建与 Tree-shaking**：`packages/vue/vite.config.ts` 开启 `preserveModules: true`，确保消费方按子路径或按需引入时绝不连带无关组件。

## 验证命令

```bash
node scripts/check-tokens.mjs
node scripts/check-dev-locale.mjs
pnpm --dir packages/ui build
pnpm --dir packages/ui typecheck
pnpm --dir packages/ui test
```
