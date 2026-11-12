# UI 组件库局部指引（`@mango-write/ui-core` / `@mango-write/ui-vue` / `@mango-write/ui-mp`）

适用于 `packages/ui/**`。先遵守主仓根 [`AGENTS.md`](../../AGENTS.md)，再使用本文件。

## 职责与定位

`packages/ui` 是全仓唯一共享 UI 基础组件与静态样式源，同时作为独立平级 Monorepo 仓库发布：
- `packages/core` (`@mango-write/ui-core`)：跨框架零依赖核心（6 层设计 Token `var.css`、移动端触控尺寸轴与卡片几何 `mobile-tokens.css`、静态底座 `base.css`、22 族通用组件静态样式 `styles/components/*.css`、纯 TS 无头逻辑 `headless/*`、公共契约类型 `defs/*` 与国际化字典 `locale`）。
- `packages/vue` (`@mango-write/ui-vue`)：Vue 3 桌面工作台组件库与领域套件（对标未来 `@mango-write/ui-react`）。
- `packages/mp` (`@mango-write/ui-mp`)：移动与微信小程序 / `uni-app` 组件库与样式编译管线（`compileWxssTokens` 合并 `var.css` + `mobile-tokens.css` → `mp-tokens.wxss`）；真实纵向切片宿主与微信验收归主仓 `apps/write-mp`。
- `playground` (`@mango-write/ui-playground`)：独立文档与交互展示站（含 `/foundations/overview`、`/foundations/desktop`、`/foundations/mini-program` 及 `/mp.html` 独立入口），与库发布包物理隔离。

设计语言采用「一核双翼」三部曲权威规格：核心设计语言见 [`DESIGN.md`](DESIGN.md)，桌面精细工作台设计语言见 [`DESIGN-DESKTOP.md`](DESIGN-DESKTOP.md)，移动与微信小程序设计语言（纸与霜 · 掌上版）见 [`DESIGN-MOBILE.md`](DESIGN-MOBILE.md)。详细架构契约、组件开发模板与业务页面架构模板见 [`../../docs/architecture/ui-components.md`](../../docs/architecture/ui-components.md)，业务层消费速查见 [`../../docs/frontend-design-guide.md`](../../docs/frontend-design-guide.md)。

## 新增/修改组件强制清单（文件四件套）

任何基础组件的创建或重构必须同时完成以下四项，缺一不可（移动端 `packages/mp` 同等适用，语义命名如 `variant`、`severity`、`fluid` 必须与桌面端对齐）：

1. **组件实现（`packages/vue/src/components/<Name>.vue` 或 `packages/mp/src/components/Mp<Name>.vue`）**
   - 必须声明 `defineOptions({ name: "Mw<Name>" })`（移动端为 `MwMp<Name>`）；桌面端含包裹层或多根节点时声明 `inheritAttrs: false`，移动端禁止对象展开式 `v-bind`，输入节点显式绑定 `id`/`name`/`aria-*`/`data-testid`。
   - 表单控件必须支持与 `FormField` / `MpFormField` 联动：`inputId?: string`、`invalid?: boolean`、`disabled?: boolean`、`readonly?: boolean`、`required?: boolean`。
   - 桌面交互底座优先使用原生 HTML（简单控件）或 `reka-ui` / `@tanstack/vue-table`（复杂浮层与表格）；**严禁引入 `reka-ui/internal`**。
2. **公共类型契约（`packages/vue/src/components/<kebab-name>.ts`、`packages/mp/src/components/Mp<Name>.vue` 及跨框架 `packages/core/src/defs`）**
   - 组件公开的 Props、Emits、Option/Item 结构必须为 Mango 自有类型，**严禁直接 re-export 或透传 `reka-ui`、`@tanstack/vue-table`、`primevue` 的上游类型**。
   - `@mango-write/ui-core` 严禁引入 `vue`、`react`、`reka-ui` 等任何视图框架包（由 `packages/core/src/core-purity.test.ts` 门禁钉死）。
3. **行为与无障碍单测（`*.component.test.ts`）**
   - 覆盖受控值读写（`modelValue` / `open`）、禁用/只读/错误态、`aria-*`/`data-*` 落点、退场动画延迟卸载时序（如适用）与核心键盘路径。
