import { create } from "zustand";

import { applyFilters } from "@/lib/filter-utils";
import { applySort } from "@/lib/sort-utils";

import { FilterCondition } from "@/types/common.type";

import { Invoice } from "@/modules/invoice/invoice.type";
import { Job } from "@/modules/job/job.type";
import { createClient } from "@/utils/supabase/component";

type InvoiceStates = {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  selectedRows: string[];
  filterConditions: FilterCondition[];
  filterCaseSensitive: boolean;
  searchQuery: string;
  viewMode: "table" | "cards";
  isDeleteDialogOpen: boolean;
  sortRules: { field: string; direction: string }[];
  sortCaseSensitive: boolean;
  sortNullsFirst: boolean;
};

type InvoiceActions = {
  fetchInvoices: () => Promise<void>;
  createInvoice: (invoice: Omit<Invoice, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
  setFilterConditions: (filterConditions: FilterCondition[]) => void;
  setFilterCaseSensitive: (filterCaseSensitive: boolean) => void;
  setSearchQuery: (searchQuery: string) => void;
  setViewMode: (viewMode: "table" | "cards") => void;
  setIsDeleteDialogOpen: (isDeleteDialogOpen: boolean) => void;
  setSortRules: (sortRules: { field: string; direction: string }[]) => void;
  setSortCaseSensitive: (sortCaseSensitive: boolean) => void;
  setSortNullsFirst: (sortNullsFirst: boolean) => void;
  getFilteredInvoices: (data: Invoice[]) => Invoice[];
  getSortedInvoices: (data: Invoice[]) => Invoice[];
};

export const useInvoiceStore = create<InvoiceStates & InvoiceActions>((set, get) => ({
  invoices: [],
  isLoading: false,
  error: null,
  selectedRows: [],

  filterConditions: [],
  filterCaseSensitive: false,
  searchQuery: "",
  viewMode: "table",
  isDeleteDialogOpen: false,
  sortRules: [],
  sortCaseSensitive: false,
  sortNullsFirst: false,

  getFilteredInvoices: (data: Invoice[]) => {
    const { searchQuery, filterConditions, filterCaseSensitive } = get();

    // If no data, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // First apply search if there is a search query
    let filtered = data;
    if (searchQuery) {
      filtered = filtered.filter((invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Then apply other filters if there are any
    if (filterConditions.length > 0) {
      filtered = applyFilters(filtered, filterConditions, filterCaseSensitive);
    }

    return filtered;
  },

  getSortedInvoices: (data: Invoice[]) => {
    const { sortRules, sortCaseSensitive, sortNullsFirst } = get();

    return applySort("invoices", data, sortRules, {
      caseSensitive: sortCaseSensitive,
      nullsFirst: sortNullsFirst,
    });
  },
  setSortRules: (sortRules: { field: string; direction: string }[]) => {
    set({ sortRules });
  },

  setSortCaseSensitive: (sortCaseSensitive: boolean) => {
    set({ sortCaseSensitive });
  },

  setSortNullsFirst: (sortNullsFirst: boolean) => {
    set({ sortNullsFirst });
  },

  setFilterConditions: (filterConditions: FilterCondition[]) => {
    set({ filterConditions });
  },

  setFilterCaseSensitive: (filterCaseSensitive: boolean) => {
    set({ filterCaseSensitive });
  },

  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery });
  },

  setViewMode: (viewMode: "table" | "cards") => {
    set({ viewMode });
  },

  setIsDeleteDialogOpen: (isDeleteDialogOpen: boolean) => {
    set({ isDeleteDialogOpen });
  },
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
      if (state.selectedRows.length === 0) {
        return state;
      }
      return { ...state, selectedRows: [] };
    });
  },

  fetchInvoices: async () => {
    const supabase = createClient();
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from("invoices")
        .select("*, client:clients(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ invoices: data as Invoice[], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createInvoice: async (invoice) => {
    const supabase = createClient();
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from("invoices")
        .insert([invoice])
        .select("*, client:clients(*)")
        .single();

      if (error) throw error;

      set((state) => ({
        invoices: [data as Invoice, ...state.invoices],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateInvoice: async (id, invoice) => {
    const supabase = createClient();
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from("invoices")
        .update(invoice)
        .eq("id", id)
        .select("*, client:clients(*)")
        .single();

      if (error) throw error;

      set((state) => ({
        invoices: state.invoices.map((i) => (i.id === id ? (data as Invoice) : i)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteInvoice: async (id) => {
    const supabase = createClient();
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.from("invoices").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        invoices: state.invoices.filter((i) => i.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));

// type InvoicesStore = {
//   invoices: Invoice[];
//   isLoading: boolean;
//   error: string | null;
//   fetchInvoices: () => Promise<void>;
//   createInvoice: (invoice: Omit<Invoice, "id" | "created_at" | "updated_at">) => Promise<void>;
//   updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
//   deleteInvoice: (id: string) => Promise<void>;
// };
