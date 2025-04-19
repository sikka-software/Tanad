import { create } from "zustand";

import { Job } from "@/types/job.type";

import { createClient } from "@/utils/supabase/component";

type JobStates = {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  selectedRows: string[];
};

type JobActions = {
  fetchJobs: () => Promise<void>;
  updateJob: (id: string, data: Partial<Job>) => Promise<void>;
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
};

export const useJobsStore = create<JobStates & JobActions>((set) => ({
  jobs: [],
  isLoading: false,
  error: null,
  selectedRows: [],
  fetchJobs: async () => {
    const supabase = createClient();
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from("jobs").select("*");
      if (error) throw error;
      set({ jobs: data as Job[], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  updateJob: async (id: string, updates: Partial<Job>) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from("jobs").update(updates).eq("id", id);

      if (error) throw error;

      set((state) => ({
        jobs: state.jobs.map((job) => (job.id === id ? { ...job, ...updates } : job)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

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