4. **导出、子路径与展示登记**
   - 同步更新 `src/index.ts` 与 `package.json` 的 `exports` + `publishConfig.exports`（两者键集合必须 1:1 对齐，由 `packages/vue/src/package-exports.test.ts` 与 `packages/mp/src/package-exports.test.ts` 自动门禁校验；改 `packages/mp` 样式或 Token 后必须重跑 `pnpm --dir packages/ui --filter @mango-write/ui-mp build` 刷新 `mp-tokens.wxss` 与 `mp-styles.wxss`）。
   - 在 `playground/dev/registry-data.ts` 登记（标题与页首 lead 的中英双语单源，`playground/dev/registry.ts` 只补懒加载）并在 `playground/dev/pages/{components,mobile}/<slug>.vue` 提供完整文档页。
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
- **小程序与 H5 Demo 双环境兼容红线（`packages/mp`）**：
  - 模板禁止使用微信小程序 WXML 不支持的运行时动态标签 `<component :is="...">`；
  - 表单输入（`MpInput` / `MpTextarea` / `MpSearchBar`）统一经 `packages/mp/src/lib/mp-dom.ts` 的 `readMpInputValue(event)` 取值，同时兼容小程序 `event.detail.value` 与 H5 `event.target.value`；
  - 交互按钮使用 `sm (36px)` / `md (44px)` / `lg (48px)` 胶囊几何，静态标签可用 `xs (28px)`，独立触控目标默认不低于 `44px`（筛选胶囊经伪元素补足 `44px` 触控区）；
  - 顶部不提供自定义导航栏（避免与微信原生导航/胶囊冲突），沉浸式二级页至多使用左上角圆形 `MpBackButton`；底部统一走单轨悬浮排布（`MpTabBar` 支持 `#action` 同轨动作与 `collapsed` + `#composer` 同轨折叠），禁止纵向堆叠双底栏；
  - `MpTag` 只展示静态标签，选择使用 `MpFilterChip` / `MpFilterBar`；单选使用 `MpSelectSheet`，不再与 `MpActionSheet` 混用；
  - 通用页面结构使用 `MpFormField`、`MpPageHeader`、`MpSectionHeader`、`MpBottomActionBar`、`MpComposer` 等公共模式，业务请求与 store 仍归宿主；
  - 模态浮层统一经 `lib/use-mp-overlay.ts` 管理焦点、Esc、焦点恢复、退场过渡时序与 H5 滚动锁，不另写平行焦点陷阱；
  - 微信编译器不支持对象展开式 `v-bind`：单根组件用原生 fallthrough，输入节点显式绑定 `id/name/aria-*`，不得为透传重新引入 `v-bind="$attrs"` 或 `v-bind="attrs"`；
  - **`wcsc` 与宿主样式红线**：生成的 `.wxss` 严禁出现 `*` 通配符、`:root` 或 `[data-theme]` 属性选择器（由 `packages/mp/src/package-exports.test.ts` 及本机 `wcsc` 门禁钉死）；所有原生 `<button>` 必须显式 `margin: 0` 并清零 `button::after`，防止微信默认 `margin: auto` 在 Grid/Flex 中把按钮挤成窄块，横向滚动容器必须隐藏 `::-webkit-scrollbar`；
  - **WXML 组件树与插槽编译红线**：① `mp-weixin` 将 `u-s` 插槽列表在编译期静态固化，父模板带 `v-if` 的条件插槽（如 `MpTabBar` `#action`）必须配运行时布尔 prop（如 `hasAction`）覆盖 `$slots` 判空；② 多子节点具名插槽会被包一层 `<view slot="...">`，容器 flex/gap 样式必须同时匹配 `> view`；③ 行内元数据统一用 `<span>`（禁止用 `<time>`，其在 `mp-weixin` 下编译为块级 `<view>` 导致断行）；④ `virtualHost: true` 子组件（如 `MpIcon`）外挂语义色时在外层包实体 `<span>` 承载颜色，自定义组件宿主（`virtualHost: false` 的 `<mp-cell>`、`<mp-button>`）的父级 `:last-child` / `flex: 1` 选择器必须同时覆盖组件宿主标签；
  - 跨 uni-app 页面边界的通知服务必须显式传给 `MpToastHost.service`，不能假设根 provide 或模块级后备服务在所有页面 chunk 中共享；
  - **真机模拟器闭环铁律**：H5 展示站与 Vitest 单测只算前置校验；涉及 `packages/mp` 模板、插槽、样式或动效的修改，必须在主仓 `apps/write-mp` 编译 `mp-weixin` 并在微信开发者工具模拟器完成 `compile_wxss`、亮/暗双态视觉与 Console 零报错核验才算闭环（步骤见 [`../../docs/runbooks/mini-program-development.md`](../../docs/runbooks/mini-program-development.md)）。

## 验证命令

```bash
node scripts/check-tokens.mjs
node scripts/check-dev-locale.mjs
pnpm --dir packages/ui build
pnpm --dir packages/ui typecheck
pnpm --dir packages/ui test
# 涉及 packages/mp 时继续跑主仓小程序闭环：
pnpm --filter @mango-write/write-mp build && pnpm --filter @mango-write/write-mp typecheck
```
