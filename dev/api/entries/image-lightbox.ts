import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "image-lightbox",
  component: "ImageLightbox",
  title: { zh: "图片灯箱", en: "Image lightbox" },
  importPath: "@mango-write/ui",
  rows: [
    {
      name: "v-model:visible",
      kind: "prop",
      type: "boolean",
      desc: {
        zh: "受控显示状态；每次打开时自动将缩放（<code>1×</code>）、旋转（<code>0°</code>）与位移归零",
        en: "Controlled visibility; each open resets zoom (<code>1×</code>), rotation (<code>0°</code>), and offset to zero",
      },
    },
    {
      name: "src",
      kind: "prop",
      type: "string",
      desc: {
        zh: "图片地址（必填）",
        en: "Image source (required)",
      },
    },
    {
      name: "alt / caption",
      kind: "prop",
      type: "string / string | null",
      desc: {
        zh: "图片替代文本与底部居中图题说明；同时作为 <code>role=\"dialog\"</code> 的无障碍名称来源",
        en: "Image alt text and the centered caption at the bottom; also the accessible-name source for <code>role=\"dialog\"</code>",
      },
    },
    {
      name: { zh: "缩放 / 旋转 / 平移", en: "Zoom / rotate / pan" },
      kind: "prop",
      type: { zh: "内置手势与键盘", en: "Built-in gestures & keys" },
      desc: {
        zh: "缩放范围 <code>0.2× – 8×</code>（滚轮、工具栏或键盘 <code>+</code>/<code>-</code>），支持 <code>±90°</code> 旋转与 Pointer Capture 拖拽平移",
        en: "Zoom range <code>0.2× – 8×</code> (wheel, toolbar, or keyboard <code>+</code>/<code>-</code>), <code>±90°</code> rotation, and Pointer Capture drag pan",
      },
    },
  ],
};
