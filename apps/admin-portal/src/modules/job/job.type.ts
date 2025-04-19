export interface Job {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  location: string | null;
  department: string | null;
  type: string;
  salary: number | null;
  is_active: boolean;
  startDate: string | null;
  endDate: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export type JobCreateData = Omit<Job, "id" | "created_at" | "updated_at" | "user_id"> & {
  user_id?: string;
};
