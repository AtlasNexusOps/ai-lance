"use client";

import * as React from "react";

declare global {
  interface Window {
    ethereum?: {
      isMiniPay?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

/// Detects the Opera MiniPay in-app browser. When present, MiniPay auto-injects
/// `window.ethereum.isMiniPay = true` and expects the dapp to call
/// `eth_requestAccounts` eagerly so the user lands inside an authorised session.
export function useMiniPayDetection() {
  const [isMiniPay, setIsMiniPay] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.ethereum?.isMiniPay) {
      setIsMiniPay(true);
      window.ethereum.request({ method: "eth_requestAccounts" }).catch(() => {
        // User dismissed connection — leave isMiniPay true so the UI can still
        // adapt (hide WalletConnect, surface a "tap your address" hint).
      });
    }
  }, []);

  return isMiniPay;
}
