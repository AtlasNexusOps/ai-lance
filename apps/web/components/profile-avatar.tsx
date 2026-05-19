"use client";

import { useAccount } from "wagmi";
import { useRef, useState, useEffect } from "react";
import { Camera, User } from "lucide-react";

const AVATAR_STORAGE_KEY = "ai2work-profile-avatar";

function getStoredAvatar(address: string): string | null {
  try {
    const data = JSON.parse(localStorage.getItem(AVATAR_STORAGE_KEY) || "{}");
    return data[address] || null;
  } catch {
    return null;
  }
}

function storeAvatar(address: string, dataUrl: string) {
  try {
    const data = JSON.parse(localStorage.getItem(AVATAR_STORAGE_KEY) || "{}");
    data[address] = dataUrl;
    localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function ProfileAvatar() {
  const { address, isConnected } = useAccount();
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (address) {
      setAvatar(getStoredAvatar(address));
    } else {
      setAvatar(null);
    }
  }, [address]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !address) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatar(dataUrl);
      storeAvatar(address, dataUrl);
    };
    reader.readAsDataURL(file);

    // reset so same file can be re-selected
    e.target.value = "";
  };

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
        <User className="h-4 w-4 opacity-50" />
        <span className="hidden sm:inline">Please connect wallet</span>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="group relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted transition hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
        title="Change profile picture"
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Profile avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-base font-bold text-muted-foreground">
            {address.slice(2, 4).toUpperCase()}
          </span>
        )}

        {/* hover overlay — camera icon */}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
          <Camera className="h-4 w-4 text-white" />
        </span>
      </button>
    </>
  );
}
