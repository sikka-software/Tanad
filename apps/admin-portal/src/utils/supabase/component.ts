import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log the URL being used when the module loads
console.log("[Supabase Client] Attempting to use Supabase URL:", supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
  // This error should have already been caught if Infisical wasn't working
  console.error("[Supabase Client] Missing Supabase environment variables!");
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
