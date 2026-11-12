// git 依赖消费方经 prepare → build 拿 dist 产物；peer 与 @mango-write/ui-core 外部化，宿主自持单一实例。
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const peers = [
  "react",
  "react-dom",
  "lucide-react",
  "@tanstack/react-table",
  "radix-ui",
  "@mango-write/ui-core",
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    minify: false,
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
      cssFileName: "components",
    },
    rollupOptions: {
      external: (id) =>
        id.startsWith("@radix-ui/") ||
        peers.some((p) => id === p || id.startsWith(`${p}/`)),
      output: {
        preserveModules: true,
        preserveModulesRoot: fileURLToPath(new URL("./src", import.meta.url)),
        entryFileNames: "[name].js",
        assetFileNames: "components.css",
      },
    },
  },
});
