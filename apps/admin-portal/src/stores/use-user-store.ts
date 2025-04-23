import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { createClient } from "@/utils/supabase/component";

// Authentication store - gradually building up
console.log("[UserStore] Initializing user store");

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
        console.log("[UserStore] setUser called with:", user ? "user object" : "null");
        set({ 
          user, 
          isAuthenticated: !!user,
          // When setting a user, also ensure initialized is true
          initialized: true
        });
        console.log("[UserStore] After setUser - isAuthenticated:", !!user);
      },

      setProfile: (profile) => {
        set({ profile });
      },

      setEnterprise: (enterprise) => {
        set({ enterprise });
      },

      fetchUserAndRelatedData: async (userId: string) => {
        console.log("[UserStore] fetchUserAndRelatedData called with userId:", userId);
        
        // Commented out for gradual build-up
        /*
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
        */
        
        // Simplified version for debugging
        set({ loading: true });
        console.log("[UserStore] Setting loading to true");
        
        // Mock data for testing
        setTimeout(() => {
          console.log("[UserStore] Simulating fetch completion");
          set({ loading: false });
        }, 1000);
      },

      initializeAuth: async () => {
        console.log("[UserStore] initializeAuth called");
        const { initialized } = get();
        console.log("[UserStore] initializing, current initialized state:", initialized);
        
        if (initialized) {
          console.log("[UserStore] already initialized, skipping");
          return;
        }

        set({ loading: true });
        console.log("[UserStore] Setting loading to true");
        
        // Commented out for gradual build-up
        /*
        try {
          const supabase = createClient();
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
        */
        
        // Simplified version for debugging
        console.log("[UserStore] Simulating auth initialization");
        
        // For testing, let's set a mock user after a delay
        setTimeout(() => {
          console.log("[UserStore] Setting mock initialized state");
          set({ 
            initialized: true, 
            loading: false,
            // Uncomment to test with a mock user
            // user: { id: 'mock-user-id', email: 'test@example.com' } as User,
            // isAuthenticated: true
          });
        }, 1000);
      },

      signOut: async () => {
        console.log("[UserStore] signOut called");
        
        // Commented out for gradual build-up
        /*
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
        */
        
        // Simplified version for debugging
        console.log("[UserStore] Simulating sign out");
        set({
          user: null,
          profile: null,
          enterprise: null,
          isAuthenticated: false,
          initialized: false,
          loading: false,
        });
      },

      refreshProfile: async () => {
        console.log("[UserStore] refreshProfile called");
        const user = get().user;
        
        if (!user) {
          console.log("[UserStore] Skipping profile refresh - no user");
          return;
        }

        // Commented out for gradual build-up
        /*
        set({ loading: true });
        const supabase = createClient();
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
        */
        
        // Simplified version for debugging
        console.log("[UserStore] Simulating profile refresh for user:", user.id);
        set({ loading: true });
        
        setTimeout(() => {
          console.log("[UserStore] Profile refresh complete");
          set({ loading: false });
        }, 500);
      },

      setState: (state) => {
        console.log("[UserStore] setState called with:", state);
        set(state);
        console.log("[UserStore] After setState - store state:", {
          user: !!get().user,
          isAuthenticated: get().isAuthenticated,
          initialized: get().initialized
        });
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

// Auth state change listener - commented out for gradual build-up
if (typeof window !== "undefined") {
  console.log("[UserStore] Setting up auth state change listener");
  
  // Commented out for gradual build-up
  /*
  const supabase = createClient();
  
  // Only set up the listener in the browser
  supabase.auth.onAuthStateChange(async (event, session) => {
    const store = useUserStore.getState();
    console.log("[UserStore] Auth state changed:", event);

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
  */
  
  // Mock listener for debugging
  console.log("[UserStore] Mock auth state listener ready");
}

export default useUserStore;
