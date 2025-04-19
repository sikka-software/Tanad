import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// // Create a single instance of the Supabase client
// export const createClient = createBrowserClient(supabaseUrl, supabaseKey, {
//   auth: {
//     persistSession: true, // Enable session persistence
//     storageKey: "tanad_supabase_auth", // Custom storage key
//     storage: typeof window !== "undefined" ? window.localStorage : undefined, // Use localStorage in browser
//     detectSessionInUrl: true, // Enable session detection in URL
//     autoRefreshToken: true, // Enable automatic token refresh
//   },
// });

export function createClient() {
  const supabase = createBrowserClient(supabaseUrl!, supabaseKey!);
  return supabase;
}
