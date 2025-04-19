import { create } from "zustand";

import { createClient } from "@/utils/supabase/component";

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  stock_quantity?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
};

type ProductsStore = {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  selectedRows: string[];
  fetchProducts: () => Promise<void>;
  createProduct: (
    product: Omit<Product, "id" | "user_id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
  setSelectedRows: (rows: string[]) => void;
  clearSelection: () => void;
};

const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  selectedRows: [],

  fetchProducts: async () => {
    const supabase = createClient();
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ products: data as Product[], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createProduct: async (product) => {
    const supabase = createClient();
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.from("products").insert([product]).select().single();

      if (error) throw error;

      set((state) => ({
        products: [data as Product, ...state.products],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateProduct: async (id, product) => {
    const supabase = createClient();
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? (data as Product) : p)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteProduct: async (id) => {
    const supabase = createClient();
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  bulkDeleteProducts: async (ids: string[]) => {
    const supabase = createClient();
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.from("products").delete().in("id", ids);

      if (error) throw error;

      set((state) => ({
        products: state.products.filter((p) => !ids.includes(p.id)),
        isLoading: false,
        selectedRows: state.selectedRows.filter((id) => !ids.includes(id)),
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setSelectedRows: (rows: string[]) => {
    set({ selectedRows: rows });
  },

  clearSelection: () => {
    set({ selectedRows: [] });
  },
}));

export default useProductsStore;
