import { createContext, useContext, useEffect, useState, ReactNode } from "react";

import useUserStore from "@/hooks/use-user-store";
import { supabase } from "@/lib/supabase";

// Create a context for the user data
interface UserContextType {
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType>({
  userId: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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
            const authenticatedUserId = data.user.id;
            setUserId(authenticatedUserId);
            console.log("UserProvider: User authenticated from Supabase:", authenticatedUserId);
          } else {
            console.log("UserProvider: No user found in Supabase session");
          }
        } else {
          // User already in store
          setUserId(storeUser.id);
          console.log("UserProvider: User found in store:", storeUser.id);
        }
      } catch (error) {
        console.error("UserProvider: Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [initialized, storeUser, fetchUserAndProfile]);

  // Update userId when store changes
  useEffect(() => {
    if (storeUser?.id) {
      setUserId(storeUser.id);
      console.log("UserProvider: Updated userId from store:", storeUser.id);
    }
  }, [storeUser]);

  // Provide the user context
  const value = {
    userId,
    isLoading,
    isAuthenticated: !!userId,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
