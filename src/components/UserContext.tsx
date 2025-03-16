import { createContext, useContext, useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import useUserStore from "@/hooks/use-user-store";

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

  const { setUser: setUserStore } = useUserStore((state) => state);

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
        setUserStore({
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
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Get user profile data
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            // Combine auth and profile data
            setUserStore({
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
            });
          });
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Get user profile data
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            // Get links count

            // Combine auth and profile data
            setUserStore({
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
            });
          });
      } else {
        setUser(null);
      }
      setLoading(false);
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
