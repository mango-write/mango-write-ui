import { definePreset } from "@primeuix/themes";
import type { Preset } from "@primeuix/themes/types";
import auraBase from "@primeuix/themes/aura/base";
import auraSelect from "@primeuix/themes/aura/select";
import auraToggleswitch from "@primeuix/themes/aura/toggleswitch";

import { mangoOverrides } from "./theme-overrides";

// 轻量预设包含 Select 与 ToggleSwitch；其他组件可使用 MangoPreset 或扩展组件 token。
export const MangoPresetLite: Preset = definePreset(
  { ...auraBase, components: { select: auraSelect, toggleswitch: auraToggleswitch } },
  {
    ...mangoOverrides,
    components: {
      select: mangoOverrides.components?.select,
      toggleswitch: mangoOverrides.components?.toggleswitch
    }
  }
);
