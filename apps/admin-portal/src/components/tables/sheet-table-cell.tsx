import { useLocale } from "next-intl";
import React from "react";

import { CommandSelect } from "@/ui/command-select";
import CodeInput from "@/ui/inputs/code-input";
import { Input } from "@/ui/inputs/input";
import type { ExtendedColumnDef } from "@/ui/sheet-table";
import { TableCell } from "@/ui/table";

import { cn } from "@/lib/utils";

/**
 * SheetTableCell
 *
 * Abstract, extensible cell renderer for SheetTable.
 * Handles all cell types (text, select, status, code) and validation/error display.
 *
 * Props:
 * - colDef: ExtendedColumnDef<T>
 * - cell: TanStack cell object
 * - rowData, rowId, rowIndex, groupKey: context for the cell
 * - isDisabled, errorMsg: state for the cell
 * - onEdit: callback for value changes
 * - handleCellFocus, handleKeyDown, handlePaste, handleCellInput, handleCellBlur: event handlers
 * - disabledColumns, disabledRows: for access control
 *
 * This component can be extended or wrapped for custom cell types.
 */
export function SheetTableCell<T extends object>({
  colDef,
  cell,
  rowData,
  rowId,
  rowIndex,
  groupKey,
  isDisabled,
  errorMsg,
  onEdit,
  handleCellFocus,
  handleKeyDown,
  handlePaste,
  handleCellInput,
  handleCellBlur,
  disabledColumns,
  disabledRows,
  ...rest
}: {
  colDef: ExtendedColumnDef<T>;
  cell: any;
  rowData: T;
  rowId: string;
  rowIndex: number;
  groupKey: string;
  isDisabled: boolean;
  errorMsg: string | null;
  onEdit?: (rowId: string, colKey: keyof T, value: T[keyof T]) => void;
  handleCellFocus: any;
  handleKeyDown: any;
  handlePaste: any;
  handleCellInput: any;
  handleCellBlur: any;
  disabledColumns: string[];
  disabledRows: any;
  [key: string]: any;
}) {
  const locale = useLocale();
  const colKey = colDef.id || colDef.accessorKey || "";
  // Sizing logic
  const style: React.CSSProperties = {};
  if (colDef.size) style.width = typeof colDef.size === "number" ? `${colDef.size}px` : colDef.size;
  if (colDef.minSize)
    style.minWidth = typeof colDef.minSize === "number" ? `${colDef.minSize}px` : colDef.minSize;
  if (colDef.maxSize)
    style.maxWidth = typeof colDef.maxSize === "number" ? `${colDef.maxSize}px` : colDef.maxSize;

  return (
    <TableCell
      key={rowId + colKey + String(cell.getValue() ?? "")}
      className={cn(
        "tiny-scrollbar relative overflow-scroll border",
        {
          "bg-muted": isDisabled,
          "bg-destructive/25": errorMsg,
        },
        colDef.noPadding ? "p-0" : "",
        typeof colDef.className === "function" ? colDef.className(rowData) : colDef.className,
      )}
      dir={colDef.dir}
      style={style}
      contentEditable={colDef.enableEditing !== false ? !isDisabled : false}
      suppressContentEditableWarning
      onFocus={(e) => handleCellFocus(e, groupKey, rowData, colDef)}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && ["a", "c", "x", "z", "v"].includes(e.key.toLowerCase())) {
          return;
        }
        handleKeyDown(e, colDef);
      }}
      onPaste={(e) => handlePaste(e, colDef)}
      onInput={(e) => handleCellInput(e, groupKey, rowData, colDef)}
      onBlur={(e) => handleCellBlur(e, groupKey, rowData, colDef)}
      {...rest}
    >
      {cell.renderedValue ?? cell.getValue()}
    </TableCell>
  );
}

export default SheetTableCell;
