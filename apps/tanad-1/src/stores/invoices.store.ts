import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { Invoice } from "@/types/invoice.type";

type InvoicesStore = {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
  createInvoice: (invoice: Omit<Invoice, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
};

export const useInvoicesStore = create<InvoicesStore>((set, get) => ({
  invoices: [],
  isLoading: false,
  error: null,

  fetchInvoices: async () => {
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