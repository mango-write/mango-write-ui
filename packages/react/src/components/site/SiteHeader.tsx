import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useThemePreference } from "../../lib/theme";
import AppLogo from "../AppLogo";

export interface SiteNavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface SiteHeaderMobileActionsProps {
  closeDrawer: () => void;
}

export interface SiteHeaderProps extends HTMLAttributes<HTMLElement> {
  items?: SiteNavItem[];
  homeHref?: string;
  showTheme?: boolean;
  themeLabel?: string;
  showLang?: boolean;
  langLabel?: string;
  langTitle?: string;
  navigationLabel?: string;
  menuLabel?: string;
  brandLabel?: string;
  onToggleLang?: () => void;
  brand?: ReactNode;
  actions?: ReactNode;
  mobileActions?:
    | ReactNode
    | ((props: SiteHeaderMobileActionsProps) => ReactNode);
}

export const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(
  function MwSiteHeader(
    {
      items = [],
      homeHref = "/",
      showTheme = true,
      themeLabel = "Toggle color theme",
      showLang = false,
      langLabel = "",
      langTitle = "Toggle language",
      navigationLabel = "Primary navigation",
      menuLabel = "Menu",
      brandLabel = "MangoWrite",
      onToggleLang,
      brand,
      actions,
      mobileActions,
      className,
      ...rest
    },
    forwardedRef,
  ) {
    const { resolved: themeResolved, setTheme } = useThemePreference();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const headerRef = useRef<HTMLElement | null>(null);
    const burgerRef = useRef<HTMLButtonElement | null>(null);
    const drawerRef = useRef<HTMLDivElement | null>(null);
    const previousOverflowRef = useRef("");
    const menuOpenRef = useRef(false);

    const setHeaderNode = useCallback(
      (node: HTMLElement | null) => {
        headerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    const remeasureDrawerMax = useCallback(() => {
      const headerEl = headerRef.current;
      const chrome = headerEl?.querySelector(".mw-site-header__inner");
      if (headerEl && chrome && menuOpenRef.current) {
        headerEl.style.setProperty(
          "--mw-site-header-chrome",
          `${chrome.getBoundingClientRect().height}px`,
        );
      }
    }, []);

    const drawerFocusables = useCallback((): HTMLElement[] => {
      return Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    }, []);

    const closeDrawer = useCallback(() => {
      if (!menuOpenRef.current) return;
      menuOpenRef.current = false;
      setMenuOpen(false);
      if (typeof document !== "undefined") {
        document.body.style.overflow = previousOverflowRef.current;
      }
      burgerRef.current?.focus();
    }, []);

    const toggleDrawer = useCallback(() => {
      if (menuOpenRef.current) {
        closeDrawer();
        return;
      }
      if (typeof document !== "undefined") {
        previousOverflowRef.current = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }
      menuOpenRef.current = true;
      setMenuOpen(true);
    }, [closeDrawer]);

    useLayoutEffect(() => {
      if (!menuOpen) return;
      remeasureDrawerMax();
      (drawerFocusables()[0] ?? drawerRef.current)?.focus();
    }, [menuOpen, remeasureDrawerMax, drawerFocusables]);

    useEffect(() => {
      if (typeof document === "undefined" || typeof window === "undefined") {
        return;
      }

      const onScroll = (e: Event) => {
        const el = e.target as HTMLElement | Document;
        const top =
          el === document ? window.scrollY : (el as HTMLElement).scrollTop;
        if (top > 20) setScrolled(true);
        else if (window.scrollY <= 20) setScrolled(false);
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (!menuOpenRef.current) return;
        if (e.key === "Escape") {
          closeDrawer();
          return;
        }
        if (e.key !== "Tab") return;
        const focusables = drawerFocusables();
        const first = focusables[0];
        const last = focusables.at(-1);
        if (!first || !last) return;
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === drawerRef.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === drawerRef.current)
        ) {
          e.preventDefault();
          first.focus();
        }
      };

      document.addEventListener("scroll", onScroll, true);
      document.addEventListener("keydown", onKeyDown);
      window.addEventListener("resize", remeasureDrawerMax);

      return () => {
        document.removeEventListener("scroll", onScroll, true);
        document.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", remeasureDrawerMax);
        if (menuOpenRef.current) {
          document.body.style.overflow = previousOverflowRef.current;
        }
      };
    }, [closeDrawer, drawerFocusables, remeasureDrawerMax]);

    const handleToggleTheme = (event: ReactMouseEvent<HTMLButtonElement>) => {
      setTheme(themeResolved === "dark" ? "light" : "dark", event.nativeEvent);
    };

    const classes = [
      "mw-site-header",
      "mw-frost",
      scrolled ? "scrolled" : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <header ref={setHeaderNode} {...rest} className={classes}>
        <div className="mw-site-header__inner">
          <a
            href={homeHref}
            className="mw-site-header__brand"
            aria-label={brandLabel}
          >
            {brand !== undefined ? brand : <AppLogo />}
          </a>

          <div className="mw-site-header__desktop">
            {items.length > 0 ? (
              <nav className="mw-site-header__nav" aria-label={navigationLabel}>
                {items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={[
                      "mw-site-header__link",
                      item.active ? "active" : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-current={item.active ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            ) : null}

            {showLang ? (
              <button
                type="button"
                className="mw-site-header__icon-btn mw-site-header__lang"
                aria-label={langTitle}
                title={langTitle}
                onClick={() => onToggleLang?.()}
              >
                {langLabel}
              </button>
            ) : null}

            {showTheme ? (
              <button
                type="button"
                className="mw-site-header__icon-btn mw-site-header__theme-btn"
                data-theme-state={themeResolved}
                aria-label={themeLabel}
                title={themeLabel}
                onClick={handleToggleTheme}
              >
                <span className="mw-site-header__theme-stage" aria-hidden="true">
                  <Sun className="mw-site-header__theme-icon mw-site-header__theme-icon--sun" />
                  <Moon className="mw-site-header__theme-icon mw-site-header__theme-icon--moon" />
                </span>
              </button>
            ) : null}

            {actions}
          </div>

          <button
            ref={burgerRef}
            type="button"
            className="mw-site-header__burger"
            aria-expanded={menuOpen}
            aria-controls="mw-site-header-drawer"
            aria-label={menuLabel}
            onClick={toggleDrawer}
          >
            {!menuOpen ? <Menu aria-hidden="true" /> : <X aria-hidden="true" />}
          </button>
        </div>

        {menuOpen ? (
          <div
            id="mw-site-header-drawer"
            ref={drawerRef}
            className="mw-site-header__drawer"
            role="dialog"
            aria-modal="true"
            aria-label={menuLabel}
            tabIndex={-1}
          >
            {items.length > 0 ? (
              <nav
                className="mw-site-header__drawer-nav"
                aria-label={navigationLabel}
              >
                {items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={[
                      "mw-site-header__drawer-link",
                      item.active ? "active" : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-current={item.active ? "page" : undefined}
                    onClick={closeDrawer}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            ) : null}
            <div className="mw-site-header__drawer-row">
              {showLang ? (
                <button
                  type="button"
                  className="mw-site-header__drawer-theme mw-site-header__lang"
                  aria-label={langTitle}
                  onClick={() => {
                    onToggleLang?.();
                    closeDrawer();
                  }}
                >
                  {langLabel}
                </button>
              ) : null}
              {showTheme ? (
                <button
                  type="button"
                  className="mw-site-header__drawer-theme mw-site-header__theme-btn"
                  data-theme-state={themeResolved}
                  aria-label={themeLabel}
                  onClick={handleToggleTheme}
                >
                  <span
                    className="mw-site-header__theme-stage"
                    aria-hidden="true"
                  >
                    <Sun className="mw-site-header__theme-icon mw-site-header__theme-icon--sun" />
                    <Moon className="mw-site-header__theme-icon mw-site-header__theme-icon--moon" />
                  </span>
                </button>
              ) : null}
              {typeof mobileActions === "function"
                ? mobileActions({ closeDrawer })
                : mobileActions}
            </div>
          </div>
        ) : null}

        {menuOpen && typeof document !== "undefined"
          ? createPortal(
              <div
                className="mw-site-header__scrim"
                onClick={closeDrawer}
              />,
              document.body,
            )
          : null}
      </header>
    );
  },
);

SiteHeader.displayName = "MwSiteHeader";

export default SiteHeader;
