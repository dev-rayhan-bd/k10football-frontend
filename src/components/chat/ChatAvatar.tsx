/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { IconUsers } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/** Relative upload paths ("/uploads/x.jpg") are served by the API host, not the frontend. */
export const resolveChatMediaUrl = (url?: string | null): string => {
  const value = (url || "").trim();
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  try {
    const origin = new URL(process.env.NEXT_PUBLIC_API_BASE_URL || "").origin;
    return `${origin}${value.startsWith("/") ? "" : "/"}${value}`;
  } catch {
    return value;
  }
};

/**
 * Chat avatar: the photo when it loads, otherwise the name's initial
 * (or the group icon) — never a broken image showing its alt text.
 */
const ChatAvatar = ({
  src,
  name,
  isGroup = false,
  className,
}: {
  src?: string | null;
  name?: string;
  isGroup?: boolean;
  className?: string;
}) => {
  const resolved = resolveChatMediaUrl(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(resolved) && failedSrc !== resolved;

  if (showImage) {
    return (
      <img
        src={resolved}
        alt={name || "Avatar"}
        onError={() => setFailedSrc(resolved)}
        className={cn("rounded-full object-cover border border-white/10", className)}
      />
    );
  }

  if (isGroup) {
    return (
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white",
          className
        )}
      >
        <IconUsers className="size-1/2" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-white/10 flex items-center justify-center font-bold text-white/80",
        className
      )}
    >
      {(name || "U").trim().charAt(0).toUpperCase()}
    </div>
  );
};

export default ChatAvatar;
