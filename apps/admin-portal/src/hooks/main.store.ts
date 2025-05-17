import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MainStoreState {
  openCommandMenu: boolean;
  setOpenCommandMenu: (openCommandMenu: boolean) => void;
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
  setHeaderContentHeight: (contentHeight: { id: string; height: number }) => void;
}

export const useMainStore = create<MainStoreState>()(
  persist(
    (set) => ({
      openCommandMenu: false,
      setOpenCommandMenu: (openCommandMenu: boolean) => set({ openCommandMenu }),

      itemAction: null,
      setItemAction: (id, action) => set({ itemAction: { id, action } }),
      urlTooLong: false,
      setUrlTooLong: (urlTooLong) => set({ urlTooLong }),
      linkContentHeight: { id: "", height: 0 },
      setLinkContentHeight: (linkContentHeight) => set({ linkContentHeight }),
      headerContentHeight: { id: "", height: 0 },
      setHeaderContentHeight: (headerContentHeight) => set({ headerContentHeight }),
    }),
    {
      name: "main-store",
      partialize: (state) => ({}),
      // onRehydrateStorage: () => (state) => {
      //   console.log('Rehydrated main store:', state); // Debug log
      // },
    },
  ),
);

export default useMainStore;
