import { useLocale } from "next-intl";
import React from "react";

import CodeInput from "@/components/ui/code-input";
import { CommandSelect } from "@/components/ui/command-select";
import { Input } from "@/components/ui/input";
import type { ExtendedColumnDef } from "@/components/ui/sheet-table";
import { TableCell } from "@/components/ui/table";

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

  // Cell content logic (status, select, code, text)
  if (colDef.cellType === "status" && colDef.options) {
    const cellValue = cell.getValue() as string | number;
    const selectedOption = colDef.options.find((opt) => opt.value === cellValue);
    return (
      <TableCell
        className={cn(
          "relative overflow-hidden border p-0",
          {
            "bg-muted": isDisabled,
            "bg-destructive/25": errorMsg,
          },
          typeof colDef.className === "function" ? colDef.className(rowData) : colDef.className,
        )}
        style={{ ...style, overflow: "hidden", minWidth: 0 }}
        {...rest}
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
          renderSelected={(item) => (
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
          )}
          ariaInvalid={false}
        />
      </TableCell>
    );
  }
  if (colDef.cellType === "select" && colDef.options) {
    const cellValue = cell.getValue() as string | number;
    return (
      <TableCell
        className={cn(
          "force-maxwidth-cell relative overflow-hidden border p-0",
          {
            "bg-muted": isDisabled,
            "bg-destructive/25": errorMsg,
          },
          typeof colDef.className === "function" ? colDef.className(rowData) : colDef.className,
        )}
        style={{ ...style, overflow: "hidden", minWidth: 0 }}
        {...rest}
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
          texts={{ placeholder: ". . ." }}
          renderOption={(item) => <div>{item.label}</div>}
          ariaInvalid={false}
        />
      </TableCell>
    );
  }
  if (colDef.cellType === "code") {
    const cellValue = cell.getValue() as string | undefined;
    return (
      <TableCell
        className={cn(
          "relative overflow-hidden border p-0",
          {
            "bg-muted": isDisabled,
            "bg-destructive/25": errorMsg,
          },
          typeof colDef.className === "function" ? colDef.className(rowData) : colDef.className,
        )}
        style={{ ...style, overflow: "hidden", minWidth: 0 }}
        {...rest}
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
  // Default: editable text cell
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
