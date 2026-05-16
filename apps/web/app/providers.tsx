"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { wagmiConfig } from "@/lib/wagmi";
import { ChainProvider } from "@/lib/chain/context";
import { TransactionToast } from "@/components/transaction-toast";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ChainProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <TransactionToast />
          </ThemeProvider>
        </ChainProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
