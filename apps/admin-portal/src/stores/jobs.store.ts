import { create } from "zustand";

import { Job } from "@/types/job.type";

interface JobsState {
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  updateJob: (id: string, data: Partial<Job>) => Promise<void>;
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
})); 