import { create } from "zustand";

interface JobListingsStore {
  selectedRows: string[];
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
}

const useJobListingsStore = create<JobListingsStore>((set) => ({
  selectedRows: [],

  setSelectedRows: (ids: string[]) => {
    set((state) => {
      if (JSON.stringify(state.selectedRows) === JSON.stringify(ids)) {
        return state;
      }
      return { ...state, selectedRows: ids };
    });
  },

  clearSelection: () => {
    set((state) => {
      if (state.selectedRows.length === 0) return state;
      return { ...state, selectedRows: [] };
    });
  },
}));

export default useJobListingsStore; 