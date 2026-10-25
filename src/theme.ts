import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";
import type { Preset } from "@primeuix/themes/types";

import { mangoOverrides } from "./theme-overrides";

export const MangoPreset: Preset = definePreset(Aura, mangoOverrides);
