import type { ReactElement } from "react";
import type { ColumnBodyScope, ColumnHeaderScope, ColumnProps } from "./data-table";

export type { ColumnBodyScope, ColumnHeaderScope, ColumnProps } from "./data-table";

export type ColumnComponent = (<T = any>(
  props: ColumnProps<T>,
) => ReactElement | null) & {
  displayName?: string;
  __mwColumn?: boolean;
};

function MwColumn<T = any>(_props: ColumnProps<T>): ReactElement | null {
  return null;
}

MwColumn.displayName = "MwColumn";
(MwColumn as ColumnComponent).__mwColumn = true;

export const Column: ColumnComponent = MwColumn;

export default Column;
