// dev 伺服 llms 产物:llms*.txt / api/*.md 只在 build:playground 生成,dev 里
// 首页与顶栏的链接会全 404;中间件按需重跑 gen-llms(亚秒级)再回文件。
// apply: serve——只挂 dev server,不进任何构建路径。
import { existsSync, readFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = fileURLToPath(new URL("..", import.meta.url));

export function llmsDevFiles() {
  return {
    name: "playground-llms-dev-files",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split("?")[0] ?? "";
        if (!/^\/(llms\.txt|llms-full\.txt|api\/[a-z0-9-]+\.md)$/.test(path)) return next();
        await run("node", ["scripts/gen-llms.mjs"], { cwd: ROOT });
        const file = `${ROOT}dist-playground${path}`;
        if (!existsSync(file)) {
          res.statusCode = 404;
          res.end("llms 产物生成失败,查看 gen-llms 输出");
          return;
        }
        res.setHeader("content-type", "text/plain; charset=utf-8");
        res.end(readFileSync(file));
      });
    },
  };
}
