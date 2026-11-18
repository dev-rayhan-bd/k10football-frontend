"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMessageCircle } from "@tabler/icons-react";
import { useAppSelector } from "@/redux/hooks/hooks";
import { getUserRole } from "@/helpers/SessionHelper";

export const ChatHeaderIcon = () => {
  const pathname = usePathname();
  const totalUnreadCount = useAppSelector((state) => state.chat.totalUnreadCount);
  const userRole = (getUserRole() || "").toLowerCase();

  // Players are excluded from chat per FIFA Child Safeguarding compliance
  if (userRole === "player" || pathname.startsWith("/dashboard/player")) {
    return null;
  }

  let chatUrl = "/dashboard/coach/chat";
  if (userRole === "academy" || pathname.startsWith("/dashboard/academy")) {
    chatUrl = "/dashboard/academy/management/chat";
  } else if (userRole === "agent" || pathname.startsWith("/dashboard/agent")) {
    chatUrl = "/dashboard/agent/chat";
  } else if (userRole === "club" || pathname.startsWith("/dashboard/club")) {
    chatUrl = "/dashboard/club/chat";
  } else if (userRole === "coach" || pathname.startsWith("/dashboard/coach")) {
    chatUrl = "/dashboard/coach/chat";
  } else if (userRole === "parent" || pathname.startsWith("/dashboard/parent")) {
    chatUrl = "/dashboard/parent/chat";
  } else if (
    userRole === "admin" ||
    userRole === "super_admin" ||
    pathname.startsWith("/dashboard/admin")
  ) {
    chatUrl = "/dashboard/admin/chat";
  }

  return (
    <Link
      href={chatUrl}
      className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors flex items-center justify-center border border-white/10"
      title="Messages"
    >
      <IconMessageCircle size={18} />
      {totalUnreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#E31B23] text-white text-[9px] font-bold flex items-center justify-center shadow-md animate-pulse">
          {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
        </span>
      )}
    </Link>
  );
};

export default ChatHeaderIcon;
