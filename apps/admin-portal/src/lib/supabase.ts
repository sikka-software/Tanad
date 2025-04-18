import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Enable session persistence
    storageKey: "tanad_supabase_auth", // Custom storage key
    storage: typeof window !== "undefined" ? window.localStorage : undefined, // Use localStorage in browser
    detectSessionInUrl: true, // Enable session detection in URL
    autoRefreshToken: true, // Enable automatic token refresh
  },
});

// Initialize auth state
if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      console.log("[Supabase] Initial session found:", session.user?.id);
    } else {
      console.log("[Supabase] No initial session found");
    }
  });
}
