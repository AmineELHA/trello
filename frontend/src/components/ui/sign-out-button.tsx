"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/app/hooks/useSignOut";

export default function SignOutButton() {
  const { signOut, isLoading } = useSignOut();

  return (
    <Button
      variant="outline"
      onClick={signOut}
      disabled={isLoading}
      className="ml-4"
    >
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}