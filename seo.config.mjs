// SEO 产物配置：宿主仓 scripts/prerender-spa.mjs 消费（ship-build.sh 发布构
// 建期以 --app packages/ui --dist dist-playground 调用）。展示站只收录首页。
export const siteUrl = "https://ui.mangowrite.com";
export const locales = ["zh-CN"];
export const bareDefaultLocale = true;

// 无私有路径：首页公开，robots.txt 因此全站 Allow。
export const disallowPaths = [];

// 只预渲染首页（path "" → 快照写 dist/_root.html）；文档页是应用面，
// 深链回落 SPA 壳即可，不进 sitemap。
export const paths = [""];
