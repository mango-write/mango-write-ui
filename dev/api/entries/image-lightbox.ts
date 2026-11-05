import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "image-lightbox",
  component: "ImageLightbox",
  title: "图片灯箱",
  importPath: "@mango-write/ui",
  rows: [
    { name: "v-model:visible", kind: "prop", type: "boolean", desc: "受控显示状态；每次打开时自动将缩放（<code>1×</code>）、旋转（<code>0°</code>）与位移归零" },
    { name: "src", kind: "prop", type: "string", desc: "图片地址（必填）" },
    { name: "alt / caption", kind: "prop", type: "string / string | null", desc: "图片替代文本与底部居中图题说明；同时作为 <code>role=\"dialog\"</code> 的无障碍名称来源" },
    { name: "缩放 / 旋转 / 平移", kind: "prop", type: "内置手势与键盘", desc: "缩放范围 <code>0.2× – 8×</code>（滚轮、工具栏或键盘 <code>+</code>/<code>-</code>），支持 <code>±90°</code> 旋转与 Pointer Capture 拖拽平移" },
  ],
};
