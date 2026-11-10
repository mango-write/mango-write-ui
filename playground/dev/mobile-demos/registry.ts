import type { Component } from "vue";
import type { MpPageSlug } from "./state";
import InstallationPreview from "./InstallationPreview.vue";
import NavbarPreview from "./NavbarPreview.vue";
import CellPreview from "./CellPreview.vue";
import ButtonPreview from "./ButtonPreview.vue";
import InputPreview from "./InputPreview.vue";
import FiltersPreview from "./FiltersPreview.vue";
import EmptyPreview from "./EmptyPreview.vue";
import SheetPreview from "./SheetPreview.vue";
import ActionSheetPreview from "./ActionSheetPreview.vue";
import FeedbackPreview from "./FeedbackPreview.vue";
import PatternsPreview from "./PatternsPreview.vue";

export const mobilePreviews: Record<MpPageSlug, Component> = {
  installation: InstallationPreview,
  navbar: NavbarPreview,
  cell: CellPreview,
  button: ButtonPreview,
  input: InputPreview,
  filters: FiltersPreview,
  empty: EmptyPreview,
  sheet: SheetPreview,
  "action-sheet": ActionSheetPreview,
  feedback: FeedbackPreview,
  patterns: PatternsPreview,
};
