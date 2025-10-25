"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export const useSignOut = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Clear the authentication token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      
      // Additional cleanup can be done here if needed
      // For example, clearing other user data, cookies, etc.
      
      // Redirect to login page
      router.push("/auth/login");
      router.refresh(); // Refresh to ensure the auth state updates
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during sign out");
      setIsLoading(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { signOut, isLoading, error };
};