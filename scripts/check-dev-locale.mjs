#!/usr/bin/env node
// 展示站裸中文棘轮:dev/ 下剥离注释后,出现 CJK 且该行不是 Bi 字面量(zh:/en:)即违规。
// 文案一律走 dev/i18n.ts 的 { zh, en } + t(),漏译由 typecheck(Bi 形状)与本门禁(没进
// Bi 的裸文案)双面兜住。注释保持中文是仓库风格,剥离后不计。
// CLI:node scripts/check-dev-locale.mjs;vitest 经 check-dev-locale.test.ts 调用。
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEV = join(root, "playground", "dev");

// usage 系统与 UsagePlayground 的控件标签双语化尚在并行开发,落地后收进扫描。
const EXCLUDED = [join(DEV, "usage"), join(DEV, "kit", "UsagePlayground.vue")];

const CJK = /[\u3400-\u9fff]/;
// Bi 字面量所在行:zh: / en: 键。跨行的双语值每行各自带键,单行对象同样命中。
const BI_LITERAL = /\b(zh|en)\s*:/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (EXCLUDED.includes(full)) continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|vue)$/.test(full) && !/\.test\.ts$/.test(full)) out.push(full);
  }
  return out;
}

const blank = (m) => m.replace(/[^\n]/g, " ");

export function scanText(text) {
  // 块放行先于注释剥离:i18n-allow 区域整体隐去(模板注释不进 DOM,pre 里也安全)。
  // 标记注释里可带说明文字,所以用 [^>]* 而不是立即 -->。
  let text2 = text.replace(
    /<!--\s*i18n-allow:start\b[^>]*-->[\s\S]*?<!--\s*i18n-allow:end\b[^>]*-->/g,
    blank,
  );
  text2 = text2
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank);

  const out = [];
  // 行内放行看原始行(标记若在注释里,剥离后就找不到了)
  const origLines = text.split("\n");
  const lines = text2.split("\n");
  // 多行模板字符串:由带 zh:/en: 键的行开启时,值体的续行同样放行(code 双语值
  // 是逐行文案,不是新键)。反引号按行奇偶进出场,仓内无嵌套反引号字面量。
  let inTpl = false;
  let tplAllowed = false;
  for (let i = 0; i < lines.length; i += 1) {
    if (origLines[i].includes("i18n-allow")) continue;
    let line = lines[i];
    const ticks = (line.match(/`/g) || []).length;
    const opensTpl = ticks % 2 === 1;
    let lineAllowed = false;
    if (inTpl) {
      lineAllowed = tplAllowed;
      if (opensTpl) inTpl = false;
    } else if (opensTpl) {
      inTpl = true;
      tplAllowed = BI_LITERAL.test(line);
    }
    if (/^\s*(\/\/|\*)/.test(line)) continue;
    // 行内 // 注释:放过 ://("https://")与字符串内的 "//",其余剥掉
    line = line.replace(/(?<![:"])\/\/.*$/, "");
    if (CJK.test(line) && !BI_LITERAL.test(line) && !lineAllowed) out.push(i + 1);
  }
  return out;
}

export function checkDevLocale() {
  const violations = [];
  for (const file of walk(DEV)) {
    for (const line of scanText(readFileSync(file, "utf8"))) {
      violations.push({ file: relative(root, file), line });
    }
  }
  return violations;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const violations = checkDevLocale();
  for (const v of violations) console.log(`${v.file}:${v.line}  raw-cjk`);
  console.log(`\n${violations.length} violations`);
  process.exit(violations.length ? 1 : 0);
}
