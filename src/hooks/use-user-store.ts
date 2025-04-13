import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

import { supabase } from "@/lib/supabase";

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
  };
  username: string | null;
  subscribed_to: string | null;
  price_id: string | null;
  phone: string | null;
}

export interface UserState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  fetchUserAndProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),

  fetchUserAndProfile: async () => {
    // Only fetch if not initialized or explicitly forced
    if (get().initialized) return;

    set({ loading: true });
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user || null;
      set({ user, isAuthenticated: !!user });

      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        set({ profile });
      } else {
        set({ profile: null });
      }
    } catch (error) {
      console.error("Error fetching user and profile:", error);
      set({ user: null, profile: null, isAuthenticated: false });
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      set({ profile });
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, profile: null, isAuthenticated: false });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  },
}));

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useUserStore.getState();

  if (session?.user) {
    store.setUser(session.user);
    await store.refreshProfile();
  } else {
    store.setUser(null);
    store.setProfile(null);
  }
});

export default useUserStore;
