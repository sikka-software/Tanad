import { User as SupabaseUser } from "@supabase/auth-js";

export interface ExtendedUser extends SupabaseUser {
  stripe_customer_id?: string;
  profile?: {
    id: string;
    stripe_customer_id?: string;
    [key: string]: any;
  };
}
