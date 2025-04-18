import { create } from "zustand";

import { supabase } from "@/lib/supabase";
import { Profile, PuklaUser } from "@/lib/types";

const useUserStore = create<{
  user: PuklaUser | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: PuklaUser) => void;
  setProfile: (profile: Profile) => void;
  fetchUserAndProfile: () => Promise<void>;
}>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setUser: (user: PuklaUser) => set({ user }),
  setProfile: (profile: Profile) => set({ profile }),
  fetchUserAndProfile: async () => {
    // Only fetch if not initialized or explicitly forced
    if (get().initialized) return;

    set({ loading: true });
    try {
      // Fetch the authenticated user
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user || null;

      // Fetch the profile info if user exists
      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) console.error("Error fetching profile:", error);

        // Set both the profile object and the user with profile data merged
        set({
          profile,
          user: {
            ...user,
            stripe_customer_id: profile?.stripe_customer_id,
            full_name: profile?.full_name,
            subscribed_to: profile?.subscribed_to,
            price_id: profile?.price_id,
            profile: profile?.profile,
            user_settings: profile?.user_settings,
            address: profile?.address,
            phone: profile?.phone,
            email: profile?.email,
            avatar_url: profile?.avatar_url,
          } as PuklaUser,
        });
      } else {
        set({ user: null, profile: null });
      }
    } finally {
      set({ loading: false, initialized: true });
    }
  },
}));

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    // Don't reset the entire state, just update what changed
    const currentState = useUserStore.getState();
    if (currentState.user?.id === session.user.id) {
      // If it's the same user, don't do anything
      return;
    }
    // If it's a different user, update with full profile
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data: profile }) => {
        useUserStore.setState({
          user: {
            ...session.user,
            stripe_customer_id: profile?.stripe_customer_id,
            full_name: profile?.full_name,
            subscribed_to: profile?.subscribed_to,
            price_id: profile?.price_id,
            profile: profile?.profile,
            user_settings: profile?.user_settings,
            address: profile?.address,
            phone: profile?.phone,
            email: profile?.email,
            avatar_url: profile?.avatar_url,
          } as PuklaUser,
          profile,
        });
      });
  } else {
    useUserStore.setState({ user: null, profile: null });
  }
});

export default useUserStore;
