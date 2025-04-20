import { createGenericStore } from "@/utils/generic-store";

import { Job } from "./job.type";

const searchJobFn = (job: Job, searchQuery: string) =>
  job.title.toLowerCase().includes(searchQuery.toLowerCase());

const useJobStore = createGenericStore<Job>("jobs", searchJobFn);

export default useJobStore;
