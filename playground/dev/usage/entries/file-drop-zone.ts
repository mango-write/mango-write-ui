import { FileDropZone } from "@mango-write/ui-vue";
import type { UsageEntry } from "../types";

export const usage: UsageEntry = {
  slug: "file-drop-zone",
  component: FileDropZone,
  tag: "FileDropZone",
  controls: [
    { prop: "accept", label: "接受类型", kind: "text", default: undefined },
    { prop: "multiple", label: "多选", kind: "boolean", default: false },
    {
      prop: "surface",
      label: "底面",
      kind: "enum",
      default: "solid",
      options: [
        { label: "solid 控件面", value: "solid" },
        { label: "inlay 内嵌面", value: "inlay" },
      ],
    },
    { prop: "bare", label: "裸条档", kind: "boolean", default: false },
    { prop: "plain", label: "无框档", kind: "boolean", default: false },
    { prop: "disabled", label: "禁用", kind: "boolean", default: false },
  ],
};
