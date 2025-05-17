import React from "react";

import RowActionsPopover from "@/ui/popovers/row-actions-popover";
import { TableRow, TableCell } from "@/ui/table";

import SheetTableCell from "@/components/tables/sheet-table-cell";

import { cn } from "@/lib/utils";

/**
 * SheetTableRow
 *
 * Abstract, extensible row renderer for SheetTable.
 * Handles row actions, selection, expansion, sub-rows, and cell rendering.
 *
 * Props:
 * - row: TanStack row object
 * - groupKey: string (for grouping/validation)
 * - level: nesting depth (for sub-rows)
 * - hoveredRowId, setHoveredRowId: for hover state
 * - enableRowSelection, enableRowActions, rowActions, etc.
 * - cellErrors, disabledColumns, disabledRows, etc.
 * - onActionClicked, onEdit, and all cell event handlers
 * - handleAddRowFunction, handleRemoveRowFunction
 * - texts, permissions, etc.
 *
 * This component can be extended or wrapped for custom row types.
 */
export function SheetTableRow<T extends object>({
  row,
  groupKey,
  level = 0,
  hoveredRowId,
  setHoveredRowId,
  enableRowSelection,
  enableRowActions,
  rowActions,
  cellErrors,
  disabledColumns,
  disabledRows,
  onActionClicked,
  onEdit,
  handleCellFocus,
  handleKeyDown,
  handlePaste,
  handleCellInput,
  handleCellBlur,
  texts,
  canEditAction,
  canDuplicateAction,
  canViewAction,
  canArchiveAction,
  canDeleteAction,
  canPreviewAction,
  ...rest
}: {
  row: any;
  groupKey: string;
  level?: number;
  hoveredRowId?: string | null;
  setHoveredRowId?: (id: string | null) => void;
  enableRowSelection?: boolean;
  enableRowActions?: boolean;
  rowActions?: any;
  cellErrors?: Record<string, Record<string, Record<string, string | null>>>;
  disabledColumns?: string[];
  disabledRows?: any;
  onActionClicked?: (action: string, rowId: string) => void;
  onEdit?: any;
  handleCellFocus?: any;
  handleKeyDown?: any;
  handlePaste?: any;
  handleCellInput?: any;
  handleCellBlur?: any;
  texts?: any;
  canEditAction?: boolean;
  canDuplicateAction?: boolean;
  canViewAction?: boolean;
  canArchiveAction?: boolean;
  canDeleteAction?: boolean;
  canPreviewAction?: boolean;
  [key: string]: any;
}) {
  const rowId = row.id;
  const rowIndex = row.index;
  const rowData = row.original;
  const disabled =
    (typeof disabledRows === "function"
      ? disabledRows(groupKey, rowIndex)
      : Array.isArray(disabledRows)
        ? disabledRows.includes(rowIndex)
        : disabledRows?.[groupKey]?.includes(rowIndex)) ?? false;
  const showRowActions = hoveredRowId === rowId;

  return (
    <TableRow
      className={cn(
        "relative",
        disabled ? "bg-muted" : "",
        row.getIsSelected() ? "bg-muted/50 dark:bg-muted/50" : "",
      )}
      onMouseEnter={() => setHoveredRowId && setHoveredRowId(rowId)}
      onMouseLeave={() => setHoveredRowId && setHoveredRowId(null)}
      data-state={row.getIsSelected() && "selected"}
      {...rest}
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
              onEdit={canEditAction ? () => onActionClicked?.("edit", rowId) : undefined}
              onDelete={canDeleteAction ? () => onActionClicked?.("delete", rowId) : undefined}
              onDuplicate={
                canDuplicateAction ? () => onActionClicked?.("duplicate", rowId) : undefined
              }
              onView={canViewAction ? () => onActionClicked?.("view", rowId) : undefined}
              onArchive={canArchiveAction ? () => onActionClicked?.("archive", rowId) : undefined}
              onPreview={canPreviewAction ? () => onActionClicked?.("preview", rowId) : undefined}
            />
          </div>
          <div className="bg-border absolute end-0 top-0 h-full w-[0.5px]" />
        </TableCell>
      )}
      {/* Data cells */}
      {row.getVisibleCells().map((cell: any, cellIndex: number) => {
        const colDef = cell.column.columnDef;
        const colKey = colDef.id || colDef.accessorKey || "";
        const isDisabled =
          disabled || (Array.isArray(disabledColumns) ? disabledColumns : []).includes(colKey);
        const errorMsg = cellErrors?.[groupKey]?.[rowId]?.[colKey] || null;
        return (
          <SheetTableCell
            key={cell.id}
            colDef={colDef}
            cell={cell}
            rowData={rowData}
            rowId={rowId}
            rowIndex={rowIndex}
            groupKey={groupKey}
            isDisabled={isDisabled}
            errorMsg={errorMsg}
            onEdit={onEdit}
            handleCellFocus={handleCellFocus}
            handleKeyDown={handleKeyDown}
            handlePaste={handlePaste}
            handleCellInput={handleCellInput}
            handleCellBlur={handleCellBlur}
            disabledColumns={Array.isArray(disabledColumns) ? disabledColumns : []}
            disabledRows={disabledRows}
          />
        );
      })}
    </TableRow>
  );
}

export default SheetTableRow;
