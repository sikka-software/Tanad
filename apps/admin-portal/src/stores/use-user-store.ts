import { User } from "@supabase/supabase-js";
import { create } from "zustand";

import { createClient } from "@/utils/supabase/component";

export interface ProfileType {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  stripe_customer_id: string | null;
  avatar_url: string | null;
  address: string | null;
  subscribed_to?: string;
  price_id?: string;
  username: string | null;
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
}

interface EnterpriseType {
  id: string;
  name: string;
  created_at: string;
}

interface MembershipType {
  id: string;
  profile_id: string;
  enterprise_id: string;
  role_id: string;
  created_at: string;
}

interface UserState {
  user: any | null;
  profile: ProfileType | null;
  enterprise: EnterpriseType | null;
  membership: MembershipType | null;
  permissions: string[];
  loading: boolean;
  error: string | null;
  fetchUserAndProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: ProfileType | null) => void;
  setEnterprise: (enterprise: EnterpriseType | null) => void;
  setMembership: (membership: MembershipType | null) => void;
  setPermissions: (permissions: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  hasPermission: (permission: string) => boolean;
}

const supabase = createClient();

const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  enterprise: null,
  membership: null,
  permissions: [],
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setEnterprise: (enterprise) => set({ enterprise }),
  setMembership: (membership) => set({ membership }),
  setPermissions: (permissions) => set({ permissions }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  hasPermission: (permission) => {
    const permissions = get().permissions;
    return permissions.includes(permission);
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await supabase.auth.signOut();
      set({
        user: null,
        profile: null,
        enterprise: null,
        membership: null,
        permissions: [],
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
          membership: null,
          permissions: [],
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

        // Get membership data
        const { data: membershipData } = await supabase
          .from("memberships")
          .select("*")
          .eq("profile_id", session.user.id)
          .single();

        if (membershipData) {
          set({ membership: membershipData as MembershipType });

          // Get enterprise data
          const { data: enterpriseData } = await supabase
            .from("enterprises")
            .select("*")
            .eq("id", membershipData.enterprise_id)
            .single();

          if (enterpriseData) {
            set({ enterprise: enterpriseData as EnterpriseType });
          }

          // Get user permissions from the view
          const { data: permissionsData } = await supabase
            .from("user_permissions_view")
            .select("permission")
            .eq("profile_id", session.user.id)
            .eq("enterprise_id", membershipData.enterprise_id);

          if (permissionsData) {
            const permissions = permissionsData.map((p) => p.permission);
            set({ permissions });
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
      membership: null,
      permissions: [],
      loading: false,
      error: null,
    });
  }
});

export default useUserStore;
