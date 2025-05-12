"use client";

/**
 * sheet-table/index.tsx
 *
 * A reusable table component with editable cells, row/column disabling,
 * custom data support, and Zod validation. Supports:
 *  - Grouping rows by a `headerKey`
 *  - A configurable footer (totals row + custom element)
 *  - TanStack Table column sizing (size, minSize, maxSize)
 *  - Forwarding other TanStack Table configuration via tableOptions
 *  - Sub-rows (nested rows) with expand/collapse
 * - Hover-based Add/Remove row actions
 * - Custom styling for cells and columns
 * - Real-time validation with Zod schemas
 * - Keyboard shortcuts (Ctrl+Z, Ctrl+V, etc.)
 */
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  TableOptions,
  ColumnDef,
  Row as TanStackRow,
  ColumnSizingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLocale, useTranslations } from "next-intl";
import React, { useState, useCallback, useEffect } from "react";
import type { ZodType, ZodTypeDef } from "zod";

import { Table, TableBody } from "@/ui/table";

import SheetTableHeader from "@/components/tables/sheet-table-header";
import SheetTableRow from "@/components/tables/sheet-table-row";

export type ExtendedColumnDef<TData extends object, TValue = unknown> = Omit<
  ColumnDef<TData, TValue>,
  "id" | "accessorKey"
> & {
  id?: string;
  accessorKey?: string;
  cellType?: "text" | "select" | "status" | "code";
  options?: Array<{ label: string; value: string | number | boolean }>;
  validationSchema?: ZodType<any, ZodTypeDef, any>;
  className?: string | ((row: TData) => string); // Allows static or dynamic class names
  style?: React.CSSProperties; // style for inline styles
  enableEditing?: boolean;
  noPadding?: boolean;
  dir?: "ltr" | "rtl";
  // For code cellType only:
  onSerial?: (row: TData, rowIndex: number) => void;
  onRandom?: (row: TData, rowIndex: number) => void;
};

/**
 * Extended props for footer functionality.
 */
interface FooterProps {
  /**
   * totalRowValues:
   *  - Object mapping column ID/accessorKey => any
   *  - If provided, we render a special totals row at the bottom of the table.
   */
  totalRowValues?: Record<string, any>;

  /**
   * totalRowLabel:
   *  - A string label used to fill empty cells in the totals row.
   *  - Defaults to "" if omitted.
   */
  totalRowLabel?: string;

  /**
   * totalRowTitle:
   *  - A string displayed on a separate row above the totals row.
   *  - Shown only if totalRowValues is provided as well.
   */
  totalRowTitle?: string;

  /**
   * footerElement:
   *  - A React node rendered below the totals row.
   *  - If omitted, no extra footer node is rendered.
   */
  footerElement?: React.ReactNode;
}

/**
 * Props for the SheetTable component.
 * Includes footer props and additional TanStack table configurations.
 */
export interface SheetTableProps<T extends object> extends FooterProps {
  id?: string;
  /**
   * Column definitions for the table.
   */
  columns: ExtendedColumnDef<T>[];

  /**
   * Data to be displayed in the table.
   */
  data: T[];

  /**
   * Callback for handling cell edits.
   */
  onEdit?: <K extends keyof T>(rowIndex: string, columnId: K, value: T[K]) => void;

  /**
   * Callback for when a cell is focused.
   */
  onCellFocus?: (rowId: string) => void;

  /**
   * Whether row selection is enabled.
   */
  enableRowSelection?: boolean;

  /**
   * Whether row actions are enabled.
   */
  enableRowActions?: boolean;

  /**
   * Callback for when row selection changes.
   */
  onRowSelectionChange?: (selectedRows: T[]) => void;

  /**
   * Columns that are disabled for editing.
   */
  disabledColumns?: string[];

  /**
   * Rows that are disabled for editing.
   * Can be an array of row indices or a record mapping column IDs to row indices.
   */
  disabledRows?: number[] | Record<string, number[]>;

  /**
   * Whether to show the table header.
   */
  showHeader?: boolean;

  /**
   * Whether to show a secondary header below the main header.
   */
  showSecondHeader?: boolean;

