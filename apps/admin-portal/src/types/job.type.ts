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
  created_at: string;
  updated_at: string;
  user_id: string;
}
