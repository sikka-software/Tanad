import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { persist } from "zustand/middleware";

import {
  HeaderItemProps,
  LinkItemProps,
  LinkTypes,
  PuklaThemeProps,
} from "@/lib/types";

interface LinksState {
  currentPukla: any;
  setCurrentPukla: (pukla: any) => void;
  /* All links and headers of a Pukla */
  puklaItems: LinkItemProps[];

  /* Set a new pukla items array to the current one */
  setPuklaItems: (
    items: LinkItemProps[] | ((current: LinkItemProps[]) => LinkItemProps[]),
  ) => void;

  /* Boolean for the new item box expansion status */
  isNewItemBoxExpanded: boolean;
  /* Open/Close the new item box expansion status */
  setNewItemBoxExpanded: () => void;
  setBoxExpansion: (bool: boolean) => void;

  newLinkType: LinkTypes;
  setNewLinkType: (value: any) => void;
  isLinkLoading?: string;
  isDragging: boolean;
  currentAction: any;
  toggleExpandItem: (id: string) => void;
  toggleEditItem: (id: string) => void;

  setIsDragging: (value: boolean) => void;
  updateLinkTitle: (id: string, newTitle: string) => void;
  updateLinkURL: (id: string, newURL: string) => void;
  handleAction: (id: string, action: string) => void;
  handleClearAction: () => void;
  handleAddHeader: (newHeader: any) => void;
  handleEditDone: (id: string) => void;
  handleChangeTitle: (id: string, value: string) => void;
  handleChangeURL: (id: string, value: string) => void;
  handleDelete: (
    id: string,
    puklaId: string,
    item_type?: string,
  ) => Promise<void>;
  handleDisableLink: (
    id: string,
    puklaId: string,
    disableLinkHandler: any,
  ) => Promise<void>;
  handleSortLinks: (e: any[], puklaId: string, sortLinks: any) => Promise<void>;

  setCurrentAction: (id: any, action: any) => void;
  // Loading Setters
  setLoadingCreate: (value: boolean) => void;
  setLoadingDelete: (id: string) => void;
  setLoadingUpdate: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  // Loading Getters
  loading: boolean;
  loadingCreate: boolean;
  loadingDelete: string | null;
  loadingUpdate: boolean;

  isUpdatingStatus: boolean;
  setIsUpdatingStatus: (value: boolean) => void;

  updatingStatusId: string | null;
  setUpdatingStatusId: (id: string | null) => void;

  customTheme: PuklaThemeProps;
  setCustomTheme: (theme: PuklaThemeProps) => void;
}

