import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ExtendedUser } from "@/types";
import { createClient } from "@/utils/supabase/component";

// Define strong types for our user data
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  stripe_customer_id: string | null;
  avatar_url: string | null;
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

export interface UserState {
  user: ExtendedUser | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  setUser: (user: ExtendedUser | null) => void;
  setProfile: (profile: Profile | null) => void;
  fetchUserAndProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  setInitialized: (initialized: boolean) => void;
  setState: (state: Partial<UserState>) => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: false,
      initialized: false,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setProfile: (profile) => {
        console.log("[UserStore] Setting profile:", profile?.id);
        set({ profile });
      },

      setInitialized: (initialized) => {
        set({ initialized });
      },

      fetchUserAndProfile: async () => {
        const currentState = get();
        const supabase = createClient();
        // If already initialized and we have both user and profile, return early
        if (currentState.initialized && currentState.user && currentState.profile) {
          // console.log(
          //   "[UserStore] Already fully initialized with user and profile, skipping fetch",
          // );
          return;
        }

        // console.log("[UserStore] Starting fetch");
        set({ loading: true });

        try {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            throw sessionError;
          }

          // console.log("[UserStore] Session check result:", {
          //   hasSession: !!session,
          //   user_id: session?.user?.id,
          // });

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

              // Copy stripe_customer_id from profile to user object
              const updatedUser = {
                ...session.user,
                stripe_customer_id: profile?.stripe_customer_id || undefined,
                profile: profile,
              };

              // console.log("[UserStore] Profile fetched successfully:", profile?.id);
              set({
                user: updatedUser,
                profile,
                loading: false,
                initialized: true,
              });
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

          // Copy stripe_customer_id from profile to user object
          const updatedUser = {
            ...user,
            stripe_customer_id: profile?.stripe_customer_id || undefined,
            profile: profile,
          };

          set({
            user: updatedUser,
            profile,
            loading: false,
          });
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

        // Copy stripe_customer_id from profile to user
        const updatedUser = {
          ...session.user,
          stripe_customer_id: profile?.stripe_customer_id || undefined,
          profile: profile,
        };

        // Update both user and profile
        store.setUser(updatedUser);
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
