import { create } from "zustand";

import { createClient } from "@/utils/supabase/component";

const supabase = createClient();

interface Profile {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

const useUserStore = create<{
  user: any | null;
  profile: any | null;
  loading: boolean;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  fetchUserAndProfile: () => Promise<void>;
}>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user: any) => set({ user }),
  setProfile: (profile: any) => set({ profile }),
  fetchUserAndProfile: async () => {
    set({ loading: true });
    try {
      // Fetch the authenticated user
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user || null;
      set({ user: user as any });

      // Fetch the profile info if user exists
      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) console.error("Error fetching profile:", error);
        set({ profile });
      } else {
        set({ profile: null });
      }
    } finally {
      set({ loading: false });
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
          } as any,
          profile,
        });
      });
  } else {
    useUserStore.setState({ user: null, profile: null });
  }
});

export default useUserStore;
