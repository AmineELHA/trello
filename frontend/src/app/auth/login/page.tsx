"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getGraphQLClient } from "../../lib/graphqlClient";
import { LOGIN_USER } from "../../graphql/mutations";
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
  login: {
    token: string;
    errors: string[];
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const client = getGraphQLClient();

  const mutation = useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: async ({ email, password }) => {
      const client = getGraphQLClient(); // dynamic client
      return client.request(LOGIN_USER, { email, password });
    },
    onSuccess: (res) => {
      if (res.login.errors.length === 0 && res.login.token) {
        localStorage.setItem("token", res.login.token);
        
        // Since login doesn't return user data, we'll need to get it from the JWT token
        // or try to extract from localStorage if it was set during registration
        // If the user was just registered and then logged in, userData should be in localStorage
        // Otherwise, we'll rely on JWT decoding to get user info
        
        router.push("/boards"); // redirect to boards page after login
      } else {
        alert(res.login.errors.join(", "));
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
