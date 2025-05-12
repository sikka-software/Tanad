import { create } from "zustand";

interface DashboardStore {
  viewMode: "vertical" | "horizontal";
  setViewMode: (viewMode: "vertical" | "horizontal") => void;
}

const useDashboardStore = create<DashboardStore>((set) => ({
  viewMode: "vertical",
  setViewMode: (viewMode) => set({ viewMode }),
}));

export default useDashboardStore;
