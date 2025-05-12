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
  flexRender,
  TableOptions,
  ColumnDef,
  Row as TanStackRow,
  ColumnSizingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLocale, useTranslations } from "next-intl";
import React, { useState, useCallback, useEffect } from "react";
import type { ZodType, ZodTypeDef } from "zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/ui/table";

// ** import lib
import { cn } from "@/lib/utils";

import CodeInput from "./code-input";
import { CommandSelect } from "./command-select";
import { Input } from "./input";
import RowActionsPopover from "./popovers/row-actions-popover";

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
    showSecondHeader = false,
    secondHeaderTitle = "",
    enableRowSelection = false,
    enableRowActions = false,
    onRowSelectionChange,
    // Footer props
    totalRowValues,
    totalRowLabel = "",
    totalRowTitle,
    footerElement,

    // Additional TanStack config
    enableColumnSizing = false,
    tableOptions = {},

    // Add/Remove Dynamic Row Actions
    rowActions,
    handleAddRowFunction,
    handleRemoveRowFunction,
    id,
  } = props;

  const t = useTranslations();
  const locale = useLocale();

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
    columns,
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

  // rowActions config
  const addPos = rowActions?.add ?? null; // "left" | "right" | null
  const removePos = rowActions?.remove ?? null; // "left" | "right" | null

  const rowActionCellStyle: React.CSSProperties = {
    width: "5px",
    maxWidth: "5px",
    outline: "none",
  };
  const rowActionCellClassName = "p-0 border-none bg-transparent";

  /**
   * Recursively renders a row and its sub-rows, handling:
   * - Row content and cell editing
   * - Hover-activated action icons (Add/Remove)
   * - Sub-row indentation and expansion
   * - Row-level error tracking and validation
   * - Disabled state management
   *
   * @param row - TanStack row instance containing the data and state
   * @param groupKey - Identifier for the row's group, used for validation and disabled state
   * @param level - Nesting depth (0 = top-level), used for sub-row indentation
   * @returns JSX element containing the row and its sub-rows
   */

  const renderRow = (row: TanStackRow<T>, groupKey: string, level = 0) => {
    const rowId = row.id;
    const rowIndex = row.index;
    const rowData = row.original;

    // Determine if this row or its group is disabled
    const disabled = isRowDisabled(disabledRows, groupKey, rowIndex);

    // TanStack expansion logic
    const hasSubRows = row.getCanExpand();
    const isExpanded = row.getIsExpanded();

    // Determine if we show the rowAction icons on hover
    const showRowActions = hoveredRowId === rowId; // only for hovered row

    const stickyColumnId = "checkbox";
    return (
      <React.Fragment key={rowId}>
        <TableRow
          className={cn(
            "relative", // it's will remove border for icons cells
            disabled ? "bg-muted" : "",
            row.getIsSelected() ? "bg-muted/50 dark:bg-muted/50" : "",
          )}
          // On mouse enter/leave, set hovered row
          onMouseEnter={() => setHoveredRowId(rowId)}
          onMouseLeave={() => setHoveredRowId((prev) => (prev === rowId ? null : prev))}
          data-state={row.getIsSelected() && "selected"}
        >
          {/* Selection checkbox */}
          {enableRowSelection && (
            <TableCell className="bg-background sticky start-0 z-2 w-8 !max-w-8 min-w-8 border-y">
              <div className="flex h-auto items-center justify-center">
                <input
                  type="checkbox"
                  checked={row.getIsSelected()}
                  onChange={row.getToggleSelectedHandler()}
                  className="h-4 w-4 rounded-md border-gray-300"
                />
              </div>
              <div className="bg-border absolute end-0 top-0 h-full w-[0.5px]" />
            </TableCell>
          )}
          {/* Row actions */}
          {enableRowActions && (
            <TableCell
              className="bg-background sticky start-8 z-2 border-y p-0"
              style={{ width: "30px", minWidth: "30px", maxWidth: "30px" }}
            >
              <div className="flex h-auto min-h-9 items-center justify-center">
                <RowActionsPopover
                  texts={texts}
                  onEdit={props.canEditAction ? () => onActionClicked?.("edit", rowId) : undefined}
                  onDelete={
                    props.canDeleteAction ? () => onActionClicked?.("delete", rowId) : undefined
                  }
                  onDuplicate={
                    props.canDuplicateAction
                      ? () => onActionClicked?.("duplicate", rowId)
                      : undefined
                  }
                  onView={props.canViewAction ? () => onActionClicked?.("view", rowId) : undefined}
                  onArchive={
                    props.canArchiveAction ? () => onActionClicked?.("archive", rowId) : undefined
                  }
                  onPreview={
                    props.canPreviewAction ? () => onActionClicked?.("preview", rowId) : undefined
                  }
                />
              </div>
              <div className="bg-border absolute end-0 top-0 h-full w-[0.5px]" />
            </TableCell>
          )}

          {/**
           * If the "Add" or "Remove" icons are on the left, we can render an extra <TableCell> for them,
           * or overlay them.
           * We'll do an approach that overlays them. For clarity, let's keep it simple:
           * we'll just overlay or absolutely position them, or place them in the first cell.
           */}
          {row.getVisibleCells().map((cell, cellIndex) => {
            const colDef = cell.column.columnDef as ExtendedColumnDef<T>;
            const colKey = getColumnKey(colDef);
            const isDisabled = disabled || disabledColumns.includes(colKey);
            const errorMsg = cellErrors[groupKey]?.[rowId]?.[colKey] || null;

            // Apply sizing logic & indentation
            const style: React.CSSProperties = {};
            if (enableColumnSizing) {
              const size = cell.column.getSize();
              if (size) style.width = `${size}px`;
              if (colDef.minSize)
                style.minWidth =
                  typeof colDef.minSize === "number" ? `${colDef.minSize}px` : colDef.minSize;
              if (colDef.maxSize)
                style.maxWidth =
                  typeof colDef.maxSize === "number" ? `${colDef.maxSize}px` : colDef.maxSize;
            } else {
              if (!colDef.size && !colDef.minSize && !colDef.maxSize) {
                style.width = "150px";
              }
              if (!colDef.minSize && !style.minWidth) {
                style.minWidth = "120px";
              }
              if (colDef.maxSize) {
                style.maxWidth =
                  typeof colDef.maxSize === "number" ? `${colDef.maxSize}px` : colDef.maxSize;
                if (style.width) {
                  const widthPx = parseInt(style.width.toString());
                  const maxPx = parseInt(style.maxWidth.toString());
                  if (widthPx > maxPx) style.width = style.maxWidth;
                }
              }
            }

            // Render cell content with customizations for the first cell
            const rawCellContent = flexRender(cell.column.columnDef.cell, cell.getContext());

            let cellContent: React.ReactNode = rawCellContent;

            // if cell type is status, show a status element
            if (colDef.cellType === "status" && colDef.options) {
              const cellValue = cell.getValue() as string | number;
              const selectedOption = colDef.options.find((opt) => opt.value === cellValue);

              return (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "relative overflow-hidden border p-0",
                    {
                      "bg-muted": isDisabled,
                      "bg-destructive/25": errorMsg,
                    },
                    typeof colDef.className === "function"
                      ? colDef.className(rowData)
                      : colDef.className,
                  )}
                  style={{ ...style, overflow: "hidden", minWidth: 0 }}
                >
                  <CommandSelect
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    data={colDef.options}
                    inCell
                    isLoading={false}
                    defaultValue={String(selectedOption?.value)}
                    popoverClassName="w-full max-w-full"
                    buttonClassName="bg-transparent p-0 w-full max-w-full"
                    placeholderClassName="w-full p-0"
                    valueKey="value"
                    labelKey="label"
                    onChange={async (value) => {
                      if (onEdit) {
                        onEdit(rowId, colKey as keyof T, value as T[keyof T]);
                      }
                    }}
                    texts={{ placeholder: ". . ." }}
                    renderSelected={(item) => {
                      return (
                        <div
                          className={cn(
                            "flex h-full w-full items-center justify-center bg-green-500 p-0 !px-2 text-center text-xs font-bold",
                            {
                              "text-primary bg-green-200 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-700":
                                item.value === "active",
                              "text-primary bg-red-200 hover:bg-red-200 dark:bg-red-700 dark:hover:bg-red-700":
                                item.value === "inactive",
                            },
                          )}
                        >
                          {item.label}
                        </div>
                      );
                    }}
                    ariaInvalid={false}
                  />
                </TableCell>
              );
            }
            // if cell type is select, show a select element
            if (colDef.cellType === "select" && colDef.options) {
              const cellValue = cell.getValue() as string | number;

              return (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "force-maxwidth-cell relative overflow-hidden border p-0",
                    {
                      "bg-muted": isDisabled,
                      "bg-destructive/25": errorMsg,
                    },
                    typeof colDef.className === "function"
                      ? colDef.className(rowData)
                      : colDef.className,
                  )}
                  style={{ ...style, overflow: "hidden", minWidth: 0 }}
                >
                  <CommandSelect
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    data={colDef.options}
                    inCell
                    isLoading={false}
                    defaultValue={String(cellValue)}
                    popoverClassName="w-full max-w-full"
                    buttonClassName="bg-transparent w-full max-w-full"
                    valueKey="value"
                    labelKey="label"
                    onChange={async (value) => {
                      if (onEdit) {
                        onEdit(rowId, colKey as keyof T, value as T[keyof T]);
                      }
                    }}
                    texts={{
                      placeholder: ". . .",
                    }}
                    renderOption={(item) => {
                      return <div>{item.label}</div>;
                    }}
                    ariaInvalid={false}
                  />
                </TableCell>
              );
            }
            // if cell type is code, show a code input element
            if (colDef.cellType === "code") {
              const cellValue = cell.getValue() as string | undefined;
              return (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "relative overflow-hidden border p-0",
                    {
                      "bg-muted": isDisabled,
                      "bg-destructive/25": errorMsg,
                    },
                    typeof colDef.className === "function"
                      ? colDef.className(rowData)
                      : colDef.className,
                  )}
                  style={{ ...style, overflow: "hidden", minWidth: 0 }}
                >
                  <CodeInput
                    inCell
                    onSerial={() => {
                      if (colDef.onSerial) {
                        colDef.onSerial(rowData, rowIndex);
                      } else if (onEdit) {
                        const next = (parseInt(cellValue || "0", 10) + 1).toString();
                        onEdit(rowId, colKey as keyof T, next as T[keyof T]);
                      }
                    }}
                    onRandom={() => {
                      if (colDef.onRandom) {
                        colDef.onRandom(rowData, rowIndex);
                      } else if (onEdit) {
                        const random = Math.floor(100000 + Math.random() * 900000).toString();
                        onEdit(rowId, colKey as keyof T, random as T[keyof T]);
                      }
                    }}
                  >
                    <Input
                      inCell
                      value={cellValue || ""}
                      disabled={isDisabled}
                      style={{ minHeight: 36 }}
                      onFocus={(e) => handleCellFocus(e, groupKey, rowData, colDef)}
                      onKeyDown={(e) => {
                        if (
                          (e.ctrlKey || e.metaKey) &&
                          ["a", "c", "x", "z", "v"].includes(e.key.toLowerCase())
                        ) {
                          return;
                        }
                        handleKeyDown(e, colDef);
                      }}
                      onPaste={(e) => handlePaste(e, colDef)}
                      onInput={(e) => handleCellInput(e, groupKey, rowData, colDef)}
                      onBlur={(e) => handleCellBlur(e, groupKey, rowData, colDef)}
                      onChange={(e) => {
                        if (onEdit) {
                          onEdit(rowId, colKey as keyof T, e.target.value as T[keyof T]);
                        }
                      }}
                    />
                  </CodeInput>
                </TableCell>
              );
            }

            return (
              <TableCell
                key={rowId + colKey + String(cell.getValue() ?? "")}
                className={cn(
                  "tiny-scrollbar relative overflow-scroll border", // 'relative' for absolute icons if you prefer
                  {
                    "bg-muted": isDisabled,
                    "bg-destructive/25": errorMsg,
                  },
                  colDef.noPadding ? "p-0" : "",
                  typeof colDef.className === "function"
                    ? colDef.className(rowData)
                    : colDef.className,
                )}
                dir={colDef.dir}
                style={style}
                contentEditable={colDef.enableEditing !== false ? !isDisabled : false}
                suppressContentEditableWarning
                onFocus={(e) => {
                  handleCellFocus(e, groupKey, rowData, colDef);
                }}
                onKeyDown={(e) => {
                  if (
                    (e.ctrlKey || e.metaKey) &&
                    // Let user do Ctrl+A, C, X, Z, V, etc.
                    ["a", "c", "x", "z", "v"].includes(e.key.toLowerCase())
                  ) {
                    return; // do not block copy/paste
                  }
                  handleKeyDown(e, colDef);
                }}
                onPaste={(e) => {
                  handlePaste(e, colDef);
                }}
                onInput={(e) => {
                  handleCellInput(e, groupKey, rowData, colDef);
                }}
                onBlur={(e) => {
                  handleCellBlur(e, groupKey, rowData, colDef);
                }}
              >
                {/** The actual content */}
                {cellContent}
              </TableCell>
            );
          })}
        </TableRow>
      </React.Fragment>
    );
  };

  // Memoize renderRow
  const memoizedRenderRow = React.useCallback(
    (row: TanStackRow<T>, groupKey: string, level = 0) => renderRow(row, groupKey, level),
    [renderRow],
  );

  // Calculate total min width for the table
  const totalMinWidth = React.useMemo(() => {
    let minWidth = 0;
    // Checkbox column
    if (enableRowSelection) minWidth += 30;
    // Actions column
    if (enableRowActions) minWidth += 30;
    // Data columns
    columns.forEach((col) => {
      if (col.minSize) {
        minWidth += typeof col.minSize === "number" ? col.minSize : parseInt(col.minSize, 10);
      } else {
        minWidth += 120; // default min width
      }
    });
    return minWidth;
  }, [columns, enableRowSelection, enableRowActions]);

  return (
    <div ref={parentRef} className="relative max-h-[calc(100vh-7.6rem)] overflow-auto p-0 pb-2">
      <Table id={id} style={{ minWidth: totalMinWidth }}>
        {/* <TableCaption>Dynamic, editable data table with grouping & nested sub-rows.</TableCaption> */}
        {/* Primary header */}
        {showHeader && (
          <TableHeader className="relative">
            <TableRow className="border-none">
              {/* Selection checkbox header */}
              {enableRowSelection && (
                <TableHead className="bg-muted sticky start-0 top-0 z-30 w-8 !max-w-8 min-w-8 border-none text-start">
                  <div className="flex h-full items-center justify-center">
                    <input
                      type="checkbox"
                      checked={table.getIsAllPageRowsSelected()}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                      className="h-4 w-4 rounded-md border-gray-300"
                      title={t("General.select_all")}
                    />
                  </div>
                  <div className="bg-border absolute end-0 top-0 h-full w-[0.5px]" />
                </TableHead>
              )}
              {enableRowActions && (
                <TableHead
                  className="bg-muted sticky start-8 top-0 !z-20 border-e border-none text-start"
                  style={{ width: "20px", minWidth: "20px", maxWidth: "20px" }}
                />
              )}

              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => {
                  const style: React.CSSProperties = {};
                  const col = header.column.columnDef;
                  if (enableColumnSizing) {
                    const size = header.getSize();
                    if (size) style.width = `${size}px`;
                    if (col.minSize)
                      style.minWidth =
                        typeof col.minSize === "number" ? `${col.minSize}px` : col.minSize;
                    if (col.maxSize)
                      style.maxWidth =
                        typeof col.maxSize === "number" ? `${col.maxSize}px` : col.maxSize;
                  } else {
                    if (!col.size && !col.minSize && !col.maxSize) {
                      style.width = "150px";
                    }
                    if (!col.minSize && !style.minWidth) {
                      style.minWidth = "120px";
                    }
                    if (col.maxSize) {
                      style.maxWidth =
                        typeof col.maxSize === "number" ? `${col.maxSize}px` : col.maxSize;
                      if (style.width) {
                        const widthPx = parseInt(style.width.toString());
                        const maxPx = parseInt(style.maxWidth.toString());
                        if (widthPx > maxPx) style.width = style.maxWidth;
                      }
                    }
                  }

                  return (
                    <TableHead
                      key={header.id}
                      className="bg-muted sticky top-0 !z-20 border-x text-start"
                      style={style}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext()) as string}
                    </TableHead>
                  );
                }),
              )}
              {/* Action column */}
            </TableRow>
          </TableHeader>
        )}

        <TableBody>
          {/* Top spacer */}
          {rowVirtualizer.getVirtualItems().length > 0 && (
            <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} />
          )}
          {/* Virtualized rows */}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const { row, groupKey, level } = flatRows[virtualRow.index];
            // Render as TableRow, not div
            return React.cloneElement(
              memoizedRenderRow(row, groupKey, level) as React.ReactElement,
              { key: row.id },
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
