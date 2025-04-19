import { create } from "zustand";

import { Branch } from "@/modules/branch/branch.type";
import { updateBranch as updateBranchService } from "@/services/branch.service";

interface BranchesStore {
  selectedRows: string[];
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
  updateBranch: (id: string, data: Partial<Branch>) => Promise<void>;
}

export const useBranchesStore = create<BranchesStore>((set) => ({
  selectedRows: [],
  
  setSelectedRows: (ids: string[]) => {
    set((state) => {
      // Only update if the selection has actually changed
      if (JSON.stringify(state.selectedRows) === JSON.stringify(ids)) {
        return state;
      }
      return { ...state, selectedRows: ids };
    });
  },
  
  clearSelection: () => {
    set((state) => {
      // Only update if there are actually selected rows
      if (state.selectedRows.length === 0) {
        return state;
      }
      return { ...state, selectedRows: [] };
    });
  },

  updateBranch: async (id: string, data: Partial<Branch>) => {
    try {
      await updateBranchService(id, data);
    } catch (error) {
      console.error("Error updating branch:", error);
      throw error;
    }
  },
})); 