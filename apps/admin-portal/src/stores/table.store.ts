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
  // Future: add order, sizing, etc.
};

export const useTableStore = create<TableUIState>()(
  persist(
    (set, get) => ({
      columnVisibility: {},
      setColumnVisibility: (visibility: VisibilityState) => set({ columnVisibility: visibility }),
      // Future: add order, sizing, etc.
    }),
    {
      name: "table-ui-state", // localStorage key
      partialize: (state) => ({ columnVisibility: state.columnVisibility }),
    },
  ),
);
