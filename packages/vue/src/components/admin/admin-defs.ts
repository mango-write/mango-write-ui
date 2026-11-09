import type { InjectionKey, Ref } from "vue";

export const ADMIN_HEADER_LEAD_TAKEN: InjectionKey<Ref<boolean>> = Symbol("adminHeaderLeadTaken");

export type AdminStatTone = "default" | "accent" | "success" | "warning" | "danger";

export interface AdminStatItem {
  key?: string;
  label: string;
  value: string | number;
  sub?: string;
  tone?: AdminStatTone;
}

export interface AdminStatBarProps {
  items: AdminStatItem[];
}

export interface AdminListPageProps {
  title?: string;
  teleport?: boolean;
  actionsTarget?: string;
}

export interface AdminConfigPageProps {
  title?: string;
  dirtyCount?: number;
  saving?: boolean;
  unsavedLabel?: string;
  saveLabel?: string;
  savingLabel?: string;
  confirmMessage?: string;
  confirmHeader?: string;
  confirmAcceptLabel?: string;
  confirmRejectLabel?: string;
  teleport?: boolean;
  actionsTarget?: string;
}

export interface AdminConfigPageEmits {
  save: [];
}

export interface AdminConfigSectionProps {
  title?: string;
}

export type AdminConfigRowStatusTone = "muted" | "warning" | "danger" | "success";

export interface AdminConfigRowProps {
  label: string;
  keyHint?: string;
  hint?: string;
  status?: string;
  statusTone?: AdminConfigRowStatusTone;
}

export interface AdminDetailPageProps {
  backTo?: unknown;
  showBack?: boolean;
  backLabel?: string;
  teleport?: boolean;
  leadTarget?: string;
  actionsTarget?: string;
}

export interface AdminDetailPageEmits {
  back: [];
}

export interface AdminDetailCardProps {
  label: string;
  value?: string | number;
  sub?: string;
  tone?: AdminStatTone;
  actionLabel?: string;
  actionDisabled?: boolean;
}

export interface AdminDetailCardEmits {
  action: [];
}

export interface AdminBoardPageProps {
  title?: string;
  teleport?: boolean;
  actionsTarget?: string;
}

export interface AdminBoardSectionProps {
  title?: string;
}
