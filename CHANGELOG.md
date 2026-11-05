# 更新日志

参照 Keep a Changelog 组织;版本号以 `package.json` 为准。组件库当前处于 0.x,接口在 1.0 前可能有小幅调整。

## v0.1.0 - 2026-11-05

### 新增

- 展示站首页:favicon、SEO 收录(robots/sitemap/预渲染快照)、顶部 GitHub 与产品入口
- LLM 产物:`llms.txt` 入口索引、`llms-full.txt` 整库单文件、`api/<slug>.md` 单组件文档,构建期从接口元数据生成
- 站内搜索(Ctrl+K):目录与接口元数据同源
- 快速上手页(安装依赖 → Vite 配置 → 样式引入 → 主题初始化 → 第一个组件)
- 12 个核心组件页附可复制示例代码(CodeBlock)
- 组件详情页交互式 playground(`UsagePlayground`):47 个组件可在线调整 props 实时预览(纸/霜双底面),按当前配置生成使用代码并一键复制;配置声明单源在 `dev/usage/entries`,与预览渲染同一条数据路径,替换原 12 个组件的纯文本示例(CodeBlock 保留给安装页/首页)
- 50 个组件的接口元数据单源(`dev/api/entries`),页面表格与 LLM 产物同源渲染
- 展示站全站中英双语:顶栏「中 / EN」切换(localStorage 记忆 + 浏览器语言默认,预渲染快照天然落在 zh),页面文案内联 `{ zh, en }` + `t()` 取词——61 篇文档页、首页、Doc 套件、api 数据、搜索与组件内置文案全部双语;文档目录与页首 lead 单源迁到 `dev/registry-data.ts`(gen-llms 直读,`<code>` 不再正则解析页面);llms 产物保持中文;`dev/i18n.ts` 是机制唯一入口,裸中文由 `scripts/check-dev-locale.mjs` 棘轮拦截(`dev/usage/` 控件标签双语化落地后收进扫描)

### 变更

- 展示站首页改版:真组件霜卡拼贴(含深色对照卡与滑块→进度条实时联动)、50 组件清单霜带三行跑马灯(中行反向错位)、可交互试驾区、LLM 产物墨色舞台、特性演示卡与三行接入指引
- 展示站路由去掉历史 `/dev/ui` 前缀,文档路由根化(`/getting-started/*`、`/foundations/*`、`/components/*`),未知路径回落首页
- 展示站统一顶栏(以首页为准):文档壳复用首页 header(品牌回首页/主题档位/产品入口/GitHub),搜索与版本号收进档位左侧;文档壳画布改首页同款纸面,目录改霜面圆角栏(胶囊态),内容区从工作台镜面纸改纸卡
- 顶栏改主产品工作台同款浮岛:离边留 gutter、四角圆,与下方岛同缝 8px;首页滚动时内容从岛底穿过,底霜调薄一档(`color-mix` 45%)让影子透出来
- 顶栏品牌改「图形标 + 字样」组合:logo 换方形 mark(`AppLogo mark-only`),「MangoWrite UI」字样用自托管 Nunito 圆角体(public/fonts,OFL 许可随附)以 mark 同款 accent 色绘制,行盒与 mark 同高垂直居中,不再复用带中文的全标 SVG
- 顶栏新增「首页 / 组件文档」切换胶囊(当前区高亮,与目录栏一套 hover/选中语言);组件文档落快速上手入口,窄屏收起版本号与搜索钮为其让位
- 顶栏新增 LLM 接入:首位「LLM 接入」实心钮直达 llms.txt(根相对,随部署域名),科研平台随之降为描边次级,窄屏收主题档位为其让位(主题回落系统档);首页 hero 在「快速上手 / GitHub」旁新增一键复制 Prompt 给 LLM(指向 llms-full.txt,贴进模型对话即用),复制有轻提示反馈
- 展示站 dev 伺服 LLM 产物:vite 中间件按需重跑 gen-llms(`/llms.txt`、`/llms-full.txt`、`/api/*.md` 此前只在 build:playground 生成,dev 里全 404)
- 50 个组件页的手写接口表改由 `ApiTable` 从元数据渲染,不再随页面手写漂移

### 修复

- 文档壳顶栏 logo 改链首页,此前落在文档页回不去
- Popover 面板样式改按类名交付:scope id 被 reka popper 定位 wrapper 截流,面板一度裸奔(无底色/内边距/圆角),与 Select 系面板同法
- portal 浮层接入动态层级,后开者恒在上(overlay-layer)
- Select 触发器宽度按最宽候选锁定,切换选择不再漂移
- 工具条档 SearchableMultiSelect 定宽,chip 增减不再漂移