  /**
   * Title for the secondary header, if enabled.
   */
  secondHeaderTitle?: string;

  /**
   * If true, column sizing is enabled. Sizes are tracked in local state.
   */
  enableColumnSizing?: boolean;

  /**
   * Additional table options to be passed directly to `useReactTable`.
   * Examples: initialState, columnResizeMode, etc.
   */
  tableOptions?: Partial<TableOptions<T>>;

  /**
   * Configuration for Add/Remove row icons:
   * { add?: "left" | "right"; remove?: "left" | "right"; }
   * Example: { add: "left", remove: "right" }
   */
  rowActions?: {
    add?: "left" | "right";
    remove?: "left" | "right";
  };

  /**
   * Optional function to handle adding a sub-row to a given row (by rowId).
   */
  handleAddRowFunction?: (parentRowId: string) => void;

  /**
   * Optional function to handle removing a given row (by rowId),
   * including all of its sub-rows.
   */
  handleRemoveRowFunction?: (rowId: string) => void;

  /**
   * Texts for the table.
   */
  texts?: {
    actions?: string;
    edit?: string;
    duplicate?: string;
    view?: string;
    archive?: string;
    delete?: string;
    preview?: string;
  };

  onActionClicked?: (action: string, rowId: string) => void;
  canEditAction?: boolean;
  canDuplicateAction?: boolean;
  canViewAction?: boolean;
  canArchiveAction?: boolean;
  canDeleteAction?: boolean;
  canPreviewAction?: boolean;
  // --- Column visibility ---
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (updater: any) => void;
}

/**
 * Returns a stable string key for each column (id > accessorKey > "").
 */
export function getColumnKey<T extends object>(colDef: ExtendedColumnDef<T>): string {
  return colDef.id ?? colDef.accessorKey ?? "";
}

/**
 * Parse & validate helper:
 * - If colDef is numeric and empty => undefined (if optional)
 * - If colDef is numeric and invalid => produce error
 */
export function parseAndValidate<T extends object>(
  rawValue: string,
  colDef: ExtendedColumnDef<T>,
): { parsedValue: unknown; errorMessage: string | null } {
  const schema = colDef.validationSchema;
  if (!schema) {
    // No validation => no error
    return { parsedValue: rawValue, errorMessage: null };
  }

  let parsedValue: unknown = rawValue;
  let errorMessage: string | null = null;

  const schemaType = (schema as any)?._def?.typeName;
  if (schemaType === "ZodNumber") {
    // If empty => undefined (if optional this is okay, otherwise error)
    if (rawValue.trim() === "") {
      parsedValue = undefined;
    } else {
      // Try parse to float
      const maybeNum = parseFloat(rawValue);
      // If the user typed something that parseFloat sees as NaN, it's an error
      parsedValue = Number.isNaN(maybeNum) ? rawValue : maybeNum;
    }
  }

  const result = schema.safeParse(parsedValue);
  if (!result.success) {
    errorMessage = result.error.issues[0].message;
  }

  return { parsedValue, errorMessage };
}

/**
 * BLOCK non-numeric characters in numeric columns, including paste.
 * (We keep these separate so they're easy to import and use in the main component.)
 */

export function handleKeyDown<T extends object>(
  e: React.KeyboardEvent<HTMLTableCellElement | HTMLDivElement>,
  colDef: ExtendedColumnDef<T>,
) {
  if (!colDef.validationSchema) return;

  const schemaType = (colDef.validationSchema as any)?._def?.typeName;
  if (schemaType === "ZodNumber") {
    // Allowed keys for numeric input:
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
      ".",
      "-",
    ];
    const isDigit = /^[0-9]$/.test(e.key);

    if (!allowedKeys.includes(e.key) && !isDigit) {
      e.preventDefault();
    }
  }
}

