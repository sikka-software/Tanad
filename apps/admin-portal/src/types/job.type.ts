export interface Job {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  location?: string;
  department?: string;
  type: string;
  salary?: number;
  is_active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  user_id: string;
  user_id?: string;
}
