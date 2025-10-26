"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface RegisterResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
  };
  errors?: string[];
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterInput>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    setErrors([]);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok || data.errors) {
        setErrors(data.errors || ["Registration failed"]);
        setIsLoading(false);
        return;
      }

      if (data.success && data.token) {
        // Set token in localStorage as fallback for client-side operations
        localStorage.setItem("token", data.token);
        
        // Store user data to use in UserContext
        const userData = {
          id: data.user?.id,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        };
        localStorage.setItem("userData", JSON.stringify(userData));

        // After successful registration, redirect to login page
        router.push("/auth/login");
      }
    } catch (err) {
      setErrors(["An error occurred during registration"]);
      setIsLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Create an Account
          </CardTitle>
        </CardHeader>

        <CardContent>
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errors.join(", ")}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-blue-600 hover:underline ml-1"
          >
            Sign in
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
