import { create } from "zustand";

import { Quote } from "@/types/quote.type";

import { createClient } from "@/utils/supabase/component";

interface QuotesStore {
  selectedRows: string[];
  setSelectedRows: (rows: string[]) => void;
  clearSelection: () => void;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<void>;
  deleteQuotes: (ids: string[]) => Promise<void>;
}

export const useQuotesStore = create<QuotesStore>((set) => ({
  selectedRows: [],
  setSelectedRows: (rows) => {
    set((state) => {
      if (JSON.stringify(state.selectedRows) === JSON.stringify(rows)) {
        return state;
      }
      return { selectedRows: rows };
    });
  },
  clearSelection: () => set({ selectedRows: [] }),
  updateQuote: async (id: string, updates: Partial<Quote>) => {
    const supabase = createClient();
    const { error } = await supabase.from("quotes").update(updates).eq("id", id);

    if (error) {
      throw new Error(`Failed to update quote: ${error.message}`);
    }
  },
  deleteQuotes: async (ids: string[]) => {
    const supabase = createClient();
    const { error } = await supabase.from("quotes").delete().in("id", ids);

    if (error) {
      throw new Error(`Failed to delete quotes: ${error.message}`);
    }
  },
}));
