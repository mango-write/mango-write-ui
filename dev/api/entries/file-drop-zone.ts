import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "file-drop-zone",
  component: "FileDropZone",
  title: { zh: "文件拖放区", en: "File drop zone" },
  importPath: "@mango-write/ui",
  rows: [
    { name: "accept / multiple", kind: "prop", type: "—", desc: { zh: "透传给隐藏的 file input", en: "Passed through to the hidden file input" } },
    { name: "surface", kind: "prop", type: "solid · inlay", desc: { zh: "有框档的底面", en: "Surface of the framed variant" } },
    { name: "bare / plain", kind: "prop", type: "boolean", desc: { zh: "去框档；只保留拖 / 点行为与拖入反馈", en: "Chromeless variants; only drag/click behavior and dragover feedback remain" } },
    { name: "@files", kind: "event", type: "File[]", desc: { zh: "拖入或选择后触发；嵌套放置区不会重复接收", en: "Fires after a drop or pick; nested drop zones don't receive it twice" } },
  ],
};
