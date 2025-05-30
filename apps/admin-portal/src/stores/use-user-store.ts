import { User } from "@supabase/supabase-js";
import { currencies } from "@tanad.config";
import { create } from "zustand";

import { createClient } from "@/utils/supabase/component";

import { Database } from "@/lib/database.types";

import { Enterprise } from "@/modules/enterprise/enterprise.type";

export type Membership = Database["public"]["Tables"]["memberships"]["Row"];
export type Permission = Database["public"]["Tables"]["permissions"]["Row"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  user_settings: {
    currency: (typeof currencies)[number];
    calendar: "gregorian" | "hijri";
    timezone: string;
    date_format: "mdy" | "dmy" | "ymd" | "dym";
    time_format: "12h" | "24h";
    notifications?: {
      email_updates: boolean;
      email_marketing: boolean;
      email_security: boolean;
      app_mentions: boolean;
      app_comments: boolean;
      app_tasks: boolean;
    };
    language: string;
    navigation?: Record<
      string,
      Array<{
        title: string;
        translationKey?: string;
        url?: string;
        status?: string;
        action?: string;
      }>
    >;
    hidden_menu_items?: Record<string, string[]>;
  };
};

interface UserState {
  user: User | null;
  profile: Profile | null;
  enterprise: Enterprise | null;
  membership: Membership | null;
  permissions: string[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  fetchUserAndProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setEnterprise: (enterprise: Enterprise | null) => void;
  setMembership: (membership: Membership | null) => void;
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
  loading: true,
  error: null,
  lastFetchTime: null,

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
      // Only call Supabase sign out, let the listener handle state changes
      await supabase.auth.signOut();
      set({
        user: null,
        profile: null,
        enterprise: null,
        membership: null,
        permissions: [],
        loading: false,
        error: null,
        lastFetchTime: null,
      });
      return Promise.resolve();
    } catch (error) {
      // Log error, potentially set an error state if needed elsewhere
      console.error("Error signing out:", error);
      // Optionally set error state: set({ error: (error as Error).message, loading: false });
      return Promise.reject(error);
    }
  },

  fetchUserAndProfile: async () => {
    // console.log("[UserStore] fetchUserAndProfile called (pre-loading check)");
    // console.trace("[UserStore] fetchUserAndProfile stack trace");
    // Timeout failsafe: set loading to false after 10s if still loading
    const timeout = setTimeout(() => {
      if (get().loading) {
        set({ loading: false });
        // console.warn("[UserStore] Failsafe: loading still true after 10s, forcing to false");
      }
    }, 10000);

    // Skip if window just regained focus and we've fetched recently
    if (window.tanadSubscriptionDataCached) {
      // console.log("[UserStore] Skipping user data fetch - window just regained focus");
      return;
    }

    // Throttle fetches to once every 10 seconds
    const now = Date.now();
    const lastFetch = get().lastFetchTime;
    if (lastFetch && now - lastFetch < 10000) {
      // console.log("[UserStore] Skipping user data fetch - fetched recently");
      return;
    }

    try {
      set({ loading: true, error: null });
      // console.log("[UserStore] Fetching session...");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // console.log("[UserStore] Session:", session);

      if (!session) {
        set({
          user: null,
          profile: null,
          enterprise: null,
          membership: null,
          permissions: [],
          loading: false,
          lastFetchTime: now,
        });
        clearTimeout(timeout);
        // console.log("[UserStore] No session found, set loading false");
        return;
      }

      set({ user: session.user });
      // console.log("[UserStore] Fetching profile for user", session.user.id);
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (profileError) {
        console.error("[UserStore] Profile fetch error:", profileError);
      }
      // console.log("[UserStore] Profile data:", profileData);

      if (profileData) {
        set({
          profile: {
            ...profileData,
            user_settings: profileData.user_settings as Profile["user_settings"],
          },
        });
        // console.log("[UserStore] Fetching membership for user", session.user.id);
        const { data: membershipData, error: membershipError } = await supabase
          .from("memberships")
          .select("*")
          .eq("profile_id", session.user.id)
          .single();
        if (membershipError) {
          console.error("[UserStore] Membership fetch error:", membershipError);
        }
        // console.log("[UserStore] Membership data:", membershipData);
        if (membershipData) {
          set({ membership: membershipData });
          // console.log("[UserStore] Fetching enterprise for enterprise_id", membershipData.enterprise_id);
          const { data: enterpriseData, error: enterpriseError } = await supabase
            .from("enterprises")
            .select("*")
            .eq("id", membershipData.enterprise_id || "")
            .single();
          if (enterpriseError) {
            console.error("[UserStore] Enterprise fetch error:", enterpriseError);
          }
          // console.log("[UserStore] Enterprise data:", enterpriseData);
          if (enterpriseData) {
            if (enterpriseData.logo) {
              const { data: imageData } = await supabase.storage
                .from("enterprise-images")
                .createSignedUrl(enterpriseData.logo, 60 * 60);
              enterpriseData.logo = imageData?.signedUrl ?? null;
            }
            set({ enterprise: enterpriseData });
          }
          // console.log("[UserStore] Fetching permissions for user and enterprise");
          const { data: permissionsData, error: permissionsError } = await supabase
            .from("user_permissions_view")
            .select("permission_name")
            .eq("user_id", session.user.id)
            .eq("enterprise_id", membershipData.enterprise_id || "");
          if (permissionsError) {
            console.error("[UserStore] Permissions fetch error:", permissionsError);
          }
          // console.log("[UserStore] Permissions data:", permissionsData);
          if (permissionsData) {
            const permissions = permissionsData
              .map((p) => p.permission_name)
              .filter((name): name is string => name !== null);
            set({ permissions });
          }
        }
      }
      set({ lastFetchTime: now });
    } catch (error: any) {
      console.error("[UserStore] Error fetching user data:", error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
      clearTimeout(timeout);
      // console.log("[UserStore] fetchUserAndProfile finished, loading set to false");
    }
  },
}));

// let session: Session | null = null;

// supabase.auth.getSession().then(async ({ data }) => {
//   if (data.session) {
//     session = data.session;
//   }
// });

// // Setup auth state change listener
// supabase.auth.onAuthStateChange((event, _session) => {
//   switch (event) {
//     case "SIGNED_IN":
//       useUserStore.getState().fetchUserAndProfile();
//       break;
//     case "SIGNED_OUT":
//       useUserStore.setState({
//         user: null,
//         profile: null,
//         enterprise: null,
//         membership: null,
//         permissions: [],
//         loading: false,
//         error: null,
//         lastFetchTime: null,
//       });
//   }
// });

export default useUserStore;
