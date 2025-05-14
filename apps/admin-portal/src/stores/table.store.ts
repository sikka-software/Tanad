// Table UI state store (column visibility, order, sizing, etc.)
// Uses Zustand with localStorage persistence.
// Usage:
//   const { columnVisibility, setColumnVisibility } = useTableStore((s) => ({ ... }))
//   setColumnVisibility(tableId, { colA: false, colB: true })
import { VisibilityState } from "@tanstack/react-table";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export type TableUIState = {
  columnVisibility: VisibilityState;
  setColumnVisibility: (visibility: VisibilityState) => void;
  // Cell editing state
  cellErrors: Record<string, Record<string, Record<string, Record<string, string | null>>>>; // tableId -> groupKey -> rowId -> colKey -> error
  setCellError: (tableId: string, groupKey: string, rowId: string, colKey: string, error: string | null) => void;
  cellOriginalContent: Record<string, Record<string, Record<string, Record<string, string>>>>; // tableId -> groupKey -> rowId -> colKey -> value
  setCellOriginalContent: (tableId: string, groupKey: string, rowId: string, colKey: string, value: string) => void;
  // Future: add order, sizing, etc.
};

export const useTableStore = create<TableUIState>()(
  persist(
    (set, get) => ({
      columnVisibility: {},
      setColumnVisibility: (visibility: VisibilityState) => set({ columnVisibility: visibility }),
      // Cell editing state
      cellErrors: {},
      setCellError: (tableId, groupKey, rowId, colKey, error) => set((state) => {
        const prev = { ...state.cellErrors };
        if (!prev[tableId]) prev[tableId] = {};
        if (!prev[tableId][groupKey]) prev[tableId][groupKey] = {};
        if (!prev[tableId][groupKey][rowId]) prev[tableId][groupKey][rowId] = {};
        prev[tableId][groupKey][rowId][colKey] = error;
        return { cellErrors: prev };
      }),
      cellOriginalContent: {},
      setCellOriginalContent: (tableId, groupKey, rowId, colKey, value) => set((state) => {
        const prev = { ...state.cellOriginalContent };
        if (!prev[tableId]) prev[tableId] = {};
        if (!prev[tableId][groupKey]) prev[tableId][groupKey] = {};
        if (!prev[tableId][groupKey][rowId]) prev[tableId][groupKey][rowId] = {};
        prev[tableId][groupKey][rowId][colKey] = value;
        return { cellOriginalContent: prev };
      }),
      // Future: add order, sizing, etc.
    }),
    {
      name: "table-ui-state", // localStorage key
      partialize: (state) => ({ columnVisibility: state.columnVisibility }),
    },
  ),
);
