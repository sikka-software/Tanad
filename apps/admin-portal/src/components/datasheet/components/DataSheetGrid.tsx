import deepEqual from "fast-deep-equal";
import React, {
  JSXElementConstructor,
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useResizeDetector } from "react-resize-detector";

import { useColumnWidths } from "../hooks/useColumnWidths";
import { useColumns } from "../hooks/useColumns";
import { useDebounceState } from "../hooks/useDebounceState";
import { useDeepEqualState } from "../hooks/useDeepEqualState";
import { useDocumentEventListener } from "../hooks/useDocumentEventListener";
import { useEdges } from "../hooks/useEdges";
import { useGetBoundingClientRect } from "../hooks/useGetBoundingClientRect";
import { useRowHeights } from "../hooks/useRowHeights";
import {
  AddRowsComponentProps,
  Cell,
  Column,
  ContextMenuItem,
  ContextMenuComponentProps,
  DataSheetGridProps,
  DataSheetGridRef,
  Operation,
  Selection,
} from "../types";
import {
  encodeHtml,
  isPrintableUnicode,
  parseTextHtmlData,
  parseTextPlainData,
} from "../utils/copyPasting";
import { getAllTabbableElements } from "../utils/tab";
import { getCell, getCellWithId, getSelection, getSelectionWithId } from "../utils/typeCheck";
import { AddRows } from "./AddRows";
import { ContextMenu } from "./ContextMenu";
import { Grid } from "./Grid";
import { SelectionRect } from "./SelectionRect";

const DEFAULT_DATA: any[] = [];
const DEFAULT_COLUMNS: Column<any, any, any>[] = [];
const DEFAULT_CREATE_ROW: DataSheetGridProps<any>["createRow"] = () => ({});
const DEFAULT_EMPTY_CALLBACK: () => void = () => null;
const DEFAULT_DUPLICATE_ROW: DataSheetGridProps<any>["duplicateRow"] = ({ rowData }) => ({
  ...rowData,
});

// Add state for validation errors
type ValidationErrors = Record<number, Record<number, string | null>>;

type ScrollBehavior = {
  doNotScrollX?: boolean;
  doNotScrollY?: boolean;
};

