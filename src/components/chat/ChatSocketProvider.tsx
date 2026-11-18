"use client";

import { useEffect, useRef, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { socketService } from "@/services/socket.service";
import { getToken, getDecodedToken, getUserRole } from "@/helpers/SessionHelper";
import {
  addMessage,
  updateConversationSidebar,
  markMessagesReadInConversation,
  setUserOnlineStatus,
  setConversations,
} from "@/redux/features/chat/chatSlice";
import { useGetConversationsQuery } from "@/redux/features/chat/chatApi";
import { IMessage } from "@/types/chat.type";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export const ChatSocketProvider = () => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const authUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.accessToken) || getToken();
  const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);
  const activeConversationIdRef = useRef<string | null>(activeConversationId);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const currentUserId = useMemo(() => {
    if (authUser?._id) return String(authUser._id);
    if (authUser?.id) return String(authUser.id);
    const decoded = getDecodedToken(token);
    if (decoded?.userId) return String(decoded.userId);
    if (decoded?.id) return String(decoded.id);
    if (decoded?._id) return String(decoded._id);
    if (decoded?.sub) return String(decoded.sub);
    return "";
  }, [authUser, token]);

  const userRole = (getUserRole() || "").toLowerCase();
  const isExcludedRole = userRole === "player";

  // Preload conversations for unread counts across all dashboard pages
  const { data: conversationsResponse } = useGetConversationsQuery(undefined, {
    skip: !token || isExcludedRole,
  });

  useEffect(() => {
    if (conversationsResponse?.data) {
      dispatch(setConversations(conversationsResponse.data));
    }
  }, [conversationsResponse, dispatch]);

  useEffect(() => {
    if (!token || isExcludedRole) return;

    const socket = socketService.connect(token);
    if (!socket) return;

    const handleNewMessage = (message: IMessage) => {
      dispatch(addMessage({ message, currentUserId }));

      const activeId = activeConversationIdRef.current;
      const isCurrentlyViewingChat = pathname.includes("/chat");

      // Show toast notification if message is from someone else and not in active view
      const isSentByMe =
        message.isMe ||
        (Boolean(currentUserId) &&
          (message.senderId === currentUserId || message.sender?._id === currentUserId));

      if (!isSentByMe && (!isCurrentlyViewingChat || activeId !== message.conversationId)) {
        const senderName = message.sender?.name || message.sender?.fullName || "New message";
        const textPreview = message.text || (message.imageUrl ? "Sent an image" : "Sent a message");
        toast.info(`${senderName}: ${textPreview}`, {
          duration: 4000,
        });
      }
    };

    const handleConversationUpdated = (data: {
      conversationId: string;
      lastMessage?: string;
      lastMessageTime?: string;
      unreadIncrement?: number;
      senderName?: string;
    }) => {
      dispatch(updateConversationSidebar(data));
    };

    const handleMessagesRead = (data: {
      conversationId: string;
      readerId: string;
      modifiedCount?: number;
    }) => {
      dispatch(
        markMessagesReadInConversation({
          conversationId: data.conversationId,
          readerId: data.readerId,
          currentUserId,
        })
      );
    };

    const handleUserOnline = (data: { userId: string; status: "online" }) => {
      dispatch(setUserOnlineStatus({ userId: data.userId, isOnline: true }));
    };

    const handleUserOffline = (data: { userId: string; status: "offline" }) => {
      dispatch(setUserOnlineStatus({ userId: data.userId, isOnline: false }));
    };

    socket.on("new_message", handleNewMessage);
    socket.on("conversation_updated", handleConversationUpdated);
    socket.on("messages_read", handleMessagesRead);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("conversation_updated", handleConversationUpdated);
      socket.off("messages_read", handleMessagesRead);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [token, currentUserId, isExcludedRole, dispatch, pathname]);

  return null;
};

export default ChatSocketProvider;
