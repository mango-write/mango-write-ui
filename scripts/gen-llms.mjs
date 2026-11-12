// 构建期生成 LLM 产物(llms.txt 标准流量入口 + 整库单文件 + 单组件 md):
//   dist-playground/llms.txt      入口索引(站点地图给 agent 用)
//   dist-playground/llms-full.txt 全部文档与 50 个组件 API,单文件可直接投喂上下文
//   dist-playground/api/<slug>.md 单组件 API
// 数据源:dev/api/entries(接口元数据)、dev/content.ts(安装步骤)、dev/registry-data.ts(目录与 lead)。
// 由 build:playground 在 vite build 之后调用,产物随 dist 经 nginx 静态直出。
// 接口事实源在 dev/api/entries,本脚本不承载内容;文案统一取 zh(Bi 单源的 zh 侧)。
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = join(new URL("..", import.meta.url).pathname);
const DIST = join(ROOT, "dist-playground");
const SITE = "https://ui.mangowrite.com";
const REPO = "https://github.com/mango-write/mango-write-ui";

if (!existsSync(DIST)) {
  console.error(`!! ${basename(DIST)} 不存在——先跑 vite build,再跑本脚本(build:playground 已串好)`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

// dev/api/entries/*.ts 是 TS(node 不能直跑):经 transpileModule 剥类型后落到临时目录再 import。
// entries 只有 `import type`,transpile 会整体 elide,不会真去找 ../types。
const tmp = mkdtempSync(join(tmpdir(), "ui-gen-llms-"));
async function importTs(file) {
  const js = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ModuleKind.ES2022 },
  }).outputText;
  const f = join(tmp, basename(file).replace(/\.ts$/, ".mjs"));
  writeFileSync(f, js);
  return import(pathToFileURL(f).href);
}

const { libraryIntro, reactLibraryIntro, installSteps, reactInstallSteps } = await importTs(
  join(ROOT, "playground/dev/content.ts"),
);

const entries = {};
for (const f of readdirSync(join(ROOT, "playground/dev/api/entries")).filter((n) => n.endsWith(".ts"))) {
  const { api } = await importTs(join(ROOT, "playground/dev/api/entries", f));
  entries[api.slug] = api;
}

// 目录与 lead 单源在 registry-data(纯字面量,node 可直 import);文案取 zh。
const zh = (bi) => (bi && typeof bi === "object" ? bi.zh : bi ?? "");
const { docGroups } = await importTs(join(ROOT, "playground/dev/registry-data.ts"));
const groups = docGroups.map((g) => ({
  id: g.id,
  section: g.section,
  title: zh(g.title),
  base: g.base,
  entries: g.entries.map((e) => ({ slug: e.slug, title: zh(e.title), en: e.title?.en ?? "", lead: zh(e.lead) })),
}));

const componentGroups = groups.filter((g) => g.section === "desktop" && g.id !== "getting-started");
const foundationGroups = groups.filter((g) => g.section === "foundations");
const mobileGroups = groups.filter((g) => g.section === "mobile");
const registrySlugs = componentGroups.flatMap((g) => g.entries.map((e) => e.slug));
const entrySlugs = Object.keys(entries).sort();
const missing = registrySlugs.filter((s) => !entries[s]);
const extra = entrySlugs.filter((s) => !registrySlugs.includes(s));
if (missing.length || extra.length) {
  console.error(`!! registry 与 api/entries 不同步——registry 缺: ${missing} ;entries 多出: ${extra}`);
  process.exit(1);
}

