# `@mango-write/ui-mp`

MangoWrite 微信小程序与移动 H5 组件库，基于 uni-app Vue 3 与 `@mango-write/ui-core`。

## 核心契约

1. **WXSS Token 编译管线**：`var.css` 与 `mobile-tokens.css` 合成为小程序样式；浅色/深色派生色在构建期静态烘焙，运行时切换主题，不支持动态覆写品牌色后联动重算。
2. **内容优先**：默认通栏信息流，正文 16px，独立触控动作至少 44px；交互按钮使用 44/48/52px，图标使用统一矢量组件。
3. **语义分离**：静态标签与筛选芯片、动作菜单与单选选择器、空态与加载反馈分别拥有独立组件和事件契约。
4. **公共模式**：提供表单字段、页面/区块标题、筛选条、底部动作区、输入器、提示和消息，不包含业务请求或业务 store。
5. **可访问浮层**：Sheet、ActionSheet、SelectSheet、Confirm 共享焦点、Esc、焦点恢复与 H5 滚动锁；Toast 只展示最新一条并可关闭。
6. **同源验收**：从主仓执行 `pnpm test:mp:weixin`，对真实 `dist/build/mp-weixin` 运行官方 Automator；真机使用 `pnpm test:mp:remote`，H5、模拟器和真机结果分别报告。

组件实现与公开导出以 `src/components` 和 `src/index.ts` 为准，设计与模式边界见 `../../DESIGN-MOBILE.md`。
