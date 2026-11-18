/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { IMessage } from "@/types/chat.type";
import { formatMessageTime, getRoleBadgeStyle } from "@/helpers/ChatHelper";
import { IconCheck, IconChecks, IconLoader2 } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChatMessageItemProps {
  message: IMessage;
  isGroupChat?: boolean;
  onImageClick?: (url: string) => void;
}

export const ChatMessageItem = ({
  message,
  isGroupChat = false,
  onImageClick,
}: ChatMessageItemProps) => {
  const isMe = Boolean(message.isMe);
  const timeFormatted = message.time || formatMessageTime(message.createdAt);
  const senderRole = message.sender?.role;
  const roleStyle = getRoleBadgeStyle(senderRole);

  return (
    <div
      className={cn(
        "flex w-full gap-2.5 my-1.5",
        isMe ? "justify-end" : "justify-start"
      )}
    >
      {/* Incoming Avatar for Group Chats or DM */}
      {!isMe && (
        <div className="shrink-0 self-end mb-1">
          {message.sender?.avatar ? (
            <img
              src={message.sender.avatar}
              alt={message.sender.name || "Sender"}
              className="size-7 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="size-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/70">
              {(message.sender?.name || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={cn(
          "flex flex-col max-w-[85%] sm:max-w-[70%]",
          isMe ? "items-end" : "items-start"
        )}
      >
        {/* Sender name for group chats if incoming */}
        {!isMe && isGroupChat && message.sender && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span className="text-[11px] font-semibold text-white/80">
              {message.sender.name}
            </span>
            {senderRole && (
              <Badge className={cn("text-[8px] px-1 py-0 h-3.5 font-bold uppercase", roleStyle.badge)}>
                {senderRole}
              </Badge>
            )}
          </div>
        )}

        {/* Message Card */}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm transition-all break-words shadow-md",
            isMe
              ? "bg-[#E31B23] text-white rounded-br-xs"
              : "bg-[#1E1E1E] text-white/90 border border-white/10 rounded-bl-xs"
          )}
        >
          {/* Image Attachment (if present) */}
          {message.imageUrl && (
            <div className="mb-2 overflow-hidden rounded-xl bg-black/30 border border-white/10">
              <img
                src={message.imageUrl}
                alt="Attachment"
                onClick={() => onImageClick?.(message.imageUrl!)}
                className="max-h-60 w-auto max-w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              />
            </div>
          )}

          {/* Text Message */}
          {message.text && (
            <p className="whitespace-pre-wrap leading-relaxed text-[13px] sm:text-sm select-text">
              {message.text}
            </p>
          )}

          {/* Timestamp & Status Icon */}
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-[10px] select-none",
              isMe ? "justify-end text-white/70" : "justify-start text-white/40"
            )}
          >
            <span>{timeFormatted}</span>
            {isMe && (
              <span>
                {message.isSending ? (
                  <IconLoader2 size={12} className="animate-spin text-white/80" />
                ) : message.isRead ? (
                  <IconChecks size={14} className="text-sky-300" title="Read" />
                ) : (
                  <IconCheck size={14} className="text-white/70" title="Sent" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
