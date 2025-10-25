"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { getGraphQLClient } from "../../lib/graphqlClient";
import { REGISTER_USER } from "../../graphql/mutations";
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
  signUp: {
    user: {
      id: string;
      email: string;
    };
    token: string;
    errors: string[];
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterInput>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [applicationErrors, setApplicationErrors] = useState<string[]>([]);

  const mutation = useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: async ({ email, password, firstName, lastName }) => {
      const client = getGraphQLClient(); // dynamic client
      return client.request<RegisterResponse>(REGISTER_USER, {
        email,
        password,
        firstName,
        lastName,
      });
    },
    onSuccess: (res) => {
      // Check for application-level errors in the response
      if (res.signUp.errors && res.signUp.errors.length > 0) {
        // Store application errors to display in UI
        setApplicationErrors(res.signUp.errors);
      } else {
        // Clear any previous application errors on success
        setApplicationErrors([]);
        
        // Store user data and token for later use
        if (res.signUp.token && res.signUp.user) {
          localStorage.setItem("token", res.signUp.token);
          
          // Store user data to use in UserContext
          const userData = {
            id: res.signUp.user.id,
            email: res.signUp.user.email,
            firstName: formData.firstName, // Use form data since backend might not return full name
            lastName: formData.lastName
          };
          localStorage.setItem("userData", JSON.stringify(userData));
        }
        
        // After successful registration, redirect to login page
        router.push("/auth/login");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
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

            {mutation.isError && (
              <p className="text-sm text-red-500">{mutation.error.message}</p>
            )}
            {applicationErrors.length > 0 && (
              <p className="text-sm text-red-500">{applicationErrors.join(", ")}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Registering..." : "Sign Up"}
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
