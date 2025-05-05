"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "../provider/config";
import { ThemeProvider } from "@/components/theme-provider";
import { CursorProvider } from "@/contexts/cursor-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CursorProvider>{children}</CursorProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