// desc 存的是受限内联 HTML(<code>):转回 markdown 反引号;表格单元转义竖线。
const ENT = { lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
function toMd(html, { cell = false } = {}) {
  let s = html.replace(/<code>([\s\S]*?)<\/code>/g, (_, c) => `\`${c.trim()}\``);
  s = s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  s = s.replace(/&(lt|gt|quot|#39|nbsp);/g, (_, e) => ENT[e]).replace(/&amp;/g, "&");
  return cell ? s.replace(/\|/g, "\\|") : s;
}
const pageUrl = (entry) => `${SITE}/components/${entry.slug}`;

function componentSection(e, { heading }) {
  const lead = e.lead ?? "";
  const names = e.exports ? e.exports.join(", ") : e.component;
  const reactImportPath = e.importPath.replace("@mango-write/ui-vue", "@mango-write/ui-react");
  const sub = heading + "#";
  const out = [];
  out.push(`${heading} ${e.component} ${zh(e.title)}`);
  out.push("");
  out.push(`导入 (Vue 3):\`import { ${names} } from "${e.importPath}"\``);
  out.push(`导入 (React):\`import { ${names} } from "${reactImportPath}"\``);
  out.push(`文档页:${pageUrl(e)}`);
  if (lead) out.push("", lead);
  out.push("", `${sub} 接口`, "", "| 名称 | 取值 | 说明 |", "|---|---|---|");
  for (const r of e.rows) {
    out.push(`| ${zh(r.name).replace(/\|/g, "\\|")} | ${toMd(zh(r.type) ?? "", { cell: true })} | ${toMd(zh(r.desc), { cell: true })} |`);
  }
  out.push("");
  return out.join("\n");
}

// ---- llms.txt:入口索引 ----------------------------------------------------
const llms = [];
llms.push(`# MangoWrite UI`, "");
llms.push(`> ${zh(libraryIntro)}`, "");
llms.push(`> ${zh(reactLibraryIntro)}`, "");
llms.push(
  `纸与霜设计语言官方文档站。整库文档(Vue 3 / React 安装、全部 ${entrySlugs.length} 个桌面组件的 API 及移动端组件)在单文件 [llms-full.txt](${SITE}/llms-full.txt),可直接投喂上下文;单个组件也可按 [api/<slug>.md](${SITE}/api/button.md) 精取。`,
  "",
);
llms.push(`# 上手`, "");
llms.push(
  `- [安装与上手 (Vue 3 / React)](${SITE}/getting-started/installation):依赖安装、样式引入、主题初始化与第一个组件`,
  "",
);
llms.push(`# 设计规范`, "");
for (const g of foundationGroups) {
  for (const f of g.entries) {
    llms.push(`- [${f.title} ${f.en}](${SITE}/${g.base}/${f.slug}):${f.lead}`);
  }
}
llms.push("", `# 桌面端组件 (@mango-write/ui-vue · @mango-write/ui-react · ${entrySlugs.length} 个)`, "");
for (const g of componentGroups) {
  for (const e of g.entries) {
    const api = entries[e.slug];
    llms.push(`- [${e.en} ${e.title}](${pageUrl(api)}):${e.lead}`);
  }
}
llms.push("", `# 移动端与小程序组件 (@mango-write/ui-mp)`, "");
for (const g of mobileGroups) {
  for (const e of g.entries) {
    llms.push(`- [${e.en} ${e.title}](${SITE}/${g.base}/${e.slug}):${e.lead}`);
  }
}
llms.push(
  "",
  `# 其他`,
  "",
  `- GitHub 仓库:${REPO}`,
  `- robots.txt:全站允许抓取(含 AI 爬虫)`,
  "",
);
writeFileSync(join(DIST, "llms.txt"), llms.join("\n"));

// ---- llms-full.txt:整库单文件 ----------------------------------------------
const full = [];
full.push(`# MangoWrite UI 完整文档`, "");
full.push(`> ${zh(libraryIntro)}`, "");
full.push(`> ${zh(reactLibraryIntro)}`, "");
full.push(`- 站点:${SITE}(设计规范与逐组件页面见 llms.txt 索引)`);
full.push(`- GitHub:${REPO}(Apache-2.0)`);
full.push(`- 版本:${pkg.version}`);
full.push(
  `- 覆盖:${entrySlugs.length} 个桌面组件(@mango-write/ui-vue 与 @mango-write/ui-react 100% 对等)、${Object.values(entries).reduce((n, e) => n + e.rows.length, 0)} 行接口元数据;接口以包内 TypeScript 类型为准,本文件由构建生成,勿手改。`,
  "",
);
full.push(`## 安装与上手 (Vue 3 · @mango-write/ui-vue)`, "");
for (const step of installSteps) {
  full.push(`### ${zh(step.title)}`, "");
  if (step.desc) full.push(zh(step.desc), "");
  full.push("```" + step.lang, zh(step.code), "```", "");
}
full.push(`## 安装与上手 (React · @mango-write/ui-react)`, "");
for (const step of reactInstallSteps) {
  full.push(`### ${zh(step.title)}`, "");
  if (step.desc) full.push(zh(step.desc), "");
  full.push("```" + step.lang, zh(step.code), "```", "");
}
full.push(`## 设计规范`, "");
for (const g of foundationGroups) {
  for (const f of g.entries) {
    full.push(`- [${f.title} ${f.en}](${SITE}/${g.base}/${f.slug}):${f.lead}`);
  }
}
full.push("", `## 移动端与小程序组件 (@mango-write/ui-mp)`, "");
for (const g of mobileGroups) {
  for (const e of g.entries) {
    full.push(`- [${e.en} ${e.title}](${SITE}/${g.base}/${e.slug}):${e.lead}`);
  }
}
for (const g of componentGroups) {
  full.push("", `## 桌面端组件 · ${g.title}`, "");
  for (const e of g.entries) {
    full.push(componentSection(entries[e.slug], { heading: "###" }));
  }
}
writeFileSync(join(DIST, "llms-full.txt"), full.join("\n"));

// ---- api/<slug>.md:单组件 ---------------------------------------------------
mkdirSync(join(DIST, "api"), { recursive: true });
for (const slug of entrySlugs) {
  const e = entries[slug];
  const md = componentSection(e, { heading: "#" });
  writeFileSync(join(DIST, "api", `${slug}.md`), md);
}

const kb = (f) => (readFileSync(join(DIST, f), "utf8").length / 1024).toFixed(1);
console.log(
  `gen-llms: llms.txt ${kb("llms.txt")}KB · llms-full.txt ${kb("llms-full.txt")}KB · api/*.md × ${entrySlugs.length}`,
);
