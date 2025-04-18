import { create } from "zustand";

import { Company } from "@/types/company.type";

interface CompaniesState {
  companies: Company[];
  selectedRows: string[];
  isLoading: boolean;
  error: string | null;
  fetchCompanies: () => Promise<void>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
}

const useCompaniesStore = create<CompaniesState>((set) => ({
  companies: [],
  selectedRows: [],
  isLoading: false,
  error: null,

  fetchCompanies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/companies");
      if (!response.ok) throw new Error("Failed to fetch companies");
      const data = await response.json();
      set({ companies: data as Company[], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateCompany: async (id: string, updates: Partial<Company>) => {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update company");

      set((state) => ({
        companies: state.companies.map((company) =>
          company.id === id ? { ...company, ...updates } : company,
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

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
}));

export default useCompaniesStore;
