/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { IConversation } from "@/types/chat.type";
import { formatConversationTime, getRoleBadgeStyle } from "@/helpers/ChatHelper";
import { Badge } from "@/components/ui/badge";
import { IconUsers } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ChatConversationItemProps {
  conversation: IConversation;
  isActive: boolean;
  onClick: () => void;
}

export const ChatConversationItem = ({
  conversation,
  isActive,
  onClick,
}: ChatConversationItemProps) => {
  const isGroup = conversation.type === "GROUP";
  const user = conversation.user;

  const displayName = isGroup
    ? conversation.name || "Group Chat"
    : user?.fullName || user?.name || "Member";

  const avatarUrl = isGroup ? conversation.avatar : user?.avatar;
  const isOnline = !isGroup && Boolean(user?.isOnline);
  const timeFormatted = formatConversationTime(
    conversation.lastMessageTime || conversation.updatedAt || conversation.createdAt
  );

  const roleStyle = getRoleBadgeStyle(user?.role);
  const unreadCount = conversation.unreadCount || 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left relative group",
        isActive
          ? "bg-white/10 border border-white/15 shadow-sm"
          : "hover:bg-white/[0.05] border border-transparent"
      )}
    >
      {/* Avatar Container */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="size-11 rounded-full object-cover border border-white/10"
          />
        ) : isGroup ? (
          <div className="size-11 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white">
            <IconUsers size={20} />
          </div>
        ) : (
          <div className="size-11 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/80">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Online Indicator for 1-on-1 */}
        {isOnline && (
          <span
            className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-[#111111]"
            title="Online"
          />
        )}
      </div>

      {/* Middle Text Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "text-sm font-semibold truncate",
                isActive ? "text-white" : "text-white/90 group-hover:text-white"
              )}
            >
              {displayName}
            </span>
            {!isGroup && user?.role && (
              <Badge className={cn("text-[8px] px-1.5 py-0 h-4 font-bold uppercase shrink-0", roleStyle.badge)}>
                {user.role}
              </Badge>
            )}
            {isGroup && (
              <Badge className="text-[8px] px-1.5 py-0 h-4 font-bold uppercase bg-white/10 text-white/80 border border-white/10 shrink-0">
                Group
              </Badge>
            )}
          </div>
          {timeFormatted && (
            <span className="text-[11px] text-white/40 shrink-0">
              {timeFormatted}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-xs truncate leading-snug",
              unreadCount > 0 ? "text-white font-medium" : "text-white/50"
            )}
          >
            {conversation.lastMessage || "Tap to chat..."}
          </p>

          {/* Unread Badge Counter */}
          {unreadCount > 0 && (
            <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[#E31B23] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
