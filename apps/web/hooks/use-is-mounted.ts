"use client";

import { useState, useEffect } from "react";

/**
 * Returns true after the component has mounted client-side.
 * Use this to prevent SSR hydration mismatches in Wagmi/Viem components.
 *
 * @example
 * const mounted = useIsMounted();
 * if (!mounted) return <Skeleton />;
 * return <WalletUI address={address} />;
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return mounted;
}
