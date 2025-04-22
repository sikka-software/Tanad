import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createClient } from "@/utils/supabase/component";

// Define strong types for our user data
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  stripe_customer_id: string | null;
  avatar_url: string | null;
  enterprise_id: string | null;
  address: string | null;
  user_settings: {
    currency: string;
    calendar_type: string;
    timezone: string;
    notifications?: {
      email_updates: boolean;
      email_marketing: boolean;
      email_security: boolean;
      app_mentions: boolean;
      app_comments: boolean;
      app_tasks: boolean;
    };
    navigation?: Record<
      string,
      Array<{
        title: string;
        translationKey?: string;
        url?: string;
        is_active?: boolean;
        action?: string;
      }>
    >;
    hidden_menu_items?: Record<string, string[]>;
  };
  username: string | null;
  subscribed_to: string | null;
  price_id: string | null;
  phone: string | null;
}

export interface Enterprise {
  id: string;
  name: string;
}

export interface UserState {
  user: User | null;
  profile: Profile | null;
  enterprise: Enterprise | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setEnterprise: (enterprise: Enterprise | null) => void;
  fetchUserAndProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  fetchEnterprise: () => Promise<void>;
  signOut: () => Promise<void>;
  setInitialized: (initialized: boolean) => void;
  setState: (state: Partial<UserState>) => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      enterprise: null,
      loading: false,
      initialized: false,
      isAuthenticated: false,

      setUser: (user) => {
        console.log("[UserStore] Setting user:", user?.id);
        set({ user, isAuthenticated: !!user });
      },

      setProfile: (profile) => {
        console.log("[UserStore] Setting profile:", profile?.id);
        set({ profile });
      },

      setEnterprise: (enterprise) => {
        console.log("[UserStore] Setting enterprise:", enterprise?.id);
        set({ enterprise });
      },

      setInitialized: (initialized) => {
        set({ initialized });
      },

      fetchUserAndProfile: async () => {
        const currentState = get();
        const supabase = createClient();
        console.log("[UserStore] Fetching user and profile");
        // If already initialized and we have both user and profile, return early
        // if (currentState.initialized && currentState.user && currentState.profile) {
        //   // console.log(
        //   //   "[UserStore] Already fully initialized with user and profile, skipping fetch",
        //   // );
        //   return;
        // }

        // console.log("[UserStore] Starting fetch");
        set({ loading: true });

        try {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          console.log("[UserStore] Session error:", sessionError);
          if (sessionError) {
            throw sessionError;
          }

          // console.log("[UserStore] Session check result:", {
          //   hasSession: !!session,
          //   user_id: session?.user?.id,
          // });
          console.log("[UserStore] Session:", session);
          if (session?.user) {
            set({ user: session.user, isAuthenticated: true });

            try {
              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

              if (profileError) {
                console.error("[UserStore] Profile fetch error:", profileError);
                throw profileError;
              }

              console.log("[UserStore] Profile fetched successfully:", profile?.id);
              set({ profile, user: session.user, loading: false, initialized: true });
            } catch (error) {
              console.error("[UserStore] Error fetching profile:", error);
              set({ loading: false, initialized: true });
            }
          } else {
            // console.log("[UserStore] No session found, clearing state");
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              loading: false,
              initialized: true,
            });
          }
        } catch (error) {
          console.error("[UserStore] Error in fetchUserAndProfile:", error);
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            loading: false,
            initialized: true,
          });
        }
      },

      fetchEnterprise: async () => {
        const supabase = createClient();
        const profile = get().profile;
        if (!profile) {
          console.log("[UserStore] Skipping enterprise fetch - no profile");
          return;
        }

        set({ loading: true });
        try {
          const { data: enterprise, error } = await supabase
            .from("enterprises")
            .select("*")
            .eq("id", profile?.enterprise_id)
            .single();

          console.log("[UserStore] Enterprise fetched:", enterprise);
          if (error) throw error;

          set({ enterprise, loading: false });
        } catch (error) {
          console.error("[UserStore] Error fetching enterprise:", error);
          set({ loading: false });
        }
      },

      refreshProfile: async () => {
        const supabase = createClient();
        const user = get().user;
        if (!user) {
          console.log("[UserStore] Skipping profile refresh - no user");
          return;
        }

        set({ loading: true });
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          // console.log("[UserStore] Profile refreshed:", profile?.id);
          set({ profile, loading: false });
        } catch (error) {
          console.error("[UserStore] Error refreshing profile:", error);
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
          // console.log("[UserStore] Sign out successful");
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            initialized: false,
            loading: false,
          });
        } catch (error) {
          console.error("[UserStore] Error signing out:", error);
        }
      },

      setState: (state) => {
        set(state);
      },
    }),
    {
      name: "tanad-user-store", // unique name for localStorage
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // When store is rehydrated from storage, mark as initialized if we have both user and profile
        if (state.user && state.profile) {
          state.initialized = true;
          state.isAuthenticated = true;
        } else {
          // If we don't have both, we need to re-fetch
          state.initialized = false;
          state.isAuthenticated = false;
        }
      },
    },
  ),
);

const supabase = createClient();
// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  // console.log("[UserStore] Auth state changed:", { event, user_id: session?.user?.id });
  const store = useUserStore.getState();

  if (event === "SIGNED_IN" && session?.user) {
    // On sign in, set user but don't fetch profile if we already have it
    store.setUser(session.user);

    // Only fetch profile if we don't have it or it doesn't match current user
    if (!store.profile || store.profile.id !== session.user.id) {
      store.setState({ loading: true });
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;

        // console.log("[UserStore] Profile fetched on auth change:", profile?.id);
        store.setProfile(profile);
      } catch (error) {
        console.error("[UserStore] Error fetching profile on auth change:", error);
        store.setProfile(null);
      } finally {
        store.setState({ loading: false });
      }
    }

    // Always mark as initialized after SIGNED_IN is handled
    store.setInitialized(true);
  } else if (event === "SIGNED_OUT") {
    // Clear everything on sign out
    store.setUser(null);
    store.setProfile(null);
    store.setInitialized(false);
    store.setState({ loading: false });
  }
});

export default useUserStore;
