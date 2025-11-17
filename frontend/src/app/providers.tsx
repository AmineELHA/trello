"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { UserProvider } from "./contexts/UserContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PostHogProvider } from "@/lib/posthog";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PostHogProvider>
          <UserProvider>{children}</UserProvider>
        </PostHogProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
