# `@mango-write/ui-mp`

MangoWrite 微信小程序与移动 H5 组件库，基于 uni-app Vue 3 与 `@mango-write/ui-core`，沿用「纸与霜」统一材质语义。

## 核心契约

1. **WXSS Token 编译管线**：`var.css` 与 `mobile-tokens.css` 合成为小程序样式；浅色/深色派生色在构建期静态烘焙，运行时切换主题，不支持动态覆写品牌色后联动重算。
2. **全幅纸面与单轨悬浮霜胶囊**：顶部不提供自定义导航栏（常规页使用微信原生导航，沉浸式二级页至多在左上角悬浮圆形 `MpBackButton`）；底部通过 `MpTabBar`（支持 `#action` 同轨动作与 `collapsed` + `#composer` 同轨折叠）、`MpBottomActionBar` 与 `MpComposer` 保持单轨悬浮，严禁双层底栏堆叠。
3. **同心曲率与着色不铺色**：按钮、单行输入、搜索框、筛选芯片与底轨统一采用胶囊曲率，分组纸卡与多行文本域采用 `20px` 圆角，模态浮层统一采用四周微内缩 `28px` 厚霜悬浮面板；控件静息与聚焦均采用半透明叠层，不打穿霜面。
4. **语义分离与公共模式**：静态标签与筛选芯片、动作菜单与单选选择器、空态与加载反馈分别拥有独立契约；表单字段、页面/区块标题、筛选条、底部动作区、输入器、提示和消息不包含业务请求或业务 store。
5. **可访问浮层**：Sheet、ActionSheet、SelectSheet、Confirm 共享焦点、Esc、焦点恢复与 H5 滚动锁；Toast 只展示最新一条悬浮胶囊并可关闭。
6. **同源验收**：从主仓执行 `pnpm test:mp:weixin`，对真实 `dist/build/mp-weixin` 运行官方 Automator；真机使用 `pnpm test:mp:remote`，H5、模拟器和真机结果分别报告。

组件实现与公开导出以 `src/components` 和 `src/index.ts` 为准，设计与模式边界见 `../../DESIGN-MOBILE.md`。
