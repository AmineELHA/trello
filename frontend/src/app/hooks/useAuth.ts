"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
}

export default function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    } else {
      // In a real implementation, you might fetch user data from an API
      // For now, we'll simulate having user data
      try {
        const tokenData = token.split('.')[1];
        const decoded = JSON.parse(atob(tokenData));
        setUser({
          id: decoded.user_id || decoded.id,
          email: decoded.email || "",
          firstName: decoded.first_name || "",
          lastName: decoded.last_name || "",
          username: decoded.username || "",
        });
      } catch (e) {
        console.error("Error decoding token:", e);
        router.push("/auth/login");
      }
      setLoading(false);
    }
  }, [router]);

  return { loading, user };
}
