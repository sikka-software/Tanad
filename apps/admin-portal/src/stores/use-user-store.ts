import { User } from "@supabase/supabase-js";
import { create } from "zustand";

import { createClient } from "@/utils/supabase/component";

interface ProfileType {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  stripe_customer_id: string | null;
  subscribed_to: string | null;
  price_id: string | null;
  user_settings: Record<string, any> | null;
  role?: string;
  enterprise_id?: string;
}

interface EnterpriseType {
  id: string;
  name: string;
}

interface UserState {
  user: User | null;
  profile: ProfileType | null;
  enterprise: EnterpriseType | null;
  loading: boolean;
  error: string | null;
  fetchUserAndProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: ProfileType | null) => void;
  setEnterprise: (enterprise: EnterpriseType | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const supabase = createClient();

const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  enterprise: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setEnterprise: (enterprise) => set({ enterprise }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  signOut: async () => {
    try {
      set({ loading: true });
      await supabase.auth.signOut();
      set({
        user: null,
        profile: null,
        enterprise: null,
        loading: false,
        error: null,
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Error signing out:", error);
      return Promise.reject(error);
    }
  },

  fetchUserAndProfile: async () => {
    // Skip if already loading
    if (get().loading) return;

    try {
      set({ loading: true, error: null });

      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        set({
          user: null,
          profile: null,
          enterprise: null,
          loading: false,
        });
        return;
      }

      // Set the user from the session
      set({ user: session.user });

      // Get profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        set({ profile: profileData as ProfileType });

        // Get enterprise data if profile has enterprise_id
        if (profileData.enterprise_id) {
          const { data: enterpriseData } = await supabase
            .from("enterprises")
            .select("*")
            .eq("id", profileData.enterprise_id)
            .single();

          if (enterpriseData) {
            set({ enterprise: enterpriseData as EnterpriseType });
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));

// Setup auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN") {
    useUserStore.getState().fetchUserAndProfile();
  } else if (event === "SIGNED_OUT") {
    useUserStore.setState({
      user: null,
      profile: null,
      enterprise: null,
      loading: false,
      error: null,
    });
  }
});

export default useUserStore;
