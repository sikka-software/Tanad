import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import React, { useEffect, createContext, ReactNode } from "react";

import { createClient } from "@/utils/supabase/component";

import useUserStore from "@/stores/use-user-store";

export const SupabaseContext = createContext<
  { supabase: ReturnType<typeof createClient> } | undefined
>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const router = useRouter();

  const onAuthStateChange = (callback: (event: AuthChangeEvent) => void) => {
    let currentSession: Session | null;
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id == currentSession?.user?.id) return;
      currentSession = session;
      callback(event);
    });
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange((event: AuthChangeEvent) => {
      console.log(event);
      switch (event) {
        case "SIGNED_OUT":
          useUserStore.setState({
            user: null,
            profile: null,
            enterprise: null,
            membership: null,
            permissions: [],
            loading: false,
            error: null,
            lastFetchTime: null,
          });
          router.push("/auth");
          break;
        case "SIGNED_IN":
          useUserStore.getState().fetchUserAndProfile();
          router.push("/dashboard");
          break;
        default:
          // router.refresh()
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      <>{children}</>
    </SupabaseContext.Provider>
  );
}
