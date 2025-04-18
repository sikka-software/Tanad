import { createContext, useContext, useEffect, useState, ReactNode } from "react";

import useUserStore from "@/hooks/use-user-store";
import { supabase } from "@/lib/supabase";

// Create a context for the user data
interface UserContextType {
  user_id: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType>({
  user_id: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user_id, setuser_id] = useState<string | null>(null);

  // Get user store methods
  const userStore = useUserStore();
  const storeUser = userStore.user;
  const fetchUserAndProfile = userStore.fetchUserAndProfile;
  const initialized = userStore.initialized;

  useEffect(() => {
    async function loadUser() {
      try {
        if (!initialized || !storeUser) {
          // Initialize the user store
          await fetchUserAndProfile();

          // Also try to get user directly from Supabase
          const { data, error } = await supabase.auth.getUser();
          if (!error && data.user) {
            const authenticateduser_id = data.user.id;
            setuser_id(authenticateduser_id);
            console.log("UserProvider: User authenticated from Supabase:", authenticateduser_id);
          } else {
            console.log("UserProvider: No user found in Supabase session");
          }
        } else {
          // User already in store
          setuser_id(storeUser.id);
          console.log("UserProvider: User found in store:", storeUser.id);
        }
      } catch (error) {
        console.error("UserProvider: Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [initialized, storeUser?.id, fetchUserAndProfile]);

  // Update user_id when store changes - only when storeUser.id changes
  useEffect(() => {
    if (storeUser?.id) {
      setuser_id(storeUser.id);
      console.log("UserProvider: Updated user_id from store:", storeUser.id);
    }
  }, [storeUser?.id]);

  // Provide the user context
  const value = {
    user_id,
    isLoading,
    isAuthenticated: !!user_id,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
