// Table UI state store (column visibility, order, sizing, etc.)
// Uses Zustand with localStorage persistence.
// Usage:
//   const { columnVisibility, setColumnVisibility } = useTableStore((s) => ({ ... }))
//   setColumnVisibility(tableId, { colA: false, colB: true })

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export type ColumnVisibility = Record<string, boolean>;
export type TableUIState = {
  columnVisibility: Record<string, ColumnVisibility>; // tableId -> { colId: visible }
  setColumnVisibility: (tableId: string, visibility: ColumnVisibility) => void;
  // Future: add order, sizing, etc.
};

export const useTableStore = create<TableUIState>()(
  persist(
    (set, get) => ({
      columnVisibility: {},
      setColumnVisibility: (tableId, visibility) =>
        set((state) => ({
          columnVisibility: {
            ...state.columnVisibility,
            [tableId]: visibility,
          },
        })),
      // Future: add order, sizing, etc.
    }),
    {
      name: "table-ui-state", // localStorage key
      partialize: (state) => ({ columnVisibility: state.columnVisibility }),
    },
  ),
); 