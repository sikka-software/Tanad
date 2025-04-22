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
  loading: boolean; // Represents loading state for async operations like fetching profile/enterprise
  initialized: boolean; // Represents if the store has attempted initial auth check
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setEnterprise: (enterprise: Enterprise | null) => void;
  fetchUserAndRelatedData: (userId: string) => Promise<void>; // Renamed and combined
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>; // New initialization action
  setState: (state: Partial<UserState>) => void; // Keep for flexibility if needed
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
        // console.log("[UserStore] Setting user:", user?.id);
        set({ user, isAuthenticated: !!user });
      },

      setProfile: (profile) => {
        // console.log("[UserStore] Setting profile:", profile?.id);
        set({ profile });
      },

      setEnterprise: (enterprise) => {
        // console.log("[UserStore] Setting enterprise:", enterprise?.id);
        set({ enterprise });
      },

      // Fetches profile and potentially enterprise based on profile data
      fetchUserAndRelatedData: async (userId: string) => {
        if (!userId) {
          console.warn("[UserStore] fetchUserAndRelatedData called without userId.");
          set({ profile: null, enterprise: null, loading: false });
          return;
        }
        // console.log(`[UserStore] Fetching profile & enterprise for user: ${userId}`);
        set({ loading: true });
        const supabase = createClient();
        let fetchedProfile: Profile | null = null;
        let fetchedEnterprise: Enterprise | null = null;

        try {
          // Fetch profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (profileError) {
            console.error("[UserStore] Profile fetch error:", profileError);
            // Don't throw, just set profile to null and continue
            set({ profile: null });
          } else {
            fetchedProfile = profileData;
            // console.log("[UserStore] Profile fetched:", fetchedProfile?.id);
            set({ profile: fetchedProfile });

            // Fetch enterprise if profile has enterprise_id
            if (fetchedProfile?.enterprise_id) {
              try {
                const { data: enterpriseData, error: enterpriseError } = await supabase
                  .from("enterprises")
                  .select("*")
                  .eq("id", fetchedProfile.enterprise_id)
                  .single();

                if (enterpriseError) {
                  console.error("[UserStore] Enterprise fetch error:", enterpriseError);
                  set({ enterprise: null }); // Clear enterprise if fetch fails
                } else {
                  fetchedEnterprise = enterpriseData;
                  // console.log("[UserStore] Enterprise fetched:", fetchedEnterprise?.id);
                  set({ enterprise: fetchedEnterprise });
                }
              } catch (error) {
                console.error("[UserStore] Error fetching enterprise:", error);
                set({ enterprise: null });
              }
            } else {
              // No enterprise_id, ensure enterprise state is null
              set({ enterprise: null });
            }
          }
        } catch (error) {
          console.error("[UserStore] Error fetching profile:", error);
          set({ profile: null, enterprise: null }); // Clear both on general error
        } finally {
          set({ loading: false });
        }
      },

      initializeAuth: async () => {
        const supabase = createClient();
        const { initialized, user: existingUser } = get();

        // console.log("[UserStore] Initializing auth. Already initialized?", initialized);
        if (initialized) {
          return; // Already initialized
        }

        set({ loading: true }); // Indicate loading during initialization
        try {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("[UserStore] Error getting session during init:", sessionError);
            throw sessionError;
          }

          // console.log("[UserStore] Init session:", session);
          if (session?.user) {
            // Session exists, set user and fetch related data if needed
            set({ user: session.user, isAuthenticated: true });
            // Fetch profile/enterprise only if not already present from persistence
            if (!get().profile || get().profile?.id !== session.user.id) {
              await get().fetchUserAndRelatedData(session.user.id);
            }
          } else {
            // No session, ensure state is cleared
            set({ user: null, profile: null, enterprise: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error("[UserStore] Error during initializeAuth:", error);
          // Ensure clean state on error
          set({ user: null, profile: null, enterprise: null, isAuthenticated: false });
        } finally {
          // Mark as initialized regardless of outcome
          set({ initialized: true, loading: false });
          // console.log("[UserStore] Auth initialization complete.");
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
        const supabase = createClient();
        try {
          await supabase.auth.signOut();
          // console.log("[UserStore] Sign out successful");
        } catch (error) {
          console.error("[UserStore] Error signing out:", error);
        } finally {
          // Clear state regardless of sign-out success/failure
          set({
            user: null,
            profile: null,
            enterprise: null,
            isAuthenticated: false,
            initialized: false, // Reset initialized on sign out
            loading: false,
          });
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

    // Fetch profile and enterprise data when signed in
    // This might be redundant if initializeAuth already fetched, but ensures consistency
    // especially if the user signs in *after* initial load.
    await store.fetchUserAndRelatedData(session.user.id);
    // Ensure initialized is true after sign in is processed
    store.setState({ initialized: true, loading: false }); // Also set loading false here
  } else if (event === "SIGNED_OUT") {
    // Clear everything on sign out - handled by store.signOut() now,
    // but we ensure state is cleared here too for robustness.
    store.setState({
      user: null,
      profile: null,
      enterprise: null,
      isAuthenticated: false,
      initialized: false, // Reset initialized
      loading: false,
    });
  } else if (event === "USER_UPDATED" && session?.user) {
    // Handle user updates if necessary (e.g., email change confirmation)
    store.setUser(session.user);
    // Optionally refresh profile if user metadata might affect it
    // await store.refreshProfile();
  } else if (event === "PASSWORD_RECOVERY") {
    // Handle password recovery state if needed
  } else if (event === "TOKEN_REFRESHED" && session?.user) {
    // Update user state if token refresh provides new user data (unlikely but possible)
    store.setUser(session.user);
    store.setState({ isAuthenticated: true }); // Ensure authenticated state is true
  }
});

export default useUserStore;
