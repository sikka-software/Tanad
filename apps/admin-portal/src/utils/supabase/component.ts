import { createBrowserClient } from "@supabase/ssr";

import { Database } from "@/lib/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("[Supabase Client] Missing Supabase environment variables!");
  throw new Error("Missing Supabase environment variables");
}

export function createClient() {
  const supabase = createBrowserClient<Database>(supabaseUrl!, supabaseKey!, {
    // auth: {
    //   persistSession: true, // Enable session persistence
    //   storageKey: "tanad_supabase_auth", // Custom storage key
    //   storage: typeof window !== "undefined" ? window.localStorage : undefined, // Use localStorage in browser
    //   detectSessionInUrl: true, // Enable session detection in URL
    //   autoRefreshToken: true, // Enable automatic token refresh
    // },
  });
  return supabase;
}
