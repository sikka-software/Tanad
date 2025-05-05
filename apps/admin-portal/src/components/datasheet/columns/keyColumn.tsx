import React, { useCallback, useRef } from "react";
import { z } from "zod";

import { CellComponent, CellProps, Column } from "../types";

// The data passed to the cell component wrapper. Contains the key and the original column definition.
type ColumnData = {
  key: string;
  original: Partial<Column<any, { validationSchema?: z.ZodSchema<any> }, any>>;
};

// Component wrapper that extracts the relevant key and calls the original component
// Reverted to original structure to fix type issues
const KeyComponent: CellComponent<any, ColumnData> = ({
  columnData: { key, original },
  rowData,
  setRowData,
  ...rest
}) => {
  // We use a ref so useCallback does not produce a new setKeyData function every time the rowData changes
  const rowDataRef = useRef(rowData);
  rowDataRef.current = rowData;

  // We wrap the setRowData function to assign the value to the desired key
  const setKeyData = useCallback(
    (value: any) => {
      setRowData({ ...rowDataRef.current, [key]: value });
    },
    [key, setRowData],
  );

  if (!original.component) {
    return <></>;
  }

  const Component = original.component;

  return (
    <Component
      columnData={original.columnData ?? {}}
      setRowData={setKeyData}
      // We only pass the value of the desired key
      rowData={rowData?.[key]}
      {...rest}
    />
  );
};

export const keyColumn = <
  T extends Record<string, any>,
  K extends keyof T = keyof T,
  PasteValue = string,
>(
  key: K,
  column: Partial<Column<T[K], { validationSchema?: z.ZodSchema<any> }, PasteValue>>,
): Partial<Column<T, ColumnData, PasteValue>> => ({
  id: key as string,
  ...column,
  columnData: { key: key as string, original: column },
  component: KeyComponent, // Use the original KeyComponent structure
  copyValue: ({ rowData, rowIndex }) =>
    column.copyValue?.({ rowData: rowData[key], rowIndex }) ?? null,
  deleteValue: ({ rowData, rowIndex }) => {
    const deletedValue = column.deleteValue?.({ rowData: rowData[key], rowIndex }) ?? null;

    // Explicitly check if columnData and validationSchema exist
    if (column.columnData && column.columnData.validationSchema) {
      const schema = column.columnData.validationSchema;
      const result = schema.safeParse(deletedValue);
      if (!result.success) {
        console.warn(
          `Validation failed for key "${String(key)}" after delete attempt: ${result.error.errors
            .map((e) => e.message)
            .join(", ")}. Change prevented.`,
        );
        // Validation failed, prevent deletion by returning original rowData
        return rowData;
      }
    }

    // Validation passed or no schema/columnData, proceed with deletion
    return {
      ...rowData,
      [key]: deletedValue,
    };
  },
  pasteValue: ({ rowData, value, rowIndex }) => ({
    ...rowData,
    [key]: column.pasteValue?.({ rowData: rowData[key], value, rowIndex }) ?? null,
  }),
  disabled:
    typeof column.disabled === "function"
      ? ({ rowData, rowIndex }) => {
          return typeof column.disabled === "function"
            ? column.disabled({ rowData: rowData[key], rowIndex })
            : (column.disabled ?? false);
        }
      : column.disabled,
  cellClassName:
    typeof column.cellClassName === "function"
      ? ({ rowData, rowIndex, columnId }) => {
          return typeof column.cellClassName === "function"
            ? column.cellClassName({ rowData: rowData[key], rowIndex, columnId })
            : (column.cellClassName ?? undefined);
        }
      : column.cellClassName,
  isCellEmpty: ({ rowData, rowIndex }) =>
    column.isCellEmpty?.({ rowData: rowData[key], rowIndex }) ?? false,
});
