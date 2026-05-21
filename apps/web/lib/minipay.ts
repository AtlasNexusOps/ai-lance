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
/// `window.ethereum.isMiniPay = true`. Returns true if MiniPay is detected.
/// Connection is handled by the Header auto-connect effect — this hook only detects.
export function useMiniPayDetection() {
  const [isMiniPay, setIsMiniPay] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.ethereum?.isMiniPay) {
      setIsMiniPay(true);
    }
  }, []);

  return isMiniPay;
}
