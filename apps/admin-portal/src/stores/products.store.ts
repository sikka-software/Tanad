import { create } from "zustand";

import { supabase } from "@/lib/supabase";

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  stock_quantity?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  userId: string;
};

type ProductsStore = {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (product: Omit<Product, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
};

export const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
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
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from("products")
        .insert([product])
        .select()
        .single();

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
})); 