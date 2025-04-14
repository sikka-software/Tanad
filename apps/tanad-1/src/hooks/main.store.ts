import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Pukla } from "@/lib/types";

interface MainStoreState {
  puklas: Pukla[];
  setPuklas: (puklas: Pukla[]) => void;
  selectedPukla: Pukla | null;
  setSelectedPukla: (pukla: Pukla) => void;
  itemAction: {
    id: string;
    action: string | null;
  } | null;
  setItemAction: (id: string, action: string | null) => void;
  urlTooLong: boolean;
  setUrlTooLong: (urlTooLong: boolean) => void;
  linkContentHeight: { id: string; height: number };
  setLinkContentHeight: (contentHeight: { id: string; height: number }) => void;
  headerContentHeight: { id: string; height: number };
  setHeaderContentHeight: (contentHeight: {
    id: string;
    height: number;
  }) => void;
}

export const useMainStore = create<MainStoreState>()(
  persist(
    (set) => ({
      puklas: [],
      setPuklas: (puklas) => set({ puklas }),
      selectedPukla: null,
      setSelectedPukla: (pukla: Pukla) => {
        set({ selectedPukla: pukla });
      },
      itemAction: null,
      setItemAction: (id, action) => set({ itemAction: { id, action } }),
      urlTooLong: false,
      setUrlTooLong: (urlTooLong) => set({ urlTooLong }),
      linkContentHeight: { id: "", height: 0 },
      setLinkContentHeight: (linkContentHeight) => set({ linkContentHeight }),
      headerContentHeight: { id: "", height: 0 },
      setHeaderContentHeight: (headerContentHeight) =>
        set({ headerContentHeight }),
    }),
    {
      name: "main-store",
      partialize: (state) => ({
        selectedPukla: state.selectedPukla,
      }),
      // onRehydrateStorage: () => (state) => {
      //   console.log('Rehydrated main store:', state); // Debug log
      // },
    },
  ),
);

export default useMainStore;
