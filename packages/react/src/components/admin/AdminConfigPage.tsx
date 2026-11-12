import { forwardRef } from "react";
import { createPortal } from "react-dom";
import { useConfirm } from "../../lib/confirm";
import { useScrollFade } from "../../lib/scroll-fade";
import { useUiLocale } from "../../locale";
import { Button } from "../Button";
import {
  hasSlotContent,
  useAdminPortalTarget,
  type AdminConfigPageProps,
} from "./admin-defs";

export type { AdminConfigPageEmits, AdminConfigPageProps } from "./admin-defs";

export const AdminConfigPage = forwardRef<HTMLDivElement, AdminConfigPageProps>(
  function MwAdminConfigPage(
    {
      title,
      dirtyCount = 0,
      saving = false,
      unsavedLabel,
      saveLabel,
      savingLabel,
      confirmMessage,
      confirmHeader,
      confirmAcceptLabel,
      confirmRejectLabel,
      teleport = true,
      actionsTarget = "#admin-header-actions",
      onSave,
      actions,
      toolbar,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const confirm = useConfirm();
    const { t } = useUiLocale();
    const scrollRef = useScrollFade<HTMLDivElement>();

    function resolveKey(
      candidates: string[],
      params?: Record<string, string | number>,
    ): string {
      for (const key of candidates) {
        const res = t(key, params);
        if (res && res !== key) return res;
      }
      return t(candidates[candidates.length - 1]!, params);
    }

    const resolvedUnsaved =
      unsavedLabel ??
      resolveKey(["platform.admin.shell.unsaved", "common.admin.unsaved"], {
        count: dirtyCount,
      });

    const resolvedSave =
      saveLabel ?? resolveKey(["platform.admin.shell.save", "common.admin.save"]);

    const resolvedSaving =
      savingLabel ??
      resolveKey(["platform.admin.shell.saving", "common.admin.saving"]);

    const resolvedConfirmHeader =
      confirmHeader ??
      resolveKey([
        "platform.admin.shell.confirmSaveHeader",
        "common.admin.confirmSaveHeader",
      ]);

    const resolvedAcceptLabel =
      confirmAcceptLabel ??
      resolveKey(["platform.admin.common.confirm", "common.confirm.accept"]);

    const resolvedRejectLabel =
      confirmRejectLabel ??
      resolveKey(["platform.admin.common.cancel", "common.confirm.reject"]);

    function requestSave() {
      if (!confirmMessage) {
        onSave?.();
        return;
      }
      void confirm.require({
        message: confirmMessage,
        header: resolvedConfirmHeader,
        acceptLabel: resolvedAcceptLabel,
        rejectLabel: resolvedRejectLabel,
        accept: () => onSave?.(),
      });
    }

    const portalTarget = useAdminPortalTarget(actionsTarget, teleport);
    const classes = ["admin-panel", "admin-config-page", className]
      .filter(Boolean)
      .join(" ");

    const actionControls = (
      <>
        {actions}
        {dirtyCount > 0 ? (
          <span className="admin-config-bar__dirty">{resolvedUnsaved}</span>
        ) : null}
        <Button
          label={saving ? resolvedSaving : resolvedSave}
          disabled={dirtyCount === 0 || saving}
          loading={saving}
          onClick={requestSave}
        />
      </>
    );

    return (
      <div {...rest} ref={ref} className={classes}>
        {teleport
          ? portalTarget
            ? createPortal(actionControls, portalTarget)
            : null
          : (
            <header className="mw-admin-shell-header">
              {title ? (
                <h2 className="mw-admin-shell-header__title">{title}</h2>
              ) : null}
              <div className="mw-admin-shell-header__actions">{actionControls}</div>
            </header>
          )}
        {hasSlotContent(toolbar) ? (
          <div className="admin-config-page__toolbar">{toolbar}</div>
        ) : null}
        <div
          ref={scrollRef}
          className="admin-config-page__body admin-panel--scrollable"
        >
          {children}
        </div>
      </div>
    );
  },
);

AdminConfigPage.displayName = "MwAdminConfigPage";

export default AdminConfigPage;
