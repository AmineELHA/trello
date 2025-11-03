"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  errors?: string[];
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Check if user is already authenticated when the page loads
  useEffect(() => {
    const checkAuth = async () => {
      // Check cookies by looking at document.cookie
      if (document.cookie.includes('auth-token')) {
        router.push("/boards");
      } else {
        // Check localStorage as fallback
        const token = localStorage.getItem("token");
        if (token) {
          router.push("/boards");
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || data.errors) {
        setError(data.errors?.join(", ") || "Login failed");
        setIsLoading(false);
        return;
      }

      if (data.success && data.token) {
        // Set token in localStorage as fallback for client-side operations
        localStorage.setItem("token", data.token);
        
        // Fetch user data to store in localStorage for UserContext
        try {
          // Make an authenticated request to get user data
          const userResponse = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.token}`,
            },
            body: JSON.stringify({
              query: `
                query GetCurrentUser {
                  currentUser {
                    id
                    email
                    firstName
                    lastName
                    username
                  }
                }
              `
            })
          });
          
          const userResult = await userResponse.json();
          if (userResult.data && userResult.data.currentUser) {
            localStorage.setItem("userData", JSON.stringify(userResult.data.currentUser));
          }
        } catch (err) {
          console.error("Error fetching user data after login:", err);
          // If we can't fetch user data, we'll still proceed to boards
          // The UserContext will try to decode from the JWT as a fallback
        }
        
        router.push("/boards");
      }
    } catch (err) {
      setError("An error occurred during login");
      setIsLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white w-full"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white w-full"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
