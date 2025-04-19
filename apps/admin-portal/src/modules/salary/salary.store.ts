import { create } from "zustand";

import { Salary } from "@/modules/salary/salary.type";
import { deleteSalary, updateSalary as updateSalaryService } from "@/modules/salary/salary.service";

interface SalariesStore {
  selectedRows: string[];
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
  updateSalary: (id: string, data: Partial<Salary>) => Promise<void>;
  deleteSalary: (id: string) => Promise<void>;
  bulkDeleteSalaries: (ids: string[]) => Promise<void>;
}

export const useSalariesStore = create<SalariesStore>((set) => ({
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

  updateSalary: async (id: string, data: Partial<Salary>) => {
    try {
      await updateSalaryService(id, data);
    } catch (error) {
      console.error("Failed to update salary:", error);
      throw error;
    }
  },

  deleteSalary: async (id: string) => {
    try {
      await deleteSalary(id);
    } catch (error) {
      console.error("Failed to delete salary:", error);
      throw error;
    }
  },

  bulkDeleteSalaries: async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => deleteSalary(id)));
    } catch (error) {
      console.error("Failed to delete salaries:", error);
      throw error;
    }
  },
})); 