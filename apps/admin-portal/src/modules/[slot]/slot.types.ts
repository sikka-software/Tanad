// This is a template so that anytime we're creating a new module we can copy this code and replace a few things

export interface SLOT {
  id: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type SLOTCreateData = Omit<SLOT, "id" | "created_at" | "updated_at"> & {
  user_id?: string;
};

export type SLOTUpdateData = Partial<SLOT>;
