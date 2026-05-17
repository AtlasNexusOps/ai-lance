"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      // SW registration is best-effort — don't block the app on failure
      console.warn("SW registration failed:", err);
    });
  }, []);

  return null;
}
