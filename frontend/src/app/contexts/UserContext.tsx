"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { decodeJWT } from "../../lib/jwt";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // First, check if user data is stored in localStorage from registration/login
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData);
          setUser(parsedUser);
          setLoading(false);
          return;
        } catch (e) {
          console.error("Error parsing stored user data:", e);
        }
      }

      // If not in localStorage, try to decode the JWT token to get user data
      try {
        const decodedToken = decodeJWT(token);
        if (decodedToken && decodedToken.user_id && decodedToken.email) {
          // Create user object based on JWT payload
          const userData = {
            id: decodedToken.user_id || decodedToken.sub || decodedToken.id,
            email: decodedToken.email,
            firstName: decodedToken.firstName || decodedToken.given_name || '',
            lastName: decodedToken.lastName || decodedToken.family_name || '',
            username: decodedToken.username || decodedToken.preferred_username
          };
          setUser(userData);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Error decoding JWT token:", e);
      }

      // If we can't get user data, set as null
      setUser(null);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetchUser = () => {
    fetchUser();
  };

  return (
    <UserContext.Provider value={{ user, loading, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};