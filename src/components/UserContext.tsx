import { createContext, useContext, useEffect, useState } from "react";

import { User as SupabaseUser } from "@supabase/supabase-js";

import useUserStore from "@/hooks/use-user-store";
import { supabase } from "@/lib/supabase";

type UserType = SupabaseUser & {
  stripe_customer_id: string | null;
  full_name: string | null;
  subscribed_to: string | null;
  price_id: string | null;
};

interface UserContextType {
  user: UserType | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: UserType | null) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    user: storeUser,
    setUser: setUserStore,
    fetchUserAndProfile,
  } = useUserStore((state) => state);

  // Sync context with store
  useEffect(() => {
    if (storeUser) {
      setUser(storeUser as UserType);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [storeUser]);

  const refreshUser = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session) {
        // Get user profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) throw profileError;

        // Combine auth and profile data
        const updatedUser = {
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
        };

        setUserStore(updatedUser);
        setUser(updatedUser as UserType);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  useEffect(() => {
    // Initialize user data
    fetchUserAndProfile().then(() => {
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        refreshUser();
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
