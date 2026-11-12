import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
}

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  function MwPageHeader({ title, icon, actions, className, ...rest }, ref) {
    const classes = ["mw-page-header", className].filter(Boolean).join(" ");
    const hasIcon = icon !== undefined && icon !== null && icon !== false;
    const hasActions = actions !== undefined && actions !== null && actions !== false;

    return (
      <header {...rest} ref={ref} className={classes}>
        {hasIcon && <span className="mw-page-header__icon">{icon}</span>}
        <h1 className="mw-page-header__title">{title}</h1>
        {hasActions && <div className="mw-page-header__actions">{actions}</div>}
      </header>
    );
  },
);

PageHeader.displayName = "MwPageHeader";

export default PageHeader;