// eslint-disable-next-line react/display-name
export const DataSheetGrid = React.memo(
  React.forwardRef<DataSheetGridRef, DataSheetGridProps<any>>(
    <T extends any>(
      {
        value: data = DEFAULT_DATA,
        className,
        style,
        height: maxHeight = 400,
        onChange = DEFAULT_EMPTY_CALLBACK,
        columns: rawColumns = DEFAULT_COLUMNS,
        rowHeight = 40,
        headerRowHeight = typeof rowHeight === "number" ? rowHeight : 40,
        gutterColumn,
        stickyRightColumn,
        rowKey,
        addRowsComponent: AddRowsComponent = AddRows as (
          props: AddRowsComponentProps,
        ) => ReactElement | null,
        createRow = DEFAULT_CREATE_ROW as () => T,
        autoAddRow = false,
        lockRows = false,
        disableExpandSelection = false,
        disableSmartDelete = false,
        duplicateRow = DEFAULT_DUPLICATE_ROW,
        contextMenuComponent: ContextMenuComponent = ContextMenu as (
          props: ContextMenuComponentProps,
        ) => ReactElement | null,
        disableContextMenu: disableContextMenuRaw = false,
        onFocus = DEFAULT_EMPTY_CALLBACK,
        onBlur = DEFAULT_EMPTY_CALLBACK,
        onActiveCellChange = DEFAULT_EMPTY_CALLBACK,
        onSelectionChange = DEFAULT_EMPTY_CALLBACK,
        rowClassName,
        cellClassName,
        onScroll,
      }: DataSheetGridProps<T>,
      ref: React.ForwardedRef<DataSheetGridRef>,
    ): React.ReactNode => {
      const lastEditingCellRef = useRef<Cell | null>(null);
      const disableContextMenu = disableContextMenuRaw || lockRows;
      const columns = useColumns(rawColumns, gutterColumn, stickyRightColumn);
      const hasStickyRightColumn = Boolean(stickyRightColumn);
      const innerRef = useRef<HTMLDivElement>(null);
      const outerRef = useRef<HTMLDivElement>(null);
      const beforeTabIndexRef = useRef<HTMLDivElement>(null);
      const afterTabIndexRef = useRef<HTMLDivElement>(null);

      // Default value is 1 for the border
      const [heightDiff, setHeightDiff] = useDebounceState(1, 100);
      // Add state for validation errors
      const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

      const { getRowSize, totalSize, getRowIndex } = useRowHeights({
        value: data,
        rowHeight,
      });

      // Height of the list (including scrollbars and borders) to display
      const displayHeight = Math.min(
        maxHeight,
        headerRowHeight + totalSize(maxHeight) + heightDiff,
      );

      // Width and height of the scrollable area
      const { width, height } = useResizeDetector({
        targetRef: outerRef,
        refreshMode: "throttle",
        refreshRate: 100,
      });

      setHeightDiff(height ? displayHeight - height : 0);

      const edges = useEdges(outerRef as React.RefObject<HTMLElement>, width, height);

      const {
        fullWidth,
        totalWidth: contentWidth,
        columnWidths,
        columnRights,
      } = useColumnWidths(columns, width);

      // x,y coordinates of the right click
      const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        cursorIndex: Cell;
      } | null>(null);

      // Items of the context menu
      const [contextMenuItems, setContextMenuItems] = useState<ContextMenuItem[]>([]);

      // True when the active cell is being edited
      const [editing, setEditing] = useState(false);

      // Number of rows the user is expanding the selection by, always a number, even when not expanding selection
      const [expandSelectionRowsCount, setExpandSelectionRowsCount] = useState<number>(0);

      // When not null, represents the index of the row from which we are expanding
      const [expandingSelectionFromRowIndex, setExpandingSelectionFromRowIndex] = useState<
        number | null
      >(null);

      // Highlighted cell, null when not focused
      const [activeCell, setActiveCell] = useDeepEqualState<(Cell & ScrollBehavior) | null>(null);

      // The selection cell and the active cell are the two corners of the selection, null when nothing is selected
      const [selectionCell, setSelectionCell] = useDeepEqualState<(Cell & ScrollBehavior) | null>(
        null,
      );

      // Min and max of the current selection (rectangle defined by the active cell and the selection cell), null when nothing is selected
      const selection = useMemo<Selection | null>(
        () =>
          activeCell &&
          selectionCell && {
            min: {
              col: Math.min(activeCell.col, selectionCell.col),
              row: Math.min(activeCell.row, selectionCell.row),
            },
            max: {
              col: Math.max(activeCell.col, selectionCell.col),
              row: Math.max(activeCell.row, selectionCell.row),
            },
          },
        [activeCell, selectionCell],
      );

      // Behavior of the selection when the user drags the mouse around
      const [selectionMode, setSelectionMode] = useDeepEqualState({
        // True when the position of the cursor should impact the columns of the selection
        columns: false,
        // True when the position of the cursor should impact the rows of the selection
        rows: false,
        // True when the user is dragging the mouse around to select
        active: false,
      });

      // Same as expandSelectionRowsCount but is null when we should not be able to expand the selection
      const expandSelection =
        disableExpandSelection ||
        editing ||
        selectionMode.active ||
        activeCell?.row === data?.length - 1 ||
        selection?.max.row === data?.length - 1 ||
        (activeCell &&
          columns
            .slice(
              (selection?.min.col ?? activeCell.col) + 1,
              (selection?.max.col ?? activeCell.col) + 2,
            )
            .every((column) => column.disabled === true))
          ? null
          : expandSelectionRowsCount;

      const getInnerBoundingClientRect = useGetBoundingClientRect(
        innerRef as React.RefObject<HTMLElement>,
      );
      const getOuterBoundingClientRect = useGetBoundingClientRect(
        outerRef as React.RefObject<HTMLElement>,
      );

      // Blur any element on focusing the grid
      useEffect(() => {
        if (activeCell !== null) {
          (document.activeElement as HTMLElement).blur();
          window.getSelection()?.removeAllRanges();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [activeCell !== null]);

      // Extract the coordinates of the cursor from a mouse event
      const getCursorIndex = useCallback(
        (
          event: MouseEvent,
          force: boolean = false,
          includeSticky: boolean = false,
        ): Cell | null => {
          const innerBoundingClientRect = getInnerBoundingClientRect(force);
          const outerBoundingClientRect = includeSticky && getOuterBoundingClientRect(force);

          if (innerBoundingClientRect && columnRights && columnWidths) {
            let x = event.clientX - innerBoundingClientRect.left;
            let y = event.clientY - innerBoundingClientRect.top;

            if (outerBoundingClientRect) {
              if (event.clientY - outerBoundingClientRect.top <= headerRowHeight) {
                y = 0;
              }

              if (event.clientX - outerBoundingClientRect.left <= columnWidths[0]) {
                x = 0;
              }

              if (
                hasStickyRightColumn &&
                outerBoundingClientRect.right - event.clientX <=
                  columnWidths[columnWidths.length - 1]
              ) {
                x = columnRights[columnRights.length - 2] + 1;
              }
            }

            return {
              col: columnRights.findIndex((right) => x < right) - 1,
              row: getRowIndex(y - headerRowHeight),
            };
          }

          return null;
        },
        [
          columnRights,
          columnWidths,
          data.length,
          getInnerBoundingClientRect,
          getOuterBoundingClientRect,
          headerRowHeight,
          hasStickyRightColumn,
          getRowIndex,
        ],
      );

      const dataRef = useRef(data);
      dataRef.current = data;

      const isCellDisabled = useCallback(
        (cell: Cell): boolean => {
          const disabled = columns[cell.col + 1].disabled;

          return Boolean(
            typeof disabled === "function"
              ? disabled({
                  rowData: dataRef.current[cell.row],
                  rowIndex: cell.row,
                })
              : disabled,
          );
        },
        [columns],
      );

      const handleOnChange = useCallback(
        (newData: T[], operations: Operation[]) => {
          const newErrors: ValidationErrors = JSON.parse(JSON.stringify(validationErrors)); // Deep copy for mutation
          let validationStateChanged = false;

          operations.forEach((op) => {
            if (op.type === "UPDATE" || op.type === "CREATE") {
              for (let rowIndex = op.fromRowIndex; rowIndex < op.toRowIndex; rowIndex++) {
                // Ensure row data exists, especially for CREATE operations
                const rowData = newData[rowIndex];
                if (!rowData) continue;

                newErrors[rowIndex] = newErrors[rowIndex] ?? {};
                columns.forEach((column, colIndexWithGutter) => {
                  // Skip gutter and sticky right column placeholder
                  if (
                    colIndexWithGutter === 0 ||
                    (hasStickyRightColumn && colIndexWithGutter === columns.length - 1)
                  ) {
                    return;
                  }
                  const colIndex = colIndexWithGutter - 1;
                  const {
                    validationSchema,
                    id: columnId,
                    isCellEmpty = (opts) => {
                      // Default check if T is object and columnId exists
                      const val = columnId ? opts.rowData?.[columnId as keyof T] : undefined;
                      return val === null || val === undefined || val === "";
                    },
                  } = column;

                  if (validationSchema && columnId) {
                    const value = rowData[columnId as keyof T];

                    // Always run safeParse and let the schema handle optionality/emptiness
                    const validationResult = validationSchema.safeParse(value);
                    const currentError = newErrors[rowIndex]?.[colIndex];

                    if (!validationResult.success) {
                      const newError = validationResult.error.errors[0]?.message || "Invalid";
                      if (currentError !== newError) {
                        newErrors[rowIndex][colIndex] = newError;
                        validationStateChanged = true;
                      }
                    } else if (currentError) {
                      newErrors[rowIndex][colIndex] = null; // Clear previous error
                      validationStateChanged = true;
                    }
                  } else if (newErrors[rowIndex]?.[colIndex]) {
                    // Clear error if column has no validation or ID, but somehow had an error recorded
                    newErrors[rowIndex][colIndex] = null;
                    validationStateChanged = true;
                  }
                });
                // Clean up row entry if no errors exist
                if (Object.values(newErrors[rowIndex] ?? {}).every((e) => e === null)) {
                  delete newErrors[rowIndex];
                  // We still need to check if the state *actually* changed overall
                }
              }
            } else if (op.type === "DELETE") {
              const newErrorsState: ValidationErrors = {};
              const numDeleted = op.toRowIndex - op.fromRowIndex;
              let changed = false;

              Object.keys(validationErrors).forEach((rIdxStr) => {
                const rIdx = parseInt(rIdxStr, 10);
                if (rIdx < op.fromRowIndex) {
                  newErrorsState[rIdx] = validationErrors[rIdx];
                } else if (rIdx >= op.toRowIndex) {
                  newErrorsState[rIdx - numDeleted] = validationErrors[rIdx];
                  if (!validationErrors[rIdx - numDeleted]) changed = true; // Mark change if new index didn't exist before
                } else {
                  // Rows being deleted had errors? Mark change.
                  if (Object.values(validationErrors[rIdx] ?? {}).some((e) => e !== null)) {
                    changed = true;
                  }
                }
              });

              // Compare keys count and deep compare values
              if (Object.keys(newErrorsState).length !== Object.keys(validationErrors).length) {
                changed = true;
              }

              if (changed && !deepEqual(validationErrors, newErrorsState)) {
                setValidationErrors(newErrorsState);
                // No need to set validationStateChanged here, outer call handles final state update
              }
            }
          });

          // Update errors state only if necessary after all operations
          if (validationStateChanged && !deepEqual(validationErrors, newErrors)) {
            setValidationErrors(newErrors);
          }

          // Call the original onChange prop
          onChange(newData, operations);
        },
        [onChange, columns, hasStickyRightColumn, validationErrors, setValidationErrors], // Added dependencies
      );

      const insertRowAfter = useCallback(
        (row: number, count = 1) => {
          if (lockRows) {
            return;
          }

          setSelectionCell(null);
          setEditing(false);

          handleOnChange(
            [
              ...dataRef.current.slice(0, row + 1),
              ...new Array(count).fill(0).map(createRow),
              ...dataRef.current.slice(row + 1),
            ],
            [
              {
                type: "CREATE",
                fromRowIndex: row + 1,
                toRowIndex: row + 1 + count,
              },
            ],
          );
          setActiveCell((a) => ({
            col: a?.col || 0,
            row: row + count,
            doNotScrollX: true,
          }));
        },
        [createRow, lockRows, handleOnChange, setActiveCell, setSelectionCell],
      );

      const duplicateRows = useCallback(
        (rowMin: number, rowMax: number = rowMin) => {
          if (lockRows) {
            return;
          }

          handleOnChange(
            [
              ...dataRef.current.slice(0, rowMax + 1),
              ...dataRef.current
                .slice(rowMin, rowMax + 1)
                .map((rowData, i) => duplicateRow({ rowData, rowIndex: i + rowMin })),
              ...dataRef.current.slice(rowMax + 1),
            ],
            [
              {
                type: "CREATE",
                fromRowIndex: rowMax + 1,
                toRowIndex: rowMax + 2 + rowMax - rowMin,
              },
            ],
          );
          setActiveCell({ col: 0, row: rowMax + 1, doNotScrollX: true });
          setSelectionCell({
            col: columns.length - (hasStickyRightColumn ? 3 : 2),
            row: 2 * rowMax - rowMin + 1,
            doNotScrollX: true,
          });
          setEditing(false);
        },
        [
          columns.length,
          duplicateRow,
          lockRows,
          handleOnChange,
          setActiveCell,
          setSelectionCell,
          hasStickyRightColumn,
        ],
      );

      // Scroll to any given cell making sure it is in view
      const scrollTo = useCallback(
        (cell: Cell & ScrollBehavior) => {
          if (!height || !width) {
            return;
          }

          if (!cell.doNotScrollY) {
            // Align top
            const topMax = getRowSize(cell.row).top;
            // Align bottom
            const topMin =
              getRowSize(cell.row).top + getRowSize(cell.row).height + headerRowHeight - height + 1;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const scrollTop = outerRef.current!.scrollTop;

            if (scrollTop > topMax) {
              outerRef.current!.scrollTop = topMax;
            } else if (scrollTop < topMin) {
              outerRef.current!.scrollTop = topMin;
            }
          }

          if (columnRights && columnWidths && outerRef.current && !cell.doNotScrollX) {
            // Align left
            const leftMax = columnRights[cell.col] - columnRights[0];
            // Align right
            const leftMin =
              columnRights[cell.col] +
              columnWidths[cell.col + 1] +
              (hasStickyRightColumn ? columnWidths[columnWidths.length - 1] : 0) -
              width +
              1;

            const scrollLeft = outerRef.current.scrollLeft;

            if (scrollLeft > leftMax) {
              outerRef.current.scrollLeft = leftMax;
            } else if (scrollLeft < leftMin) {
              outerRef.current.scrollLeft = leftMin;
            }
          }
        },
        [
          height,
          width,
          headerRowHeight,
          columnRights,
          columnWidths,
          getRowSize,
          hasStickyRightColumn,
        ],
      );

      // Scroll to the selectionCell cell when it changes
      useEffect(() => {
        if (selectionCell) {
          scrollTo(selectionCell);
        }
      }, [selectionCell, scrollTo]);

      // Scroll to the active cell when it changes
      useEffect(() => {
        if (activeCell) {
          scrollTo(activeCell);
        }
      }, [activeCell, scrollTo]);

      const setRowData = useCallback(
        (rowIndex: number, item: T) => {
          handleOnChange(
            [...dataRef.current?.slice(0, rowIndex), item, ...dataRef.current?.slice(rowIndex + 1)],
            [
              {
                type: "UPDATE",
                fromRowIndex: rowIndex,
                toRowIndex: rowIndex + 1,
              },
            ],
          );
        },
        [handleOnChange],
      );

      const deleteRows = useCallback(
        (rowMin: number, rowMax: number = rowMin) => {
          if (lockRows) {
            return;
          }

          setEditing(false);
          setActiveCell((a) => {
            const row = Math.min(dataRef.current.length - 2 - rowMax + rowMin, rowMin);

            if (row < 0) {
              return null;
            }

            return a && { col: a.col, row };
          });
          setSelectionCell(null);
          handleOnChange(
            [...dataRef.current.slice(0, rowMin), ...dataRef.current.slice(rowMax + 1)],
            [
              {
                type: "DELETE",
                fromRowIndex: rowMin,
                toRowIndex: rowMax + 1,
              },
            ],
          );
        },
        [lockRows, handleOnChange, setActiveCell, setSelectionCell],
      );

      const deleteSelection = useCallback(
        (_smartDelete = true) => {
          const smartDelete = _smartDelete && !disableSmartDelete;
          if (!activeCell) {
            return;
          }

          const min: Cell = selection?.min || activeCell;
          const max: Cell = selection?.max || activeCell;

          // Check if the entire selection is already empty
          if (
            data
              .slice(min.row, max.row + 1)
              .every((rowData, i) =>
                columns.every((column) => column.isCellEmpty({ rowData, rowIndex: i + min.row })),
              )
          ) {
            // If it's already empty and smart delete is on, delete the rows
            if (smartDelete) {
              deleteRows(min.row, max.row);
            }
            return; // Otherwise, do nothing
          }

          const newData = [...data];
          let changed = false; // Flag to track if any cell actually changed

          for (let row = min.row; row <= max.row; ++row) {
            for (let col = min.col; col <= max.col; ++col) {
              if (!isCellDisabled({ col, row })) {
                const { deleteValue = ({ rowData }) => rowData } = columns[col + 1];
                const originalRowData = newData[row]; // Store original
                newData[row] = deleteValue({
                  rowData: newData[row],
                  rowIndex: row,
                });
                // Check if the row data actually changed after deleteValue (our validation might prevent it)
                if (!deepEqual(originalRowData, newData[row])) {
                  changed = true;
                }
              }
            }
          }

          // If smart delete is on AND no cells actually changed (likely due to validation preventing deletion)
          if (smartDelete && !changed) {
            // setActiveCell({ col: 0, row: min.row, doNotScrollX: true }); // REMOVED
            // setSelectionCell({                          // REMOVED
            //   col: columns.length - (hasStickyRightColumn ? 3 : 2), // REMOVED
            //   row: max.row,                             // REMOVED
            //   doNotScrollX: true,                       // REMOVED
            // });                                         // REMOVED
            // Simply return, doing nothing, as the deletion was prevented.
            return;
          }

          // If we reached here, either smartDelete is off, or some cells did change.
          // Apply the changes through the handler which includes validation.
          handleOnChange(newData, [
            {
              type: "UPDATE",
              fromRowIndex: min.row,
              toRowIndex: max.row + 1,
            },
          ]);
        },
        [
          activeCell,
          columns,
          data,
          deleteRows,
          isCellDisabled,
          handleOnChange,
          selection?.max,
          selection?.min,
          hasStickyRightColumn,
          disableSmartDelete,
        ],
      );

      const stopEditing = useCallback(
        ({ nextRow = true } = {}) => {
          if (activeCell?.row === dataRef.current.length - 1) {
            if (nextRow && autoAddRow) {
              insertRowAfter(activeCell.row);
            } else {
              setEditing(false);
            }
          } else {
            setEditing(false);

            if (nextRow) {
              setActiveCell((a) => a && { col: a.col, row: a.row + 1 });
            }
          }
        },
        [activeCell?.row, autoAddRow, insertRowAfter, setActiveCell],
      );

      const onCopy = useCallback(
        async (event?: ClipboardEvent) => {
          if (!editing && activeCell) {
            const copyData: Array<Array<number | string | null>> = [];

            const min: Cell = selection?.min || activeCell;
            const max: Cell = selection?.max || activeCell;

            for (let row = min.row; row <= max.row; ++row) {
              copyData.push([]);

              for (let col = min.col; col <= max.col; ++col) {
                const { copyValue = () => null } = columns[col + 1];
                copyData[row - min.row].push(copyValue({ rowData: data[row], rowIndex: row }));
              }
            }

            const textPlain = copyData.map((row) => row.join("\t")).join("\n");
            const textHtml = `<table>${copyData
              .map(
                (row) =>
                  `<tr>${row
                    .map(
                      (cell) =>
                        `<td>${encodeHtml(String(cell ?? "")).replace(/\n/g, "<br/>")}</td>`,
                    )
                    .join("")}</tr>`,
              )
              .join("")}</table>`;

            if (event !== undefined) {
              event.clipboardData?.setData("text/plain", textPlain);
              event.clipboardData?.setData("text/html", textHtml);
              event.preventDefault();
              return;
            }

            let success = false;
            if (navigator.clipboard.write !== undefined) {
              const textBlob = new Blob([textPlain], {
                type: "text/plain",
              });
              const htmlBlob = new Blob([textHtml], { type: "text/html" });
              const clipboardData = [
                new ClipboardItem({
                  "text/plain": textBlob,
                  "text/html": htmlBlob,
                }),
              ];
              await navigator.clipboard.write(clipboardData).then(() => {
                success = true;
              });
            } else if (navigator.clipboard.writeText !== undefined) {
              await navigator.clipboard.writeText(textPlain).then(() => {
                success = true;
              });
            } else if (document.execCommand !== undefined) {
              const result = document.execCommand("copy");
              if (result) {
                success = true;
              }
            }
            if (!success) {
              alert(
                "This action is unavailable in your browser, but you can still use Ctrl+C for copy or Ctrl+X for cut",
              );
            }
          }
        },
        [activeCell, columns, data, editing, selection],
      );
      useDocumentEventListener("copy", onCopy);

      const onCut = useCallback(
        (event?: ClipboardEvent) => {
          if (!editing && activeCell) {
            onCopy(event);
            deleteSelection(false);
          }
        },
        [activeCell, deleteSelection, editing, onCopy],
      );
      useDocumentEventListener("cut", onCut);

      const applyPasteDataToDatasheet = useCallback(
        async (pasteData: string[][]) => {
          if (!editing && activeCell) {
            const min: Cell = selection?.min || activeCell;
            const max: Cell = selection?.max || activeCell;

            const results = await Promise.all(
              pasteData[0].map((_, columnIndex) => {
                const prePasteValues = columns[min.col + columnIndex + 1]?.prePasteValues;

                const values = pasteData.map((row) => row[columnIndex]);
                return prePasteValues?.(values) ?? values;
              }),
            );

            pasteData = pasteData.map((_, rowIndex) => results.map((column) => column[rowIndex]));

            // Paste single row
            if (pasteData.length === 1) {
              const newData = [...data];

              for (let columnIndex = 0; columnIndex < pasteData[0].length; columnIndex++) {
                const pasteValue = columns[min.col + columnIndex + 1]?.pasteValue;

                if (pasteValue) {
                  for (let rowIndex = min.row; rowIndex <= max.row; rowIndex++) {
                    if (
                      !isCellDisabled({
                        col: columnIndex + min.col,
                        row: rowIndex,
                      })
                    ) {
                      const originalValue = newData[rowIndex];
                      newData[rowIndex] = await pasteValue({
                        rowData: newData[rowIndex],
                        value: pasteData[0][columnIndex],
                        rowIndex,
                      });
                      if (!deepEqual(originalValue, newData[rowIndex])) {
                        handleOnChange(newData, [
                          {
                            type: "UPDATE",
                            fromRowIndex: rowIndex,
                            toRowIndex: rowIndex + 1,
                          },
                        ]);
                      }
                    }
                  }
                }
              }

              setActiveCell({ col: min.col, row: min.row });
              setSelectionCell({
                col: Math.min(
                  min.col + pasteData[0].length - 1,
                  columns.length - (hasStickyRightColumn ? 3 : 2),
                ),
                row: max.row,
              });
            } else {
              // Paste multiple rows
              let newData = [...data];
              const missingRows = min.row + pasteData.length - data.length;

              if (missingRows > 0) {
                if (!lockRows) {
                  newData = [...newData, ...new Array(missingRows).fill(0).map(() => createRow())];
                } else {
                  pasteData.splice(pasteData.length - missingRows, missingRows);
                }
              }

              for (
                let columnIndex = 0;
                columnIndex < pasteData[0].length &&
                min.col + columnIndex < columns.length - (hasStickyRightColumn ? 2 : 1);
                columnIndex++
              ) {
                const pasteValue = columns[min.col + columnIndex + 1]?.pasteValue;

                if (pasteValue) {
                  for (let rowIndex = 0; rowIndex < pasteData.length; rowIndex++) {
                    if (
                      !isCellDisabled({
                        col: min.col + columnIndex,
                        row: min.row + rowIndex,
                      })
                    ) {
                      const originalValueMulti = newData[min.row + rowIndex];
                      newData[min.row + rowIndex] = await pasteValue({
                        rowData: newData[min.row + rowIndex],
                        value: pasteData[rowIndex][columnIndex],
                        rowIndex: min.row + rowIndex,
                      });
                      if (!deepEqual(originalValueMulti, newData[min.row + rowIndex])) {
                        handleOnChange(newData, [
                          {
                            type: "UPDATE",
                            fromRowIndex: min.row + rowIndex,
                            toRowIndex: min.row + rowIndex + 1,
                          },
                        ]);
                      }
                    }
                  }
                }
              }

              const operations: Operation[] = [
                {
                  type: "UPDATE",
                  fromRowIndex: min.row,
                  toRowIndex:
                    min.row + pasteData.length - (!lockRows && missingRows > 0 ? missingRows : 0),
                },
              ];

              if (missingRows > 0 && !lockRows) {
                operations.push({
                  type: "CREATE",
                  fromRowIndex: data.length, // Original length before adding rows
                  toRowIndex: newData.length, // New length after adding rows
                });
              }

              handleOnChange(newData, operations);
              setActiveCell({ col: min.col, row: min.row });
              setSelectionCell({
                col: Math.min(
                  min.col + pasteData[0].length - 1,
                  columns.length - (hasStickyRightColumn ? 3 : 2),
                ),
                row: min.row + pasteData.length - 1,
              });
            }
          }
        },
        [
          activeCell,
          columns,
          createRow,
          data,
          editing,
          hasStickyRightColumn,
          isCellDisabled,
          lockRows,
          handleOnChange,
          selection?.max,
          selection?.min,
          setActiveCell,
          setSelectionCell,
        ],
      );

      const onPaste = useCallback(
        (event: ClipboardEvent) => {
          if (activeCell && !editing) {
            let pasteData = [[""]];
            if (event.clipboardData?.types.includes("text/html")) {
              pasteData = parseTextHtmlData(event.clipboardData?.getData("text/html"));
            } else if (event.clipboardData?.types.includes("text/plain")) {
              pasteData = parseTextPlainData(event.clipboardData?.getData("text/plain"));
            } else if (event.clipboardData?.types.includes("text")) {
              pasteData = parseTextPlainData(event.clipboardData?.getData("text"));
            }
            applyPasteDataToDatasheet(pasteData);
            event.preventDefault();
          }
        },
        [activeCell, applyPasteDataToDatasheet, editing],
      );

      useDocumentEventListener("paste", onPaste);

      const onMouseDown = useCallback(
        (event: MouseEvent) => {
          if (contextMenu && contextMenuItems.length) {
            return;
          }

          const rightClick = event.button === 2 || (event.button === 0 && event.ctrlKey);
          const clickInside = innerRef.current?.contains(event.target as Node) || false;

          const cursorIndex = clickInside ? getCursorIndex(event, true, true) : null;

          if (!clickInside && editing && activeCell && columns[activeCell.col + 1].keepFocus) {
            return;
          }

          if (
            event.target instanceof HTMLElement &&
            event.target.className.includes("dsg-expand-rows-indicator")
          ) {
            setExpandingSelectionFromRowIndex(
              Math.max(activeCell?.row ?? 0, selection?.max.row ?? 0),
            );
            return;
          }

          const clickOnActiveCell =
            cursorIndex &&
            activeCell &&
            activeCell.col === cursorIndex.col &&
            activeCell.row === cursorIndex.row &&
            !isCellDisabled(activeCell);

          const previousEditingState = editing; // Remember if we were editing

          if (clickOnActiveCell && editing) {
            return;
          }

          const clickOnStickyRightColumn =
            cursorIndex?.col === columns.length - 2 && hasStickyRightColumn;

          const rightClickInSelection =
            rightClick &&
            selection &&
            cursorIndex &&
            cursorIndex.row >= selection.min.row &&
            cursorIndex.row <= selection.max.row &&
            cursorIndex.col >= selection.min.col &&
            cursorIndex.col <= selection.max.col;

          const rightClickOnSelectedHeaders =
            rightClick &&
            selection &&
            cursorIndex &&
            cursorIndex.row === -1 &&
            cursorIndex.col >= selection.min.col &&
            cursorIndex.col <= selection.max.col;

          const rightClickOnSelectedGutter =
            rightClick &&
            selection &&
            cursorIndex &&
            cursorIndex.row >= selection.min.row &&
            cursorIndex.row <= selection.max.row &&
            cursorIndex.col === -1;

          const clickOnSelectedStickyRightColumn =
            clickOnStickyRightColumn &&
            selection &&
            cursorIndex &&
            cursorIndex.row >= selection.min.row &&
            cursorIndex.row <= selection.max.row;

          if (rightClick && !disableContextMenu) {
            setContextMenu({
              x: event.clientX,
              y: event.clientY,
              cursorIndex: cursorIndex as Cell,
            });
          }

          if ((!(event.shiftKey && activeCell) || rightClick) && data.length > 0) {
            setActiveCell(
              cursorIndex && {
                col:
                  (rightClickInSelection || rightClickOnSelectedHeaders) && activeCell
                    ? activeCell.col
                    : Math.max(0, clickOnStickyRightColumn ? 0 : cursorIndex.col),
                row:
                  (rightClickInSelection ||
                    rightClickOnSelectedGutter ||
                    clickOnSelectedStickyRightColumn) &&
                  activeCell
                    ? activeCell.row
                    : Math.max(0, cursorIndex.row),
                doNotScrollX: Boolean(
                  (rightClickInSelection && activeCell) ||
                    clickOnStickyRightColumn ||
                    cursorIndex.col === -1,
                ),
                doNotScrollY: Boolean(
                  (rightClickInSelection && activeCell) || cursorIndex.row === -1,
                ),
              },
            );
          }

          if (clickOnActiveCell && !rightClick) {
            lastEditingCellRef.current = activeCell;
          }

          setEditing(Boolean(clickOnActiveCell && !rightClick));
          setSelectionMode(
            cursorIndex && !rightClick
              ? {
                  columns:
                    (cursorIndex.col !== -1 && !clickOnStickyRightColumn) ||
                    Boolean(event.shiftKey && activeCell),
                  rows: cursorIndex.row !== -1 || Boolean(event.shiftKey && activeCell),
                  active: true,
                }
              : {
                  columns: false,
                  rows: false,
                  active: false,
                },
          );

          if (event.shiftKey && activeCell && !rightClick) {
            setSelectionCell(
              cursorIndex && {
                col: Math.max(0, cursorIndex.col - (clickOnStickyRightColumn ? 1 : 0)),
                row: Math.max(0, cursorIndex.row),
              },
            );
          } else if (!rightClickInSelection) {
            if (
              cursorIndex &&
              (cursorIndex?.col === -1 || cursorIndex?.row === -1 || clickOnStickyRightColumn)
            ) {
              let col = cursorIndex.col;
              let row = cursorIndex.row;
              let doNotScrollX = false;
              let doNotScrollY = false;

              if (cursorIndex.col === -1 || clickOnStickyRightColumn) {
                col = columns.length - (hasStickyRightColumn ? 3 : 2);
                doNotScrollX = true;
              }

              if (cursorIndex.row === -1) {
                row = data.length - 1;
                doNotScrollY = true;
              }

              if (rightClickOnSelectedHeaders && selectionCell) {
                col = selectionCell.col;
                doNotScrollY = true;
              }

              if (
                (rightClickOnSelectedGutter || clickOnSelectedStickyRightColumn) &&
                selectionCell
              ) {
                row = selectionCell.row;
                doNotScrollX = true;
              }

              setSelectionCell({ col, row, doNotScrollX, doNotScrollY });
            } else {
              setSelectionCell(null);
            }

            if (clickInside) {
              event.preventDefault();
            }
          }

          // ADDED: Blur if editing state changed from true to false
          if (
            previousEditingState &&
            !clickOnActiveCell && // Ensure the click wasn't on the cell we were just editing
            innerRef.current?.contains(document.activeElement) &&
            document.activeElement instanceof HTMLElement
          ) {
            document.activeElement.blur();
          }
        },
        [
          contextMenu,
          contextMenuItems.length,
          getCursorIndex,
          editing,
          activeCell,
          columns,
          isCellDisabled,
          selection,
          hasStickyRightColumn,
          disableContextMenu,
          setSelectionMode,
          setActiveCell,
          setSelectionCell,
          selectionCell,
          data.length,
          innerRef,
        ],
      );
      useDocumentEventListener("mousedown", onMouseDown);

      const onMouseUp = useCallback(() => {
        if (expandingSelectionFromRowIndex !== null) {
          if (expandSelectionRowsCount > 0 && activeCell) {
            let copyData: Array<Array<string>> = [];

            const min: Cell = selection?.min || activeCell;
            const max: Cell = selection?.max || activeCell;

            for (let row = min.row; row <= max.row; ++row) {
              copyData.push([]);

              for (let col = min.col; col <= max.col; ++col) {
                const { copyValue = () => null } = columns[col + 1];
                copyData[row - min.row].push(
                  String(copyValue({ rowData: data[row], rowIndex: row }) ?? ""),
                );
              }
            }

            Promise.all(
              copyData[0].map((_, columnIndex) => {
                const prePasteValues = columns[min.col + columnIndex + 1]?.prePasteValues;

                const values = copyData.map((row) => row[columnIndex]);
                return prePasteValues?.(values) ?? values;
              }),
            ).then((results) => {
              copyData = copyData.map((_, rowIndex) => results.map((column) => column[rowIndex]));

              const newData = [...data];

              for (let columnIndex = 0; columnIndex < copyData[0].length; columnIndex++) {
                const pasteValue = columns[min.col + columnIndex + 1]?.pasteValue;

                if (pasteValue) {
                  for (
                    let rowIndex = max.row + 1;
                    rowIndex <= max.row + expandSelectionRowsCount;
                    rowIndex++
                  ) {
                    if (
                      !isCellDisabled({
                        col: columnIndex + min.col,
                        row: rowIndex,
                      })
                    ) {
                      newData[rowIndex] = pasteValue({
                        rowData: newData[rowIndex],
                        value: copyData[(rowIndex - max.row - 1) % copyData.length][columnIndex],
                        rowIndex,
                      });
                    }
                  }
                }
              }

              handleOnChange(newData, [
                {
                  type: "UPDATE",
                  fromRowIndex: max.row + 1,
                  toRowIndex: max.row + 1 + expandSelectionRowsCount,
                },
              ]);
            });

            setExpandSelectionRowsCount(0);
            setActiveCell({
              col: Math.min(activeCell?.col ?? Infinity, selection?.min.col ?? Infinity),
              row: Math.min(activeCell?.row ?? Infinity, selection?.min.row ?? Infinity),
              doNotScrollX: true,
              doNotScrollY: true,
            });
            setSelectionCell({
              col: Math.max(activeCell?.col ?? 0, selection?.max.col ?? 0),
              row:
                Math.max(activeCell?.row ?? 0, selection?.max.row ?? 0) + expandSelectionRowsCount,
            });
          }
          setExpandingSelectionFromRowIndex(null);
        }

        setSelectionMode({
          columns: false,
          rows: false,
          active: false,
        });
      }, [
        expandingSelectionFromRowIndex,
        setSelectionMode,
        expandSelectionRowsCount,
        activeCell,
        selection?.min,
        selection?.max,
        data,
        handleOnChange,
        setActiveCell,
        setSelectionCell,
        columns,
        isCellDisabled,
      ]);
      useDocumentEventListener("mouseup", onMouseUp);

      const onMouseMove = useCallback(
        (event: MouseEvent) => {
          if (expandingSelectionFromRowIndex !== null) {
            const cursorIndex = getCursorIndex(event);

            if (cursorIndex) {
              setExpandSelectionRowsCount(
                Math.max(0, cursorIndex.row - expandingSelectionFromRowIndex),
              );

              scrollTo({
                col: cursorIndex.col,
                row: Math.max(cursorIndex.row, expandingSelectionFromRowIndex),
              });
            }
          }

          if (selectionMode.active) {
            const cursorIndex = getCursorIndex(event);

            const lastColumnIndex = columns.length - (hasStickyRightColumn ? 3 : 2);

            setSelectionCell(
              cursorIndex && {
                col: selectionMode.columns
                  ? Math.max(0, Math.min(lastColumnIndex, cursorIndex.col))
                  : lastColumnIndex,
                row: selectionMode.rows ? Math.max(0, cursorIndex.row) : data.length - 1,
                doNotScrollX: !selectionMode.columns,
                doNotScrollY: !selectionMode.rows,
              },
            );
            setEditing(false);
          }
        },
        [
          scrollTo,
          selectionMode.active,
          selectionMode.columns,
          selectionMode.rows,
          getCursorIndex,
          columns.length,
          hasStickyRightColumn,
          setSelectionCell,
          data.length,
          expandingSelectionFromRowIndex,
        ],
      );
      useDocumentEventListener("mousemove", onMouseMove);

      const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
          if (!activeCell) {
            return;
          }

          if (event.isComposing) {
            return;
          }

          // Tab from last cell of a row
          if (
            event.key === "Tab" &&
            !event.shiftKey &&
            activeCell.col === columns.length - (hasStickyRightColumn ? 3 : 2) &&
            !columns[activeCell.col + 1].disableKeys
          ) {
            // Last row
            if (activeCell.row === data.length - 1) {
              if (afterTabIndexRef.current) {
                event.preventDefault();

                setActiveCell(null);
                setSelectionCell(null);
                setEditing(false);

                const allElements = getAllTabbableElements();
                const index = allElements.indexOf(afterTabIndexRef.current);

                allElements[(index + 1) % allElements.length].focus();

                return;
              }
            } else {
              setActiveCell((cell) => ({ col: 0, row: (cell?.row ?? 0) + 1 }));
              setSelectionCell(null);
              setEditing(false);
              event.preventDefault();

              return;
            }
          }

          // Shift+Tab from first cell of a row
          if (
            event.key === "Tab" &&
            event.shiftKey &&
            activeCell.col === 0 &&
            !columns[activeCell.col + 1].disableKeys
          ) {
            // First row
            if (activeCell.row === 0) {
              if (beforeTabIndexRef.current) {
                event.preventDefault();

                setActiveCell(null);
                setSelectionCell(null);
                setEditing(false);

                const allElements = getAllTabbableElements();
                const index = allElements.indexOf(beforeTabIndexRef.current);

                allElements[(index - 1 + allElements.length) % allElements.length].focus();

                return;
              }
            } else {
              setActiveCell((cell) => ({
                col: columns.length - (hasStickyRightColumn ? 3 : 2),
                row: (cell?.row ?? 1) - 1,
              }));
              setSelectionCell(null);
              setEditing(false);
              event.preventDefault();

              return;
            }
          }

          if (event.key?.startsWith("Arrow") || event.key === "Tab") {
            if (editing && columns[activeCell.col + 1].disableKeys) {
              return;
            }

            if (editing && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
              return;
            }

            const previousEditingState = editing; // Remember if we were editing

            const add = ([x, y]: [number, number], cell: Cell | null): Cell | null =>
              cell && {
                col: Math.max(
                  0,
                  Math.min(columns.length - (hasStickyRightColumn ? 3 : 2), cell.col + x),
                ),
                row: Math.max(0, Math.min(data.length - 1, cell.row + y)),
              };

            if (event.key === "Tab" && event.shiftKey) {
              setActiveCell((cell) => add([-1, 0], cell));
              setSelectionCell(null);
            } else {
              const direction = {
                ArrowDown: [0, 1],
                ArrowUp: [0, -1],
                ArrowLeft: [-1, 0],
                ArrowRight: [1, 0],
                Tab: [1, 0],
              }[event.key] as [number, number];

              if (event.ctrlKey || event.metaKey) {
                direction[0] *= columns.length;
                direction[1] *= data.length;
              }

              if (event.shiftKey) {
                setSelectionCell((cell) => add(direction, cell || activeCell));
              } else {
                setActiveCell((cell) => add(direction, cell));
                setSelectionCell(null);
              }
            }
            setEditing(false);

            // ADDED: Blur if editing state changed from true to false
            if (
              previousEditingState &&
              innerRef.current?.contains(document.activeElement) &&
              document.activeElement instanceof HTMLElement
            ) {
              document.activeElement.blur();
            }

            event.preventDefault();
          } else if (event.key === "Escape") {
            if (!editing && !selectionCell) {
              setActiveCell(null);
            }

            setSelectionCell(null);
            const previousEditingState = editing; // Remember if we were editing
            setEditing(false);
            // ADDED: Blur if editing state changed from true to false
            if (
              previousEditingState &&
              innerRef.current?.contains(document.activeElement) &&
              document.activeElement instanceof HTMLElement
            ) {
              document.activeElement.blur();
            }
          } else if (
            (event.key === "Enter" || event.key === "F2") &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            !event.shiftKey
          ) {
            setSelectionCell(null);

            if (editing) {
              if (!columns[activeCell.col + 1].disableKeys) {
                stopEditing();
                event.preventDefault();
              }
            } else if (!isCellDisabled(activeCell)) {
              lastEditingCellRef.current = activeCell;
              setEditing(true);
              scrollTo(activeCell);
              event.preventDefault();
            }
          } else if (
            event.key === "Enter" &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            event.shiftKey
          ) {
            insertRowAfter(selection?.max.row || activeCell.row);
          } else if (
            event.key === "d" &&
            (event.ctrlKey || event.metaKey) &&
            !event.altKey &&
            !event.shiftKey
          ) {
            duplicateRows(selection?.min.row || activeCell.row, selection?.max.row);
            event.preventDefault();
          } else if (
            (isPrintableUnicode(event.key) || event.code.match(/Key[A-Z]$/)) &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey
          ) {
            if (!editing && !isCellDisabled(activeCell)) {
              lastEditingCellRef.current = activeCell;
              setSelectionCell(null);
              setEditing(true);
              scrollTo(activeCell);
            }
          } else if (["Backspace", "Delete"].includes(event.key)) {
            if (!editing) {
              deleteSelection();
              event.preventDefault();
            }
          } else if (event.key === "a" && (event.ctrlKey || event.metaKey)) {
            if (!editing) {
              setActiveCell({
                col: 0,
                row: 0,
                doNotScrollY: true,
                doNotScrollX: true,
              });
              setSelectionCell({
                col: columns.length - (hasStickyRightColumn ? 3 : 2),
                row: data.length - 1,
                doNotScrollY: true,
                doNotScrollX: true,
              });
              event.preventDefault();
            }
          }
        },
        [
          activeCell,
          columns,
          data.length,
          deleteSelection,
          duplicateRows,
          editing,
          insertRowAfter,
          isCellDisabled,
          scrollTo,
          selection?.max.row,
          selection?.min.row,
          selectionCell,
          setActiveCell,
          setSelectionCell,
          stopEditing,
          hasStickyRightColumn,
          handleOnChange,
          innerRef,
        ],
      );
      useDocumentEventListener("keydown", onKeyDown);

      const onContextMenu = useCallback(
        (event: MouseEvent) => {
          const clickInside = innerRef.current?.contains(event.target as Node) || false;

          const cursorIndex = clickInside ? getCursorIndex(event, true, true) : null;

          const clickOnActiveCell =
            cursorIndex &&
            activeCell &&
            activeCell.col === cursorIndex.col &&
            activeCell.row === cursorIndex.row &&
            editing;

          if (clickInside && !clickOnActiveCell) {
            event.preventDefault();
          }
        },
        [getCursorIndex, activeCell, editing],
      );
      useDocumentEventListener("contextmenu", onContextMenu);

      useEffect(() => {
        const items: ContextMenuItem[] = [];

        if (activeCell?.row !== undefined) {
          items.push(
            {
              type: "COPY",
              action: (): void => {
                onCopy();
                setContextMenu(null);
              },
            },
            {
              type: "CUT",
              action: (): void => {
                onCut();
                setContextMenu(null);
              },
            },
            {
              type: "PASTE",
              action: async (): Promise<void> => {
                if (navigator.clipboard.read !== undefined) {
                  const items = await navigator.clipboard.read();
                  items.forEach(async (item) => {
                    let pasteData = [[""]];
                    if (item.types.includes("text/html")) {
                      const htmlTextData = await item.getType("text/html");
                      pasteData = parseTextHtmlData(await htmlTextData.text());
                    } else if (item.types.includes("text/plain")) {
                      const plainTextData = await item.getType("text/plain");
                      pasteData = parseTextPlainData(await plainTextData.text());
                    } else if (item.types.includes("text")) {
                      const htmlTextData = await item.getType("text");
                      pasteData = parseTextHtmlData(await htmlTextData.text());
                    }
                    applyPasteDataToDatasheet(pasteData);
                  });
                } else if (navigator.clipboard.readText !== undefined) {
                  const text = await navigator.clipboard.readText();
                  applyPasteDataToDatasheet(parseTextPlainData(text));
                } else {
                  alert(
                    "This action is unavailable in your browser, but you can still use Ctrl+V for paste",
                  );
                }
                setContextMenu(null);
              },
            },
          );
        }

        if (selection?.max.row !== undefined) {
          items.push({
            type: "INSERT_ROW_BELLOW",
            action: () => {
              setContextMenu(null);
              insertRowAfter(selection.max.row);
            },
          });
        } else if (activeCell?.row !== undefined) {
          items.push({
            type: "INSERT_ROW_BELLOW",
            action: () => {
              setContextMenu(null);
              insertRowAfter(activeCell.row);
            },
          });
        }

        if (selection?.min.row !== undefined && selection.min.row !== selection.max.row) {
          items.push({
            type: "DUPLICATE_ROWS",
            fromRow: selection.min.row + 1,
            toRow: selection.max.row + 1,
            action: () => {
              setContextMenu(null);
              duplicateRows(selection.min.row, selection.max.row);
            },
          });
        } else if (activeCell?.row !== undefined) {
          items.push({
            type: "DUPLICATE_ROW",
            action: () => {
              setContextMenu(null);
              duplicateRows(activeCell.row);
            },
          });
        }

        if (selection?.min.row !== undefined && selection.min.row !== selection.max.row) {
          items.push({
            type: "DELETE_ROWS",
            fromRow: selection.min.row + 1,
            toRow: selection.max.row + 1,
            action: () => {
              setContextMenu(null);
              deleteRows(selection.min.row, selection.max.row);
            },
          });
        } else if (activeCell?.row !== undefined) {
          items.push({
            type: "DELETE_ROW",
            action: () => {
              setContextMenu(null);
              deleteRows(activeCell.row);
            },
          });
        }

        setContextMenuItems(items);
        if (!items.length) {
          setContextMenu(null);
        }
      }, [
        selection,
        activeCell,
        deleteRows,
        duplicateRows,
        insertRowAfter,
        onCut,
        onCopy,
        applyPasteDataToDatasheet,
        handleOnChange,
      ]);

      const contextMenuItemsRef = useRef(contextMenuItems);
      contextMenuItemsRef.current = contextMenuItems;

      const getContextMenuItems = useCallback(() => contextMenuItemsRef.current, []);

      useImperativeHandle(ref, () => ({
        activeCell: getCellWithId(activeCell, columns),
        selection: getSelectionWithId(
          selection ?? (activeCell ? { min: activeCell, max: activeCell } : null),
          columns,
        ),
        setSelection: (value) => {
          const selection = getSelection(
            value,
            columns.length - (hasStickyRightColumn ? 2 : 1),
            data.length,
            columns,
          );

          setActiveCell(selection?.min || null);
          setEditing(false);
          setSelectionMode({ columns: false, active: false, rows: false });
          setSelectionCell(selection?.max || null);
        },
        setActiveCell: (value) => {
          const cell = getCell(
            value,
            columns.length - (hasStickyRightColumn ? 2 : 1),
            data.length,
            columns,
          );

          setActiveCell(cell);
          setEditing(false);
          setSelectionMode({ columns: false, active: false, rows: false });
          setSelectionCell(null);
        },
      }));

      const callbacksRef = useRef({
        onFocus,
        onBlur,
        onActiveCellChange,
        onSelectionChange,
      });
      callbacksRef.current.onFocus = onFocus;
      callbacksRef.current.onBlur = onBlur;
      callbacksRef.current.onActiveCellChange = onActiveCellChange;
      callbacksRef.current.onSelectionChange = onSelectionChange;

      useEffect(() => {
        if (lastEditingCellRef.current) {
          if (editing) {
            callbacksRef.current.onFocus({
              cell: getCellWithId(lastEditingCellRef.current, columns),
            });
          } else {
            callbacksRef.current.onBlur({
              cell: getCellWithId(lastEditingCellRef.current, columns),
            });
          }
        }
      }, [editing, columns]);

      useEffect(() => {
        callbacksRef.current.onActiveCellChange({
          cell: getCellWithId(activeCell, columns),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [activeCell?.col, activeCell?.row, columns]);

      useEffect(() => {
        callbacksRef.current.onSelectionChange({
          selection: getSelectionWithId(
            selection ?? (activeCell ? { min: activeCell, max: activeCell } : null),
            columns,
          ),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selection?.min.col ?? activeCell?.col,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selection?.min.row ?? activeCell?.row,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selection?.max.col ?? activeCell?.col,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selection?.max.row ?? activeCell?.row,
        activeCell?.col,
        activeCell?.row,
        columns,
      ]);

      return (
        <div className={className} style={style}>
          <div
            ref={beforeTabIndexRef}
            tabIndex={rawColumns.length && data.length ? 0 : undefined}
            onFocus={(e) => {
              e.target.blur();
              setActiveCell({ col: 0, row: 0 });
            }}
          />
          <Grid
            columns={columns}
            outerRef={outerRef as React.RefObject<HTMLDivElement>}
            columnWidths={columnWidths}
            hasStickyRightColumn={hasStickyRightColumn}
            displayHeight={"calc(100vh - 153px)"}
            data={data}
            fullWidth={fullWidth}
            headerRowHeight={headerRowHeight}
            activeCell={activeCell}
            innerRef={innerRef as React.RefObject<HTMLDivElement>}
            rowHeight={getRowSize}
            rowKey={rowKey}
            selection={selection}
            rowClassName={rowClassName}
            editing={editing}
            getContextMenuItems={getContextMenuItems}
            setRowData={setRowData}
            deleteRows={deleteRows}
            insertRowAfter={insertRowAfter}
            duplicateRows={duplicateRows}
            stopEditing={stopEditing}
            cellClassName={cellClassName}
            onScroll={onScroll}
            validationErrors={validationErrors}
          >
            <SelectionRect
              columnRights={columnRights}
              columnWidths={columnWidths}
              activeCell={activeCell}
              selection={selection}
              headerRowHeight={headerRowHeight}
              rowHeight={getRowSize}
              hasStickyRightColumn={hasStickyRightColumn}
              dataLength={data.length}
              viewHeight={height}
              viewWidth={width}
              contentWidth={fullWidth ? undefined : contentWidth}
              edges={edges}
              editing={editing}
              isCellDisabled={isCellDisabled}
              expandSelection={expandSelection}
            />
          </Grid>
          <div
            ref={afterTabIndexRef}
            tabIndex={rawColumns.length && data.length ? 0 : undefined}
            onFocus={(e) => {
              e.target.blur();
              setActiveCell({
                col: columns.length - (hasStickyRightColumn ? 3 : 2),
                row: data.length - 1,
              });
            }}
          />
          {!lockRows && AddRowsComponent && (
            <AddRowsComponent addRows={(count) => insertRowAfter(data.length - 1, count)} />
          )}
          {contextMenu && contextMenuItems.length > 0 && (
            <ContextMenuComponent
              clientX={contextMenu.x}
              clientY={contextMenu.y}
              cursorIndex={contextMenu.cursorIndex}
              items={contextMenuItems}
              close={() => setContextMenu(null)}
            />
          )}
        </div>
      );
    },
  ),
) as <T extends any>(
  props: DataSheetGridProps<T> & { ref?: React.ForwardedRef<DataSheetGridRef> },
) => React.ReactNode;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
DataSheetGrid.displayName = "DataSheetGrid";
