import {
  createContext,
  useEffect,
  useLayoutEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export type AdminHeaderLeadTakenHolder =
  | ((taken: boolean) => void)
  | {
      current?: boolean;
      value?: boolean;
      setTaken?: (taken: boolean) => void;
    }
  | null;

export const ADMIN_HEADER_LEAD_TAKEN =
  createContext<AdminHeaderLeadTakenHolder>(null);

export type AdminStatTone = "default" | "accent" | "success" | "warning" | "danger";
export type StatTone = AdminStatTone;

export interface AdminStatItem {
  key?: string;
  label: string;
  value: string | number;
  sub?: string;
  tone?: AdminStatTone;
}
export type StatItem = AdminStatItem;

export interface AdminStatBarProps extends HTMLAttributes<HTMLDivElement> {
  items: AdminStatItem[];
}
export type StatBarProps = AdminStatBarProps;

export interface AdminListPageProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: string;
  teleport?: boolean;
  actionsTarget?: string;
  actions?: ReactNode;
  summary?: ReactNode;
  filters?: ReactNode;
  pagination?: ReactNode;
  children?: ReactNode;
}

export interface AdminConfigPageProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
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
  onSave?: () => void;
  actions?: ReactNode;
  toolbar?: ReactNode;
  children?: ReactNode;
}

export interface AdminConfigPageEmits {
  onSave?: () => void;
}

export interface AdminConfigSectionProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  children?: ReactNode;
}
export type ConfigSectionProps = AdminConfigSectionProps;

export type AdminConfigRowStatusTone = "muted" | "warning" | "danger" | "success";
export type ConfigRowStatusTone = AdminConfigRowStatusTone;

export interface AdminConfigRowProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  keyHint?: string;
  hint?: ReactNode;
  status?: ReactNode;
  statusTone?: AdminConfigRowStatusTone;
  children?: ReactNode;
}
export type ConfigRowProps = AdminConfigRowProps;

export interface AdminDetailPageProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  backTo?: unknown;
  showBack?: boolean;
  backLabel?: string;
  teleport?: boolean;
  leadTarget?: string;
  actionsTarget?: string;
  onBack?: () => void;
  title?: ReactNode;
  actions?: ReactNode;
  cards?: ReactNode;
  tabs?: ReactNode;
  children?: ReactNode;
}

export interface AdminDetailPageEmits {
  onBack?: () => void;
}

export interface AdminDetailCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value?: ReactNode;
  sub?: ReactNode;
  tone?: AdminStatTone;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
  head?: ReactNode;
  children?: ReactNode;
}
export type StatCardProps = AdminDetailCardProps;

export interface AdminDetailCardEmits {
  onAction?: () => void;
}
export type StatCardEmits = AdminDetailCardEmits;

export interface AdminBoardPageProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: string;
  teleport?: boolean;
  actionsTarget?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  stats?: ReactNode;
  children?: ReactNode;
}

export interface AdminBoardSectionProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  drill?: ReactNode;
  children?: ReactNode;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function hasSlotContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

export function useAdminPortalTarget(
  selector: string | undefined,
  enabled: boolean,
): Element | null {
  const [deferredTarget, setDeferredTarget] = useState<Element | null>(null);

  const immediateTarget =
    enabled && selector && typeof document !== "undefined"
      ? document.querySelector(selector)
      : null;

  useIsomorphicLayoutEffect(() => {
    if (!enabled || !selector || typeof document === "undefined") {
      setDeferredTarget(null);
      return;
    }
    const found = document.querySelector(selector);
    setDeferredTarget((prev) => (prev === found ? prev : found));
  }, [enabled, selector]);

  if (!enabled || !selector) return null;
  return immediateTarget ?? deferredTarget;
}
