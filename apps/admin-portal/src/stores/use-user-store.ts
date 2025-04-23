import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
        set({ user, isAuthenticated: !!user });
      },

      setProfile: (profile) => {
        set({ profile });
      },

      setEnterprise: (enterprise) => {
        set({ enterprise });
      },

      fetchUserAndRelatedData: async (userId: string) => {
        if (!userId) {
          console.warn("[UserStore] fetchUserAndRelatedData called without userId.");
          set({ profile: null, enterprise: null, loading: false });
          return;
        }

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
            set({ profile: null });
          } else {
            fetchedProfile = profileData;
            set({ profile: fetchedProfile });

            // Fetch enterprise if profile has enterprise_id
            if (fetchedProfile?.enterprise_id) {
              const { data: enterpriseData, error: enterpriseError } = await supabase
                .from("enterprises")
                .select("*")
                .eq("id", fetchedProfile.enterprise_id)
                .single();

              if (enterpriseError) {
                console.error("[UserStore] Enterprise fetch error:", enterpriseError);
                set({ enterprise: null });
              } else {
                fetchedEnterprise = enterpriseData;
                set({ enterprise: fetchedEnterprise });
              }
            } else {
              set({ enterprise: null });
            }
          }
        } catch (error) {
          console.error("[UserStore] Error fetching profile:", error);
          set({ profile: null, enterprise: null });
        } finally {
          set({ loading: false });
        }
      },

      initializeAuth: async () => {
        const supabase = createClient();
        const { initialized } = get();
        console.log("[UserStore] initalizing", initialized);
        if (initialized) {
          console.log("[UserStore] not initialized", initialized);
          return;
        }

        set({ loading: true });
        try {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          console.log("[UserStore] session", session);

          if (sessionError) {
            console.error("[UserStore] Error getting session during init:", sessionError);
            throw sessionError;
          }

          if (session?.user) {
            console.log("[UserStore] session user", session.user);
            set({ user: session.user, isAuthenticated: true });
            if (!get().profile || get().profile?.id !== session.user.id) {
              await get().fetchUserAndRelatedData(session.user.id);
            }
            console.log("[UserStore] finally setting initialized", initialized);
            set({ initialized: true, loading: false });
          } else {
            set({ user: null, profile: null, enterprise: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error("[UserStore] Error during initializeAuth:", error);
          set({ user: null, profile: null, enterprise: null, isAuthenticated: false });
        }
      },

      signOut: async () => {
        const supabase = createClient();
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error("[UserStore] Error signing out:", error);
        } finally {
          set({
            user: null,
            profile: null,
            enterprise: null,
            isAuthenticated: false,
            initialized: false,
            loading: false,
          });
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
          set({ profile, loading: false });
        } catch (error) {
          console.error("[UserStore] Error refreshing profile:", error);
          set({ loading: false });
        }
      },

      setState: (state) => {
        set(state);
      },
    }),
    {
      name: "tanad-user-store",
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead of localStorage
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        enterprise: state.enterprise,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // When store is rehydrated, check if we have valid data
        if (state.user && state.profile && state.enterprise) {
          state.initialized = true;
          state.isAuthenticated = true;
        } else {
          // If we don't have complete data, force re-initialization
          state.initialized = false;
          state.isAuthenticated = false;
          // Trigger initialization
          setTimeout(() => {
            useUserStore.getState().initializeAuth();
          }, 0);
        }
      },
    },
  ),
);

// Set up auth state change listener
const supabase = createClient();

if (typeof window !== "undefined") {
  // Only set up the listener in the browser
  supabase.auth.onAuthStateChange(async (event, session) => {
    const store = useUserStore.getState();

    if (event === "SIGNED_IN" && session?.user) {
      store.setUser(session.user);
      await store.fetchUserAndRelatedData(session.user.id);
      store.setState({ initialized: true, loading: false });
    } else if (event === "SIGNED_OUT") {
      store.setState({
        user: null,
        profile: null,
        enterprise: null,
        isAuthenticated: false,
        initialized: false,
        loading: false,
      });
    } else if (event === "USER_UPDATED" && session?.user) {
      store.setUser(session.user);
    } else if (event === "TOKEN_REFRESHED" && session?.user) {
      store.setUser(session.user);
      store.setState({ isAuthenticated: true });
    }
  });
}

export default useUserStore;
