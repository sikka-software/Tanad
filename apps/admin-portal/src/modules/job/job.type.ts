import { Database } from "@/lib/database.types";

export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type JobCreateData = Database["public"]["Tables"]["jobs"]["Insert"];
export type JobUpdateData = Database["public"]["Tables"]["jobs"]["Update"];
