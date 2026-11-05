import type { ApiEntry } from "../types";

export const api: ApiEntry = {
  slug: "file-drop-zone",
  component: "FileDropZone",
  title: "文件拖放区",
  importPath: "@mango-write/ui",
  rows: [
    { name: "accept / multiple", kind: "prop", type: "—", desc: "透传给隐藏的 file input" },
    { name: "surface", kind: "prop", type: "solid · inlay", desc: "有框档的底面" },
    { name: "bare / plain", kind: "prop", type: "boolean", desc: "去框档；只保留拖 / 点行为与拖入反馈" },
    { name: "@files", kind: "event", type: "File[]", desc: "拖入或选择后触发；嵌套放置区不会重复接收" },
  ],
};