export function handlePaste<T extends object>(
  e: React.ClipboardEvent<HTMLTableCellElement | HTMLDivElement>,
  colDef: ExtendedColumnDef<T>,
) {
  if (!colDef.validationSchema) return;
  const schemaType = (colDef.validationSchema as any)?._def?.typeName;
  if (schemaType === "ZodNumber") {
    const text = e.clipboardData.getData("text");
    // If the pasted text is not a valid float, block it.
    if (!/^-?\d*\.?\d*$/.test(text)) {
      e.preventDefault();
    }
  }
}

/**
 * Helper function to determine if a row is disabled based on the provided
 * disabledRows prop. This prop can be either a simple array of row indices
 * or a record keyed by groupKey mapped to arrays of row indices.
 */
export function isRowDisabled(
  rows: number[] | Record<string, number[]> | undefined,
  groupKey: string,
  rowIndex: number,
): boolean {
  if (!rows) return false;
  if (Array.isArray(rows)) {
    return rows.includes(rowIndex);
  }
  return rows[groupKey]?.includes(rowIndex) ?? false;
}

/**
 * The main SheetTable component, now with optional column sizing support,
 * sub-row expansions, and hover-based Add/Remove row actions.
 */
function SheetTable<
  T extends {
    // Common properties for each row
    id?: string; // Each row should have a unique string/number ID
    headerKey?: string;
    subRows?: T[];
  },
