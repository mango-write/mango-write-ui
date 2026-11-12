import { forwardRef, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Select } from "./Select";
import {
  computePaginatorModel,
  type PaginatorEmits,
  type PaginatorPageEvent,
  type PaginatorProps,
  type PaginatorSlotProps,
} from "./data-table";

export type {
  PaginatorEmits,
  PaginatorPageEvent,
  PaginatorProps,
  PaginatorSlotProps,
} from "./data-table";

export const Paginator = forwardRef<HTMLElement, PaginatorProps>(
  function MwPaginator(
    {
      first: firstProp,
      rows: rowsProp,
      totalRecords = 0,
      rowsPerPageOptions,
      template,
      currentPageReportTemplate,
      alwaysShow = true,
      pageLinkSize = 5,
      disabled = false,
      ariaLabel = "Pagination",
      onFirstChange,
      onRowsChange,
      onPage,
      start,
      end,
      className,
      ...rest
    },
    ref,
  ) {
    const isFirstControlled = firstProp !== undefined;
    const isRowsControlled = rowsProp !== undefined;

    const [uncontrolledFirst, setUncontrolledFirst] = useState<number>(
      Math.max(0, firstProp ?? 0),
    );
    const [uncontrolledRows, setUncontrolledRows] = useState<number>(
      rowsProp && rowsProp > 0 ? rowsProp : 10,
    );

    const activeFirst = isFirstControlled
      ? Math.max(0, firstProp ?? 0)
      : uncontrolledFirst;
    const activeRows = isRowsControlled
      ? rowsProp && rowsProp > 0
        ? rowsProp
        : 10
      : uncontrolledRows;

    const model = useMemo(
      () =>
        computePaginatorModel({
          first: activeFirst,
          rows: activeRows,
          totalRecords,
          alwaysShow,
          pageLinkSize,
          disabled,
          currentPageReportTemplate,
        }),
      [
        activeFirst,
        activeRows,
        totalRecords,
        alwaysShow,
        pageLinkSize,
        disabled,
        currentPageReportTemplate,
      ],
    );

    const templateTokens = useMemo<Set<string> | null>(() => {
      if (!template || !template.trim()) return null;
      return new Set(template.trim().split(/\s+/));
    }, [template]);

    const hasToken = (token: string, defaultVisible = true): boolean => {
      if (!templateTokens) return defaultVisible;
      return templateTokens.has(token);
    };

    const showFirstBtn = hasToken("FirstPageLink", true);
    const showPrevBtn = hasToken("PrevPageLink", true);
    const showPageLinks = hasToken("PageLinks", true);
    const showNextBtn = hasToken("NextPageLink", true);
    const showLastBtn = hasToken("LastPageLink", true);
    const showRowsPerPage =
      Boolean(rowsPerPageOptions && rowsPerPageOptions.length > 0) &&
      hasToken("RowsPerPageDropdown", true);
    const showCurrentPageReport =
      Boolean(currentPageReportTemplate) || hasToken("CurrentPageReport", false);

    if (!model.shouldRender) {
      return null;
    }

    function emitPageChange(nextPage: number, nextRows: number) {
      const nextPageCount = Math.max(
        1,
        Math.ceil(model.effectiveTotal / nextRows),
      );
      const clampedPage = Math.min(Math.max(0, nextPage), nextPageCount - 1);
      const nextFirst = clampedPage * nextRows;
      if (!isFirstControlled) {
        setUncontrolledFirst(nextFirst);
      }
      if (!isRowsControlled) {
        setUncontrolledRows(nextRows);
      }
      const payload: PaginatorPageEvent = {
        page: clampedPage,
        first: nextFirst,
        rows: nextRows,
        pageCount: nextPageCount,
      };
      onFirstChange?.(nextFirst);
      onPage?.(payload);
    }

    function goToPage(targetPage: number) {
      if (disabled) return;
      const clamped = Math.min(Math.max(0, targetPage), model.pageCount - 1);
      if (clamped === model.currentPage) return;
      emitPageChange(clamped, model.effectiveRows);
    }

    function handleRowsValueChange(nextValue: unknown) {
      if (disabled) return;
      const raw = Number(nextValue);
      if (!Number.isFinite(raw) || raw <= 0) return;
      if (raw === model.effectiveRows) return;
      if (!isRowsControlled) {
        setUncontrolledRows(raw);
      }
      if (!isFirstControlled) {
        setUncontrolledFirst(0);
      }
      const nextPageCount = Math.max(1, Math.ceil(model.effectiveTotal / raw));
      onRowsChange?.(raw);
      onFirstChange?.(0);
      onPage?.({
        page: 0,
        first: 0,
        rows: raw,
        pageCount: nextPageCount,
      });
    }

    const slotProps: PaginatorSlotProps = {
      first: model.effectiveFirst,
      rows: model.effectiveRows,
      page: model.currentPage,
      pageCount: model.pageCount,
      totalRecords: model.effectiveTotal,
    };

    const resolvedStart = typeof start === "function" ? start(slotProps) : start;
    const resolvedEnd = typeof end === "function" ? end(slotProps) : end;
    const hasStart =
      resolvedStart !== undefined && resolvedStart !== null && resolvedStart !== false;
    const hasEnd =
      resolvedEnd !== undefined && resolvedEnd !== null && resolvedEnd !== false;

    const classes = ["mw-paginator", className].filter(Boolean).join(" ");

    return (
      <nav
        {...rest}
        ref={ref}
        className={classes}
        aria-label={ariaLabel}
        data-disabled={disabled ? "" : undefined}
      >
        {hasStart ? <div className="mw-paginator__start">{resolvedStart}</div> : null}

        <div className="mw-paginator__content">
          {showFirstBtn ? (
            <button
              type="button"
              className="mw-paginator__btn mw-paginator__first"
              disabled={model.isFirstDisabled}
              data-disabled={model.isFirstDisabled ? "" : undefined}
              aria-label="First Page"
              onClick={() => goToPage(0)}
            >
              <ChevronsLeft className="mw-paginator__icon" aria-hidden="true" />
            </button>
          ) : null}

          {showPrevBtn ? (
            <button
              type="button"
              className="mw-paginator__btn mw-paginator__prev"
              disabled={model.isFirstDisabled}
              data-disabled={model.isFirstDisabled ? "" : undefined}
              aria-label="Previous Page"
              onClick={() => goToPage(model.currentPage - 1)}
            >
              <ChevronLeft className="mw-paginator__icon" aria-hidden="true" />
            </button>
          ) : null}

          {showPageLinks ? (
            <span className="mw-paginator__pages">
              {model.pageLinks.map((pageIdx) => {
                const isActive = pageIdx === model.currentPage;
                const pageBtnClass = [
                  "mw-paginator__btn",
                  "mw-paginator__page",
                  isActive ? "mw-paginator__page--active" : undefined,
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={pageIdx}
                    type="button"
                    className={pageBtnClass}
                    disabled={disabled}
                    data-disabled={disabled ? "" : undefined}
                    data-state={isActive ? "active" : "inactive"}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Page ${pageIdx + 1}`}
                    onClick={() => goToPage(pageIdx)}
                  >
                    {pageIdx + 1}
                  </button>
                );
              })}
            </span>
          ) : null}

          {showNextBtn ? (
            <button
              type="button"
              className="mw-paginator__btn mw-paginator__next"
              disabled={model.isLastDisabled}
              data-disabled={model.isLastDisabled ? "" : undefined}
              aria-label="Next Page"
              onClick={() => goToPage(model.currentPage + 1)}
            >
              <ChevronRight className="mw-paginator__icon" aria-hidden="true" />
            </button>
          ) : null}

          {showLastBtn ? (
            <button
              type="button"
              className="mw-paginator__btn mw-paginator__last"
              disabled={model.isLastDisabled}
              data-disabled={model.isLastDisabled ? "" : undefined}
              aria-label="Last Page"
              onClick={() => goToPage(model.pageCount - 1)}
            >
              <ChevronsRight className="mw-paginator__icon" aria-hidden="true" />
            </button>
          ) : null}

          {showRowsPerPage ? (
            <Select
              className="mw-paginator__rpp"
              value={model.effectiveRows}
              options={rowsPerPageOptions}
              disabled={disabled}
              ariaLabel="Rows per page"
              onValueChange={handleRowsValueChange}
            />
          ) : null}

          {showCurrentPageReport ? (
            <span className="mw-paginator__current" aria-live="polite">
              {model.currentPageReportText}
            </span>
          ) : null}
        </div>

        {hasEnd ? <div className="mw-paginator__end">{resolvedEnd}</div> : null}
      </nav>
    );
  },
);

Paginator.displayName = "MwPaginator";

export default Paginator;
