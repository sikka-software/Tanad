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
  owner_id: string;
}

interface UserState {
  user: User | null;
  profile: ProfileType | null;
  enterprise: EnterpriseType | null;
  loading: boolean;
  fetchUserAndProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: ProfileType | null) => void;
  setEnterprise: (enterprise: EnterpriseType | null) => void;
  setLoading: (loading: boolean) => void;
}

const supabase = createClient();

const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  enterprise: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setEnterprise: (enterprise) => set({ enterprise }),
  setLoading: (loading) => set({ loading }),

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        profile: null,
        enterprise: null,
        loading: false,
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Error signing out:", error);
      return Promise.reject(error);
    }
  },

  fetchUserAndProfile: async () => {
    const { setLoading, setUser, setProfile, setEnterprise } = get();

    try {
      setLoading(true);

      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUser(null);
        setProfile(null);
        setEnterprise(null);
        return;
      }

      // Set the user from the session
      setUser(session.user);

      // Get profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData as ProfileType);

        // Get enterprise data
        const { data: enterpriseData } = await supabase
          .from("enterprises")
          .select("*")
          .eq("owner_id", session.user.id)
          .single();

        if (enterpriseData) {
          setEnterprise(enterpriseData as EnterpriseType);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  },
}));

// Setup auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" || event === "USER_UPDATED") {
    useUserStore.getState().fetchUserAndProfile();
  } else if (event === "SIGNED_OUT") {
    useUserStore.setState({
      user: null,
      profile: null,
      enterprise: null,
      loading: false,
    });
  }
});

export default useUserStore;
