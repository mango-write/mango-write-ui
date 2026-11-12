import { forwardRef, type HTMLAttributes } from "react";
import AppLogo from "./AppLogo";

export interface NotFoundPageProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: string;
  lead: string;
  tagline?: string;
  path?: string;
  pathLabel?: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export const NotFoundPage = forwardRef<HTMLElement, NotFoundPageProps>(
  function MwNotFoundPage(
    {
      title,
      lead,
      tagline,
      path,
      pathLabel,
      primaryLabel,
      secondaryLabel,
      onPrimary,
      onSecondary,
      className,
      ...rest
    },
    ref,
  ) {
    const classes = ["mw-nf", className].filter(Boolean).join(" ");

    return (
      <section ref={ref} {...rest} className={classes}>
        <div className="mw-nf__blob mw-nf__blob--a" aria-hidden="true" />
        <div className="mw-nf__blob mw-nf__blob--b" aria-hidden="true" />

        <div className="mw-nf__card mw-frost mw-frost--thick">
          <header className="mw-nf__brand">
            <AppLogo className="mw-nf__logo" />
            {tagline ? <p className="mw-nf__tagline">{tagline}</p> : null}
          </header>

          <p className="mw-nf__code" aria-hidden="true">
            4<span className="mw-nf__code-zero">0</span>4
          </p>
          <h1 className="mw-nf__title">{title}</h1>
          <p className="mw-nf__lead">{lead}</p>

          {path ? (
            <div className="mw-nf__path mw-inlay">
              {pathLabel ? (
                <span className="mw-nf__path-label">{pathLabel}</span>
              ) : null}
              <code className="mw-nf__path-value">{path}</code>
            </div>
          ) : null}

          <div className="mw-nf__actions">
            <button
              type="button"
              className="mw-btn-site"
              onClick={() => onPrimary?.()}
            >
              {primaryLabel}
            </button>
            {secondaryLabel ? (
              <button
                type="button"
                className="mw-nf__btn--text"
                onClick={() => onSecondary?.()}
              >
                {secondaryLabel}
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  },
);

NotFoundPage.displayName = "MwNotFoundPage";

export default NotFoundPage;
