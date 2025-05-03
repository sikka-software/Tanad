import { create } from "zustand";
import { DateRange } from "react-day-picker";

import type { ActivityLogListData } from "./activity.type";

// Export the interface
export interface ActivityFilters {
  searchQuery: string;
  date: Date | undefined;
  eventType: string;
  user: string[];
  timeRange: string;
  dateRange?: DateRange;
}

interface ActivityLogStore {
  isDialogOpen: boolean;
  selectedLog: ActivityLogListData | null;
  openDialog: (log: ActivityLogListData) => void;
  closeDialog: () => void;
  filters: ActivityFilters;
  setFilters: (filters: Partial<ActivityFilters>) => void;
  clearFilters: () => void;
}

const initialFilters: ActivityFilters = {
  searchQuery: "",
  date: undefined,
  eventType: "all",
  user: [],
  timeRange: "all",
};

export const useActivityLogStore = create<ActivityLogStore>((set) => ({
  isDialogOpen: false,
  selectedLog: null,
  openDialog: (log) => set({ isDialogOpen: true, selectedLog: log }),
  closeDialog: () => set({ isDialogOpen: false, selectedLog: null }),
  filters: initialFilters,
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  clearFilters: () => set({ filters: initialFilters }),
}));
