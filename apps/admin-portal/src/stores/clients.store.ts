import { create } from "zustand";

import { Client } from "@/types/client.type";

import { createClient } from "@/utils/supabase/component";

interface ClientsState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
}

export const useClientsStore = create<ClientsState>((set) => ({
  clients: [],
  isLoading: false,
  error: null,

  fetchClients: async () => {
    const supabase = createClient();
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      set({ clients: data as Client[], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateClient: async (id: string, updates: Partial<Client>) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from("clients").update(updates).eq("id", id);

      if (error) throw error;

      set((state) => ({
        clients: state.clients.map((client) =>
          client.id === id ? { ...client, ...updates } : client,
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
