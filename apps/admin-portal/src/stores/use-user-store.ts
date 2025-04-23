import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { createClient } from "@/utils/supabase/component";

// Authentication store
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
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setEnterprise: (enterprise: Enterprise | null) => void;
  fetchUserAndRelatedData: (userId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
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
        console.log("[UserStore] setUser called with:", user ? "user object" : "null");
        set({ 
          user, 
          isAuthenticated: !!user,
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
        
        if (!userId) {
          console.warn("[UserStore] fetchUserAndRelatedData called without userId.");
          set({ profile: null, enterprise: null, loading: false });
          return;
        }

        set({ loading: true });
        const supabase = createClient();

        try {
          console.log("[UserStore] Fetching profile data for userId:", userId);
          
          // Log the supabase client state
          console.log("[UserStore] Checking Supabase client...");

          // First try a simpler query to test the connection
          console.log("[UserStore] Testing database connection...");
          const { data: testData, error: testError } = await supabase
            .from("profiles")
            .select("id")
            .limit(1);

          if (testError) {
            console.error("[UserStore] Database connection test failed:", testError);
            throw new Error(`Database connection failed: ${testError.message}`);
          }

          console.log("[UserStore] Database connection test successful");

          // Now try the actual profile fetch with timeout
          let profileResult: { data: any; error: any };
          try {
            const profilePromise = supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .single();

            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error("Profile fetch timeout after 5s")), 5000);
            });

            profileResult = await Promise.race([profilePromise, timeoutPromise]) as { data: any; error: any };
          } catch (error) {
            console.error("[UserStore] Profile fetch failed:", error);
            throw error;
          }

          const { data: profileData, error: profileError } = profileResult;

          console.log("[UserStore] Profile fetch result:", { 
            success: !profileError, 
            hasData: !!profileData,
            error: profileError ? profileError.message : null 
          });

          if (profileError) {
            console.error("[UserStore] Profile fetch error:", profileError);
            set({ 
              profile: null, 
              enterprise: null,
              loading: false 
            });
            return;
          }

          if (!profileData) {
            console.warn("[UserStore] No profile data found for user:", userId);
            // If no profile exists, create one
            console.log("[UserStore] Attempting to create profile for user:", userId);
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert([
                { 
                  id: userId,
                  email: get().user?.email,
                  user_settings: {
                    currency: "USD",
                    calendar_type: "gregorian",
                    timezone: "UTC"
                  }
                }
              ])
              .select()
              .single();

            if (createError) {
              console.error("[UserStore] Failed to create profile:", createError);
              set({ 
                profile: null, 
                enterprise: null,
                loading: false 
              });
              return;
            }

            console.log("[UserStore] Created new profile:", newProfile);
            set({ profile: newProfile });
            set({ enterprise: null });
            set({ loading: false });
            return;
          }

          console.log("[UserStore] Profile fetched successfully:", profileData);
          set({ profile: profileData });

          // Only try to fetch enterprise if we have an enterprise_id
          if (profileData.enterprise_id) {
            console.log("[UserStore] Fetching enterprise data for id:", profileData.enterprise_id);
            const { data: enterpriseData, error: enterpriseError } = await supabase
              .from("enterprises")
              .select("*")
              .eq("id", profileData.enterprise_id)
              .single();

            console.log("[UserStore] Enterprise fetch result:", {
              success: !enterpriseError,
              hasData: !!enterpriseData,
              error: enterpriseError ? enterpriseError.message : null
            });

            if (enterpriseError) {
              console.error("[UserStore] Enterprise fetch error:", enterpriseError);
              set({ enterprise: null });
            } else {
              console.log("[UserStore] Enterprise fetched successfully:", enterpriseData);
              set({ enterprise: enterpriseData });
            }
          } else {
            console.log("[UserStore] No enterprise_id found in profile");
            set({ enterprise: null });
          }
        } catch (error) {
          console.error("[UserStore] Error in fetchUserAndRelatedData:", error);
          set({ profile: null, enterprise: null });
        } finally {
          console.log("[UserStore] Completing fetchUserAndRelatedData, clearing loading state");
          set({ loading: false });
        }
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
        
        try {
          const supabase = createClient();
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          console.log("[UserStore] Session check result:", { 
            hasSession: !!session, 
            hasUser: !!session?.user,
            error: sessionError ? sessionError.message : null
          });

          if (sessionError) {
            console.error("[UserStore] Error getting session during init:", sessionError);
            set({ 
              user: null, 
              profile: null, 
              enterprise: null, 
              isAuthenticated: false,
              initialized: true,
              loading: false 
            });
            return;
          }

          if (session?.user) {
            console.log("[UserStore] Found existing session for user:", session.user.email);
            set({ user: session.user, isAuthenticated: true });
            
            try {
              await get().fetchUserAndRelatedData(session.user.id);
            } catch (error) {
              console.error("[UserStore] Error fetching user data:", error);
            }
            
            set({ initialized: true, loading: false });
            console.log("[UserStore] Initialization complete with user");
          } else {
            console.log("[UserStore] No active session found");
            set({ 
              user: null, 
              profile: null, 
              enterprise: null, 
              isAuthenticated: false,
              initialized: true,
              loading: false 
            });
          }
        } catch (error) {
          console.error("[UserStore] Error during initializeAuth:", error);
          set({ 
            user: null, 
            profile: null, 
            enterprise: null, 
            isAuthenticated: false,
            initialized: true,
            loading: false 
          });
        }
      },

      signOut: async () => {
        console.log("[UserStore] signOut called");
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
        console.log("[UserStore] refreshProfile called");
        const user = get().user;
        
        if (!user) {
          console.log("[UserStore] Skipping profile refresh - no user");
          return;
        }

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
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        enterprise: state.enterprise,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (state.user && state.profile && state.enterprise) {
          state.initialized = true;
          state.isAuthenticated = true;
        } else {
          state.initialized = false;
          state.isAuthenticated = false;
          setTimeout(() => {
            useUserStore.getState().initializeAuth();
          }, 0);
        }
      },
    },
  ),
);

// Auth state change listener
if (typeof window !== "undefined") {
  console.log("[UserStore] Setting up auth state change listener");
  
  const supabase = createClient();
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    const store = useUserStore.getState();
    console.log("[UserStore] Auth state changed:", event, "Session:", !!session);

    try {
      if (event === "SIGNED_IN" && session?.user) {
        store.setUser(session.user);
        await store.fetchUserAndRelatedData(session.user.id);
        store.setState({ initialized: true });
      } else if (event === "SIGNED_OUT") {
        store.setState({
          user: null,
          profile: null,
          enterprise: null,
          isAuthenticated: false,
          initialized: true,
          loading: false,
        });
      } else if (event === "USER_UPDATED" && session?.user) {
        store.setUser(session.user);
        await store.fetchUserAndRelatedData(session.user.id);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        store.setUser(session.user);
        store.setState({ isAuthenticated: true });
      }
    } catch (error) {
      console.error("[UserStore] Error in auth state change handler:", error);
      // Ensure loading is false even on error
      store.setState({ loading: false });
    }
  });
}

export default useUserStore;