export const usePuklaStore = create<LinksState>()(
  persist(
    (set, get) => ({
      puklaItems: [],
      currentPukla: null,
      setCurrentPukla: (pukla) => {
        set({
          currentPukla: pukla,
          customTheme: pukla?.theme || {
            background_color: "#ffffff",
            text_color: "#000000",
            button_color: "#000000",
            button_text_color: "#ffffff",
            button_hover_color: "#333333",
            link_color: "#000000",
            primary_color: "#000000",
            button_border_color: "#000000",
            border_color: "#000000",
            border_radius: "8px",
            is_free: true,
            theme_name: "Custom",
          },
        });
      },

      setPuklaItems: (items) => {
        set((state) => ({
          puklaItems:
            typeof items === "function" ? items(state.puklaItems) : items,
        }));
      },

      loadingCreate: false,
      setLoadingCreate: (value: boolean) => set({ loadingCreate: value }),

      loadingDelete: null,
      setLoadingDelete: (id: any) => set({ loadingDelete: id }),

      loadingUpdate: false,
      setLoadingUpdate: (value: any) => set({ loadingUpdate: value }),

      loading: false,
      setLoading: (value: any) => set({ loading: value }),

      newLinkType: "undecided",
      setNewLinkType: (value: any) => set({ newLinkType: value }),

      isDragging: false,
      isNewItemBoxExpanded: false,
      setNewItemBoxExpanded: () => {
        let currentExpandedState = get().isNewItemBoxExpanded;
        set({ isNewItemBoxExpanded: !currentExpandedState });
      },
      setBoxExpansion: (bool: boolean) => {
        set(() => ({ isNewItemBoxExpanded: bool }));
      },
      // Other state variables if needed
      updateLinkTitle: (id, newTitle) => {
        set((state) => ({
          puklaItems: state.puklaItems.map((item) =>
            item.id === id ? { ...item, title: newTitle } : item,
          ),
        }));
      },

      updateLinkURL: (id, newURL) => {
        set((state) => ({
          puklaItems: state.puklaItems.map((item) =>
            item.id === id ? { ...item, url: newURL } : item,
          ),
        }));
      },

      setIsDragging: (value: any) => set({ isDragging: value }),
      setCurrentAction: (id: any, action: any) => {
        set((state) => ({
          currentAction: {
            ...state.currentAction,
            [id]: state.currentAction[id] === action ? null : action,
          },
        }));
      },

      currentAction: {},

      handleAction: (id, action) => {
        set((state) => {
          const isSameActionSelected = state.currentAction[id] === action;
          const newCurrentAction = isSameActionSelected ? null : action;

          const updatedItems = state.puklaItems.map((item) => {
            if (item.id === id) {
              let newItem = { ...item };
              if (action === "highlight") {
                newItem.is_favorite = !item.is_favorite;
              }
              newItem.is_expanded = isSameActionSelected
                ? !item.is_expanded
                : true;
              return newItem;
            }
            return item;
          });

          return {
            puklaItems: updatedItems,
            currentAction: {
              ...state.currentAction,
              [id]: newCurrentAction,
            },
          };
        });
      },
      handleClearAction: () => {
        set((state) => ({
          currentAction: {},
        }));
      },
      //   handleAction: (id, action) => {
      //     set((state) => {
      //       const newCurrentAction =
      //         state.currentAction[id] === action ? null : action;

      //       const updatedItems = state.items.map((item) => {
      //         if (item.id === id) {
      //           switch (action) {
      //             case "highlight":
      //               return {
      //                 ...item,
      //                 is_favorite: !item.is_favorite,
      //                 is_expanded: true
      //               };
      //             default:
      //               return { ...item, is_expanded: !item.is_expanded };
      //           }
      //         }
      //         return item;
      //       });

      //       return {
      //         items: updatedItems,
      //         currentAction: {
      //           ...state.currentAction,
      //           [id]: newCurrentAction
      //         }
      //       };
      //     });
      //   },

      handleAddHeader: (newHeader) => {
        // let randomSeed = Math.floor(Math.random() * 20) / 2
      },
      handleEditDone: (id: string) => {
        set((state) => ({
          puklaItems: state.puklaItems.map((item) =>
            item.id === id ? { ...item, is_editing: false } : item,
          ),
        }));
      },
      handleChangeTitle: (id, value: string) => {
        // setPuklaItems((currentItems) =>
        //   currentItems.map((item) => {
        //     if (item.id === id) {
        //       return { ...item, title: value };
        //     }
        //     return item;
        //   })
        // );
        const updatedItems = get().puklaItems.map((item) =>
          item.id === id ? { ...item, is_editing: false } : item,
        );
        set({ puklaItems: updatedItems });
        // set((state) => ({
        //   items: state.items.map((item) =>
        //     item.id === id ? { ...item, title: value } : item
        //   )
        // }));
      },
      handleChangeURL: (id, value) => {
        // setPuklaItems((currentItems) =>
        //   currentItems.map((item) => {
        //     if (item.id === id) {
        //       return { ...item, url: value };
        //     }
        //     return item;
        //   })
        // );

        set((state) => ({
          puklaItems: state.puklaItems.map((item) =>
            item.id === id ? { ...item, url: value } : item,
          ),
        }));
      },
      handleDisableLink: async (id, puklaId, disableLinkHandler) => {
        try {
          set({ isLinkLoading: id });

          await disableLinkHandler(id, puklaId);
          set((state) => ({
            puklaItems: state.puklaItems.map((item) =>
              item.id === id ? { ...item, is_enabled: !item.is_enabled } : item,
            ),
          }));
          set({ isLinkLoading: "" });
        } catch (error) {
          console.error("(store) Error disabling link", error);
        }
      },
      handleDelete: async (id: string, puklaId: string, item_type?: string) => {
        try {
          set({ loadingUpdate: true, loadingDelete: id });

          // Delete from Supabase
          const { error } = await supabase
            .from("pukla_links")
            .delete()
            .eq("id", id);

          if (error) throw error;

          // Update local state
          set((state) => ({
            puklaItems: state.puklaItems.filter((item) => item.id !== id),
            loadingDelete: "",
            loadingUpdate: false,
          }));
        } catch (error) {
          console.error("Error deleting item:", error);
          set({ loadingDelete: null, loadingUpdate: false });
          throw error;
        }
      },

      toggleExpandItem: (id) => {
        const isDragging = get().isDragging;
        if (!isDragging) {
          set((state) => ({
            puklaItems: state.puklaItems.map((item) =>
              item.id === id
                ? { ...item, is_expanded: !item.is_expanded }
                : item,
            ),
          }));
          // set({ currentAction: "" });
        }
      },
      toggleEditItem: (id) => {
        const isDragging = get().isDragging;
        set((state) => {
          if (!isDragging) {
            return {
              puklaItems: state.puklaItems.map((item) =>
                item.id === id
                  ? { ...item, is_editing: !item.is_editing }
                  : item,
              ),
              loadingUpdate: false,
            };
          }
          return { loadingUpdate: false };
        });
      },
      handleSortLinks: async (e, puklaId, sortLinks) => {
        set({ puklaItems: e });
        const ids = e.map((item) => item.id);

        await sortLinks(puklaId, ids);
      },

      isUpdatingStatus: false,
      setIsUpdatingStatus: (value: boolean) => set({ isUpdatingStatus: value }),

      updatingStatusId: null,
      setUpdatingStatusId: (id) => set({ updatingStatusId: id }),

      customTheme: {
        background_color: "#ffffff",
        text_color: "#000000",
        button_color: "#000000",
        button_text_color: "#ffffff",
        button_hover_color: "#333333",
        link_color: "#000000",
        primary_color: "#000000",
        button_border_color: "#000000",
        border_color: "#000000",
        border_radius: "8px",
        is_free: true,
        theme_name: "Custom",
      },
      setCustomTheme: (theme: PuklaThemeProps) => {
        set({ customTheme: theme });
      },
    }),
    {
      name: "pukla-store",
      partialize: (state) => {
        return {
          customTheme: state.customTheme,
          currentPukla: state.currentPukla,
        };
      },
      // onRehydrateStorage: () => (state) => {
      //   console.log('Rehydrated state:', state); // Debug log
      // },
    },
  ),
);
