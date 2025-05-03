import { create } from "zustand";

import type { ActivityLogListData } from "./activity.type";

interface ActivityLogStore {
  isDialogOpen: boolean;
  selectedLog: ActivityLogListData | null;
  openDialog: (log: ActivityLogListData) => void;
  closeDialog: () => void;
}

export const useActivityLogStore = create<ActivityLogStore>((set) => ({
  isDialogOpen: false,
  selectedLog: null,
  openDialog: (log) => set({ isDialogOpen: true, selectedLog: log }),
  closeDialog: () => set({ isDialogOpen: false, selectedLog: null }),
})); 