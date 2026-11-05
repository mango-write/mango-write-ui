import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "avatar",
  component: "Avatar",
  title: "头像",
  importPath: "@mango-write/ui",
  rows: [
    { name: "shape", kind: "prop", type: "square · circle", desc: "外观形状；默认 <code>square</code>" },
    { name: "size", kind: "prop", type: "xs · sm · md · lg · normal · large · xlarge", desc: "尺寸档位；不传则跟随容器密度上下文" },
    { name: "image", kind: "prop", type: "string", desc: "头像图片地址；加载失败时自动回退至 <code>label</code> 或 <code>icon</code>" },
    { name: "label", kind: "prop", type: "string", desc: "首字母或短字符缩略文本" },
    { name: "icon", kind: "prop", type: "Component", desc: "Lucide 图标组件（尺寸跟随容器密度）" },
    { name: "ariaLabel", kind: "prop", type: "string", desc: "无障碍名称，同时用于图片 <code>alt</code>" },
    { name: "@error / @click", kind: "event", type: "Event", desc: "图片加载失败事件与点击事件" },
    { name: "#default / #icon", kind: "slot", type: "—", desc: "自定义头像主体或图标插槽" },
  ],
};
