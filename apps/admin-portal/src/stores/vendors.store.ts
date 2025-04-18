import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Vendor, VendorCreateData, VendorUpdateData } from "@/types/vendor";

interface VendorsStore {
  vendors: Vendor[];
  isLoading: boolean;
  error: string | null;
  fetchVendors: () => Promise<void>;
  createVendor: (data: VendorCreateData) => Promise<void>;
  updateVendor: (id: string, data: VendorUpdateData) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
}

export const useVendorsStore = create<VendorsStore>()(
  devtools(
    (set) => ({
      vendors: [],
      isLoading: false,
      error: null,

      fetchVendors: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/vendors");
          if (!response.ok) {
            throw new Error("Failed to fetch vendors");
          }
          const vendors = await response.json();
          set({ vendors, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      createVendor: async (data: VendorCreateData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/vendors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!response.ok) {
            throw new Error("Failed to create vendor");
          }
          const newVendor = await response.json();
          set((state) => ({
            vendors: [...state.vendors, newVendor],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateVendor: async (id: string, data: VendorUpdateData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/vendors/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!response.ok) {
            throw new Error("Failed to update vendor");
          }
          const updatedVendor = await response.json();
          set((state) => ({
            vendors: state.vendors.map((vendor) =>
              vendor.id === id ? updatedVendor : vendor
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      deleteVendor: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/vendors/${id}`, {
            method: "DELETE",
          });
          if (!response.ok) {
            throw new Error("Failed to delete vendor");
          }
          set((state) => ({
            vendors: state.vendors.filter((vendor) => vendor.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
    }),
    { name: "vendors-store" }
  )
); 