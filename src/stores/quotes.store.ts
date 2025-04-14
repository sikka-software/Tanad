import { create } from "zustand";

import { supabase } from "@/lib/supabase";
import { Quote } from "@/types/quote.type";

interface QuotesStore {
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<void>;
}

export const useQuotesStore = create<QuotesStore>((set) => ({
  updateQuote: async (id: string, updates: Partial<Quote>) => {
    const { error } = await supabase.from("quotes").update(updates).eq("id", id);

    if (error) {
      throw new Error(`Failed to update quote: ${error.message}`);
    }
  },
}));
