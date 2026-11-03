import { definePreset } from "@primeuix/themes";
import type { Preset } from "@primeuix/themes/types";
import auraBase from "@primeuix/themes/aura/base";
import auraConfirmdialog from "@primeuix/themes/aura/confirmdialog";
import auraDialog from "@primeuix/themes/aura/dialog";
import auraSelect from "@primeuix/themes/aura/select";
import auraToggleswitch from "@primeuix/themes/aura/toggleswitch";

import { mangoOverrides } from "./theme-overrides";

// 轻量预设包含 Select / ToggleSwitch / Dialog / ConfirmDialog；其他组件可使用
// MangoPreset 或扩展组件 token。弹窗必须在这里登记：缺 token 的组件在 styled
// 模式下拿不到任何 `.p-*` 几何样式，只会剩下 primevue-theme.css 的材质补丁。
export const MangoPresetLite: Preset = definePreset(
  {
    ...auraBase,
    components: {
      select: auraSelect,
      toggleswitch: auraToggleswitch,
      dialog: auraDialog,
      confirmdialog: auraConfirmdialog
    }
  },
  {
    ...mangoOverrides,
    components: {
      select: mangoOverrides.components?.select,
      toggleswitch: mangoOverrides.components?.toggleswitch
    }
  }
);
