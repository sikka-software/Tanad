import { create } from "zustand";

import { Job } from "@/types/job.type";

interface JobsState {
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  updateJob: (id: string, data: Partial<Job>) => Promise<void>;
  selectedRows: string[];
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useJobsStore = create<JobsState>((set) => ({
  jobs: [],
  setJobs: (jobs) => set({ jobs }),
  updateJob: async (id, data) => {
    // TODO: Implement API call to update job
    set((state) => ({
      jobs: state.jobs.map((job) => (job.id === id ? { ...job, ...data } : job)),
    }));
  },
  selectedRows: [],

  setSelectedRows: (ids: string[]) => {
    set((state) => {
      if (JSON.stringify(state.selectedRows) === JSON.stringify(ids)) {
        return state;
      }
      return { ...state, selectedRows: ids };
    });
  },

  clearSelection: () => {
    set((state) => {
      if (state.selectedRows.length === 0) {
        return state;
      }
      return { ...state, selectedRows: [] };
    });
  },
}));
