import React from "react";

import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

import { cn } from "@/lib/utils";

/**
 * SheetTableHeader
 *
 * Abstract, extensible header renderer for SheetTable.
 * Handles column sizing, selection, actions, and custom header logic.
 *
 * Props:
 * - table: TanStack table instance
 * - enableRowSelection: boolean
 * - enableRowActions: boolean
 * - showHeader: boolean
 * - texts: any (for i18n)
 * - canEditAction, canDeleteAction, etc. (for permissions)
 *
 * This component can be extended or wrapped for custom header logic.
 */
export function SheetTableHeader({
  table,
  enableRowSelection,
  enableRowActions,
  showHeader = true,
  texts,
  canEditAction,
  canDeleteAction,
  canDuplicateAction,
  canViewAction,
  canArchiveAction,
  canPreviewAction,
  enableColumnSizing,
  ...rest
}: {
  table: any;
  enableRowSelection?: boolean;
  enableRowActions?: boolean;
  showHeader?: boolean;
  texts?: any;
  canEditAction?: boolean;
  canDeleteAction?: boolean;
  canDuplicateAction?: boolean;
  canViewAction?: boolean;
  canArchiveAction?: boolean;
  canPreviewAction?: boolean;
  enableColumnSizing?: boolean;
  [key: string]: any;
}) {
  if (!showHeader) return null;
  return (
    <TableHeader className="relative" {...rest}>
      <TableRow className="border-none">
        {/* Selection checkbox header */}
        {enableRowSelection && (
          <TableHead
            className={cn(
              "bg-muted sticky start-0 top-0 z-30 w-8 border-none text-start",

              // "!max-w-8 min-w-8"
            )}
          >
            <div className="flex h-full items-center justify-center">
              <input
                type="checkbox"
                checked={table.getIsAllPageRowsSelected()}
                onChange={table.getToggleAllPageRowsSelectedHandler()}
                className="h-4 w-4 rounded-md border-gray-300"
                title={texts?.selectAll || "Select all"}
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
        {table.getHeaderGroups().map((headerGroup: any) =>
          headerGroup.headers.map((header: any) => {
            const style: React.CSSProperties = {};
            const col = header.column.columnDef;
            if (enableColumnSizing) {
              const size = header.getSize();
              if (size) style.width = `${size}px`;
              if (col.minSize)
                style.minWidth = typeof col.minSize === "number" ? `${col.minSize}px` : col.minSize;
              if (col.maxSize)
                style.maxWidth = typeof col.maxSize === "number" ? `${col.maxSize}px` : col.maxSize;
            } else {
              if (!col.size && !col.minSize && !col.maxSize) {
                style.width = "150px";
              }
              if (!col.minSize && !style.minWidth) {
                style.minWidth = "120px";
              }
              if (col.maxSize) {
                style.maxWidth = typeof col.maxSize === "number" ? `${col.maxSize}px` : col.maxSize;
                if (style.width && style.maxWidth) {
                  const widthPx = parseInt(style.width.toString());
                  const maxPx = parseInt(style.maxWidth.toString());
                  if (widthPx > maxPx) style.width = style.maxWidth;
                }
              }
            }
            return (
              <TableHead
                key={header.id}
                className="bg-muted group sticky top-0 !z-20 border-x text-start"
                style={style}
              >
                {header.isPlaceholder ? null : (
                  <div className="relative flex h-full items-center">
                    <span className="truncate">{header.column.columnDef.header}</span>
                    {enableColumnSizing && header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          "group-hover:bg-accent/30 absolute top-0 right-0 z-50 h-full w-2 cursor-col-resize bg-transparent transition select-none",
                          header.column.getIsResizing() && "bg-primary/40",
                        )}
                        style={{ userSelect: "none" }}
                        role="separator"
                        aria-orientation="vertical"
                        tabIndex={-1}
                      >
                        {/* Optionally, a visual indicator */}
                        {header.column.getIsResizing() && (
                          <div className="bg-primary/80 absolute top-0 right-0 h-full w-1 animate-pulse" />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </TableHead>
            );
          }),
        )}
      </TableRow>
    </TableHeader>
  );
}

export default SheetTableHeader;
