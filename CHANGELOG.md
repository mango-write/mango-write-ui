# 更新日志

参照 Keep a Changelog 组织;版本号以 `package.json` 为准。组件库当前处于 0.x,接口在 1.0 前可能有小幅调整。

## v0.1.0 - 2026-11-05

### 新增

- 展示站首页:favicon、SEO 收录(robots/sitemap/预渲染快照)、顶部 GitHub 与产品入口
- LLM 产物:`llms.txt` 入口索引、`llms-full.txt` 整库单文件、`api/<slug>.md` 单组件文档,构建期从接口元数据生成
- 站内搜索(Ctrl+K):目录与接口元数据同源
- 快速上手页(安装依赖 → Vite 配置 → 样式引入 → 主题初始化 → 第一个组件)
- 12 个核心组件页附可复制示例代码(CodeBlock)
- 50 个组件的接口元数据单源(`dev/api/entries`),页面表格与 LLM 产物同源渲染

### 变更

- 展示站首页改版:真组件霜卡拼贴(含深色对照卡与滑块→进度条实时联动)、50 组件清单跑马灯、可交互试驾区、LLM 产物墨色舞台、特性演示卡与三行接入指引
- 50 个组件页的手写接口表改由 `ApiTable` 从元数据渲染,不再随页面手写漂移

### 修复

- Popover 面板样式改按类名交付:scope id 被 reka popper 定位 wrapper 截流,面板一度裸奔(无底色/内边距/圆角),与 Select 系面板同法
- portal 浮层接入动态层级,后开者恒在上(overlay-layer)
- Select 触发器宽度按最宽候选锁定,切换选择不再漂移
- 工具条档 SearchableMultiSelect 定宽,chip 增减不再漂移