>(props: SheetTableProps<T>) {
  const {
    texts,
    onActionClicked,
    columns,
    data: initialData,
    onEdit,
    disabledColumns = [],
    disabledRows = [],
    showHeader = true,
    enableRowSelection = false,
    enableRowActions = false,
    onRowSelectionChange,
    enableColumnSizing = false,
    tableOptions = {},
    rowActions,
    id,
    columnVisibility,
    onColumnVisibilityChange,
  } = props;

  /**
   * Ensure a minimum of 30 rows are displayed, padding with empty rows if needed.
   */
  const MIN_ROWS = 0;
  const data = React.useMemo(() => {
    if (initialData.length < MIN_ROWS) {
      const emptyRowsNeeded = MIN_ROWS - initialData.length;
      const emptyRowObjects = Array.from({ length: emptyRowsNeeded }, (_, i) => {
        // Provide a unique ID for placeholder rows, conform to T's id constraint
        return { id: `empty-row-${i}-${Math.random().toString(36).substring(7)}` } as T;
      });
      return [...initialData, ...emptyRowObjects];
    }
    return initialData;
  }, [initialData]);

  /**
   * If column sizing is enabled, we track sizes in state.
   * This allows the user to define 'size', 'minSize', 'maxSize' in the column definitions.
   */
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  /**
   * Expanded state for sub-rows. Keyed by row.id in TanStack Table.
   */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  /**
   * Track errors/original content keyed by (groupKey, rowId) for editing.
   */
  const [cellErrors, setCellErrors] = useState<
    Record<string, Record<string, Record<string, string | null>>>
  >({});
  const [cellOriginalContent, setCellOriginalContent] = useState<
    Record<string, Record<string, Record<string, string>>>
  >({});

  /**
   * Track the currently hovered row ID (or null if none).
   */
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  /**
   * Build the final table options. Merge user-provided tableOptions with ours.
   */
  const mergedOptions: TableOptions<T> = {
    data,
    columns: React.useMemo(() => {
      if (!columnVisibility) return columns;
      return columns.filter((col) => {
        const key = col.id || col.accessorKey || "";
        return columnVisibility[key] !== false;
      });
    }, [columns, columnVisibility]),
    getRowId: (row) => row.id ?? String(Math.random()), // fallback if row.id is missing
    getCoreRowModel: getCoreRowModel(),
    // Provide subRows if you have them:
    getSubRows: (row) => row.subRows ?? undefined,
    // Add expansions
    getExpandedRowModel: getExpandedRowModel(),
    enableExpanding: true,
    // Add row selection
    enableRowSelection: true,
    enableMultiRowSelection: true,
    // External expanded state
    state: {
      // If user also provided tableOptions.state, merge them
      ...(tableOptions.state ?? {}),
      expanded,
      ...(enableColumnSizing
        ? {
            columnSizing,
          }
        : {}),
      ...(columnVisibility ? { columnVisibility } : {}),
    },
    onExpandedChange: setExpanded, // keep expansions in local state

    // If sizing is enabled, pass sizing states:
    ...(enableColumnSizing
      ? {
          onColumnSizingChange: setColumnSizing,
          columnResizeMode: tableOptions.columnResizeMode ?? "onChange",
        }
      : {}),

    // Spread any other user-provided table options
    ...(onColumnVisibilityChange ? { onColumnVisibilityChange } : {}),
    ...tableOptions,
  } as TableOptions<T>;

  /**
   * Initialize the table using TanStack Table.
   */
  const table = useReactTable<T>(mergedOptions);

  // Update parent component when row selection changes
  useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getSelectedRowModel().flatRows.map((row) => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [table.getState().rowSelection, onRowSelectionChange, table]);

  /**
   * Find a TanStack row by matching rowData.id.
   */
  const findTableRow = useCallback(
    (rowData: T): TanStackRow<T> | undefined => {
      if (!rowData.id) return undefined;
      // NOTE: Because we have expansions, rowData might be in subRows.
      // We can do a quick flatten search across all rows. We use table.getRowModel().flatRows
      return table.getRowModel().flatRows.find((r) => r.original.id === rowData.id);
    },
    [table],
  );

  /**
   * Store a cell's original value on focus, for detecting changes on blur.
   */
  const handleCellFocus = useCallback(
    (
      e: React.FocusEvent<HTMLTableCellElement | HTMLDivElement>,
      groupKey: string,
      rowData: T,
      colDef: ExtendedColumnDef<T>,
    ) => {
      const tanStackRow = findTableRow(rowData);
      if (!tanStackRow) return;

      const rowId = tanStackRow.id;
      const colKey = getColumnKey(colDef);
      const initialText = e.currentTarget.textContent ?? "";

      setCellOriginalContent((prev) => {
        const groupContent = prev[groupKey] || {};
        const rowContent = {
          ...(groupContent[rowId] || {}),
          [colKey]: initialText,
        };
        return {
          ...prev,
          [groupKey]: { ...groupContent, [rowId]: rowContent },
        };
      });
    },
    [findTableRow],
  );

  /**
   * Real-time validation on each keystroke (but no onEdit call here).
   */
  const handleCellInput = useCallback(
    (
      e: React.FormEvent<HTMLTableCellElement | HTMLDivElement>,
      groupKey: string,
      rowData: T,
      colDef: ExtendedColumnDef<T>,
    ) => {
      const tanStackRow = findTableRow(rowData);
      if (!tanStackRow) return;

      const rowId = tanStackRow.id;
      const rowIndex = tanStackRow.index;
      const colKey = getColumnKey(colDef);

      if (isRowDisabled(disabledRows, groupKey, rowIndex) || disabledColumns.includes(colKey)) {
        return;
      }

      const rawValue = e.currentTarget.textContent ?? "";
      const { errorMessage } = parseAndValidate(rawValue, colDef);

      setCellErrors((prev) => {
        const groupErrors = prev[groupKey] || {};
        const rowErrors = {
          ...(groupErrors[rowId] || {}),
          [colKey]: errorMessage,
        };
        return { ...prev, [groupKey]: { ...groupErrors, [rowId]: rowErrors } };
      });
    },
    [disabledColumns, disabledRows, findTableRow],
  );

  /**
   * OnBlur: if content changed from the original, parse/validate. If valid => onEdit(rowId, colKey, parsedValue).
   */
  const handleCellBlur = useCallback(
    (
      e: React.FocusEvent<HTMLTableCellElement | HTMLDivElement>,
      groupKey: string,
      rowData: T,
      colDef: ExtendedColumnDef<T>,
    ) => {
      const tanStackRow = findTableRow(rowData);
      if (!tanStackRow) return;

      const rowId = tanStackRow.id;
      const rowIndex = tanStackRow.index;
      const colKey = getColumnKey(colDef);

      if (isRowDisabled(disabledRows, groupKey, rowIndex) || disabledColumns.includes(colKey)) {
        return;
      }

      const rawValue = e.currentTarget.textContent ?? "";
      const originalValue = cellOriginalContent[groupKey]?.[rowId]?.[colKey] ?? "";

      if (rawValue === originalValue) {
        return; // No change
      }

      const { parsedValue, errorMessage } = parseAndValidate(rawValue, colDef);

      setCellErrors((prev) => {
        const groupErrors = prev[groupKey] || {};
        const rowErrors = {
          ...(groupErrors[rowId] || {}),
          [colKey]: errorMessage,
        };
        return { ...prev, [groupKey]: { ...groupErrors, [rowId]: rowErrors } };
      });
      if (errorMessage) {
        console.error(`Row "${rowId}", Col "${colKey}" error: ${errorMessage}`);
      } else if (onEdit) {
        // Instead of rowIndex, we pass the row's unique ID from TanStack
        onEdit(rowId, colKey as keyof T, parsedValue as T[keyof T]);
      }
    },
    [disabledColumns, disabledRows, findTableRow, cellOriginalContent, onEdit],
  );

  /**
   * Group data by `headerKey` (top-level only).
   * Sub-rows are handled by TanStack expansions.
   */
  const groupedData = React.useMemo(() => {
    const out: Record<string, T[]> = {};
    data.forEach((row) => {
      const key = row.headerKey || "ungrouped";
      if (!out[key]) out[key] = [];
      out[key].push(row);
    });
    return out;
  }, [data]);

  // Flatten all rows for virtualization (no sub-rows)
  const flatRows = React.useMemo(() => {
    const result: { row: TanStackRow<T>; groupKey: string; level: number }[] = [];
    Object.entries(groupedData).forEach(([groupKey, topRows]) => {
      topRows.forEach((rowData) => {
        const row = table.getRowModel().flatRows.find((r) => r.original === rowData);
        if (row) {
          result.push({ row, groupKey, level: 0 });
        }
      });
    });
    return result;
  }, [groupedData, table]);

  // Virtualizer setup
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Adjust to your row height
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="relative max-h-[calc(100vh-7.6rem)] overflow-auto p-0 pb-2">
      <Table id={id} style={{ minWidth: 1200 }}>
        <SheetTableHeader
          table={table}
          enableRowSelection={enableRowSelection}
          enableRowActions={enableRowActions}
          showHeader={showHeader}
          texts={texts}
          canEditAction={props.canEditAction}
          canDeleteAction={props.canDeleteAction}
          canDuplicateAction={props.canDuplicateAction}
          canViewAction={props.canViewAction}
          canArchiveAction={props.canArchiveAction}
          canPreviewAction={props.canPreviewAction}
          enableColumnSizing={enableColumnSizing}
        />

        <TableBody>
          {/* Top spacer */}
          {rowVirtualizer.getVirtualItems().length > 0 && (
            <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} />
          )}
          {/* Virtualized rows */}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const { row, groupKey, level } = flatRows[virtualRow.index];
            return (
              <SheetTableRow
                key={row.id}
                row={row}
                groupKey={groupKey}
                level={level}
                hoveredRowId={hoveredRowId}
                setHoveredRowId={setHoveredRowId}
                enableRowSelection={enableRowSelection}
                enableRowActions={enableRowActions}
                rowActions={rowActions}
                cellErrors={cellErrors}
                disabledColumns={disabledColumns}
                disabledRows={disabledRows}
                onActionClicked={onActionClicked}
                onEdit={onEdit}
                handleCellFocus={handleCellFocus}
                handleKeyDown={handleKeyDown}
                handlePaste={handlePaste}
                handleCellInput={handleCellInput}
                handleCellBlur={handleCellBlur}
                texts={texts}
                canEditAction={props.canEditAction}
                canDuplicateAction={props.canDuplicateAction}
                canViewAction={props.canViewAction}
                canArchiveAction={props.canArchiveAction}
                canDeleteAction={props.canDeleteAction}
                canPreviewAction={props.canPreviewAction}
              />
            );
          })}
          {/* Bottom spacer */}
          {rowVirtualizer.getVirtualItems().length > 0 && (
            <tr
              style={{
                height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0)}px`,
              }}
            />
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default SheetTable;
