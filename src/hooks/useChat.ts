/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  setActiveConversationId,
  setActiveConversation,
  setConversations,
  upsertConversation,
  setConversationMessages,
  addMessage,
  updateConversationSidebar,
  markMessagesReadInConversation,
  setUserOnlineStatus,
  setUserTyping,
  setUserStopTyping,
  setLoadingConversations,
  setLoadingMessages,
} from "@/redux/features/chat/chatSlice";
import {
  useGetConversationsQuery,
  useLazyGetMessagesQuery,
  useUploadAttachmentMutation,
  useMarkMessagesReadMutation,
} from "@/redux/features/chat/chatApi";
import { socketService } from "@/services/socket.service";
import { getToken, getDecodedToken, getUserInfo } from "@/helpers/SessionHelper";
import { IConversation, IMessage, IChatUser } from "@/types/chat.type";
import { toast } from "sonner";
import { formatMessageTime } from "@/helpers/ChatHelper";

export const useChat = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.accessToken) || getToken();

  const {
    activeConversationId,
    activeConversation,
    conversations,
    messages,
    typingUsers,
    onlineUserIds,
    totalUnreadCount,
    isLoadingConversations,
    isLoadingMessages,
  } = useAppSelector((state) => state.chat);

  const [triggerGetMessages] = useLazyGetMessagesQuery();
  const [uploadAttachmentMutation] = useUploadAttachmentMutation();
  const [markMessagesReadMutation] = useMarkMessagesReadMutation();

  // Current User Identification
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

  const currentUser = useMemo<IChatUser>(() => {
    const info = getUserInfo();
    return {
      _id: currentUserId,
      id: currentUserId,
      name: authUser?.fullName || authUser?.name || info.fullName || "Me",
      role: authUser?.role || info.role || "USER",
      avatar: authUser?.avatar || authUser?.profileImg || info.profileImg || "",
      email: authUser?.email || info.email || "",
      isOnline: true,
    };
  }, [authUser, currentUserId]);

  // Initial load of conversations via REST
  const {
    data: conversationsResponse,
    isLoading: isFetchingConversations,
    refetch: refetchConversations,
  } = useGetConversationsQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    dispatch(setLoadingConversations(isFetchingConversations));
  }, [isFetchingConversations, dispatch]);

  useEffect(() => {
    if (conversationsResponse?.data) {
      dispatch(setConversations(conversationsResponse.data));
    }
  }, [conversationsResponse, dispatch]);

  // Typing debounce timer ref
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active conversation ref to avoid stale closures inside socket event handlers
  const activeConversationIdRef = useRef<string | null>(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Load messages for active conversation
  const loadActiveConversationMessages = useCallback(
    async (convId: string) => {
      if (!convId) return;
      dispatch(setLoadingMessages(true));
      try {
        const res = await triggerGetMessages({ conversationId: convId, page: 1, limit: 100 }).unwrap();
        if (res?.data) {
          dispatch(
            setConversationMessages({
              conversationId: convId,
              messages: res.data,
            })
          );
        }
      } catch (err) {
        console.error("Failed to load messages for conversation:", convId, err);
      } finally {
        dispatch(setLoadingMessages(false));
      }
    },
    [triggerGetMessages, dispatch]
  );

  // Select conversation (room switching)
  const selectConversation = useCallback(
    async (convId: string, conversationData?: IConversation) => {
      if (!convId) return;

      const previousConvId = activeConversationIdRef.current;
      if (previousConvId && previousConvId !== convId) {
        socketService.leaveConversation(previousConvId);
      }

      dispatch(setActiveConversationId(convId));
      if (conversationData) {
        dispatch(setActiveConversation(conversationData));
      }

      // Socket room join
      socketService.setActiveConversation(convId);

      // Mark as read immediately on socket and REST fallback
      socketService.markAsRead(convId);
      markMessagesReadMutation({ conversationId: convId }).catch(() => {});

      // Load message history
      await loadActiveConversationMessages(convId);
    },
    [dispatch, loadActiveConversationMessages, markMessagesReadMutation]
  );

  // Close conversation / leave room
  const closeConversation = useCallback(() => {
    const currentId = activeConversationIdRef.current;
    if (currentId) {
      socketService.leaveConversation(currentId);
    }
    dispatch(setActiveConversationId(null));
    socketService.setActiveConversation(null);
  }, [dispatch]);

  // Handle Socket.io lifecycle and event listeners
  useEffect(() => {
    if (!token) return;

    const socket = socketService.connect(token);
    if (!socket) return;

    const handleConnect = () => {
      if (activeConversationIdRef.current) {
        socketService.joinConversation(activeConversationIdRef.current);
      }
      refetchConversations();
    };

    const handleNewMessage = (message: IMessage) => {
      dispatch(addMessage({ message, currentUserId }));

      const currentActive = activeConversationIdRef.current;
      if (currentActive && message.conversationId === currentActive) {
        socketService.markAsRead(currentActive);
        markMessagesReadMutation({ conversationId: currentActive }).catch(() => {});
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

    const handleUserTyping = (data: {
      conversationId: string;
      user: { _id: string; name: string; avatar?: string; role?: string };
    }) => {
      if (data.user._id !== currentUserId) {
        dispatch(setUserTyping(data));
      }
    };

    const handleUserStopTyping = (data: { conversationId: string; userId: string }) => {
      dispatch(setUserStopTyping(data));
    };

    const handleUserOnline = (data: { userId: string; status: "online" }) => {
      dispatch(setUserOnlineStatus({ userId: data.userId, isOnline: true }));
    };

    const handleUserOffline = (data: { userId: string; status: "offline" }) => {
      dispatch(setUserOnlineStatus({ userId: data.userId, isOnline: false }));
    };

    const handleConversationStarted = (payload: { success: boolean; data: IConversation }) => {
      if (payload?.success && payload.data) {
        dispatch(upsertConversation(payload.data));
        selectConversation(payload.data._id || payload.data.id, payload.data);
      }
    };

    const handleChatError = (err: { event?: string; message?: string }) => {
      console.error("[Chat Error]:", err);
      toast.error(err.message || "An error occurred in chat");
    };

    socket.on("connect", handleConnect);
    socket.on("new_message", handleNewMessage);
    socket.on("conversation_updated", handleConversationUpdated);
    socket.on("messages_read", handleMessagesRead);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("conversation_started", handleConversationStarted);
    socket.on("chat_error", handleChatError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_message", handleNewMessage);
      socket.off("conversation_updated", handleConversationUpdated);
      socket.off("messages_read", handleMessagesRead);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("conversation_started", handleConversationStarted);
      socket.off("chat_error", handleChatError);
    };
  }, [token, currentUserId, dispatch, selectConversation, refetchConversations, markMessagesReadMutation]);

  // Clean room leaving on unmount
  useEffect(() => {
    return () => {
      if (activeConversationIdRef.current) {
        socketService.leaveConversation(activeConversationIdRef.current);
      }
    };
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (text?: string, imageUrl?: string) => {
      const activeId = activeConversationIdRef.current;
      const trimmedText = text?.trim() || "";

      if (!activeId) {
        toast.error("No active conversation selected");
        return;
      }

      if (!trimmedText && !imageUrl) {
        toast.error("Message cannot be empty");
        return;
      }

      // Stop typing immediately when sending
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      socketService.emitStopTyping(activeId);

      // Create optimistic message
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const optimisticMsg: IMessage = {
        _id: tempId,
        id: tempId,
        conversationId: activeId,
        senderId: currentUserId,
        sender: currentUser,
        text: trimmedText || undefined,
        imageUrl: imageUrl || undefined,
        isRead: false,
        isMe: true,
        createdAt: new Date().toISOString(),
        time: formatMessageTime(new Date().toISOString()),
        isSending: true,
      };

      dispatch(addMessage({ message: optimisticMsg, currentUserId }));

      // Emit through socket
      socketService.sendMessage({
        conversationId: activeId,
        text: trimmedText || undefined,
        imageUrl: imageUrl || undefined,
      });
    },
    [currentUserId, currentUser, dispatch]
  );

  // Attachment upload
  const uploadAttachment = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await uploadAttachmentMutation(formData).unwrap();
        if (res?.data?.url) {
          return res.data;
        }
        throw new Error(res?.message || "Failed to upload file");
      } catch (err: any) {
        const msg = err?.data?.message || err?.message || "Attachment upload failed";
        toast.error(msg);
        throw err;
      }
    },
    [uploadAttachmentMutation]
  );

  // Typing event triggers
  const handleTyping = useCallback(() => {
    const activeId = activeConversationIdRef.current;
    if (!activeId) return;

    socketService.emitTyping(activeId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitStopTyping(activeId);
      typingTimeoutRef.current = null;
    }, 2000);
  }, []);

  const handleStopTyping = useCallback(() => {
    const activeId = activeConversationIdRef.current;
    if (!activeId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socketService.emitStopTyping(activeId);
  }, []);

  // Start Individual Conversation
  const startIndividualConversation = useCallback(
    (participantId: string) => {
      socketService.startConversation({
        type: "INDIVIDUAL",
        participantId,
      });
    },
    []
  );

  // Start Group Conversation
  const startGroupConversation = useCallback(
    (name: string, participantIds: string[], avatar?: string) => {
      socketService.startConversation({
        type: "GROUP",
        name,
        avatar,
        participantIds,
      });
    },
    []
  );

  const activeMessages = useMemo(() => {
    if (!activeConversationId) return [];
    return messages[activeConversationId] || [];
  }, [activeConversationId, messages]);

  const activeTypingUsers = useMemo(() => {
    if (!activeConversationId) return [];
    return typingUsers[activeConversationId] || [];
  }, [activeConversationId, typingUsers]);

  return {
    currentUserId,
    currentUser,
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    activeTypingUsers,
    onlineUserIds,
    totalUnreadCount,
    isLoadingConversations,
    isLoadingMessages,
    selectConversation,
    closeConversation,
    sendMessage,
    uploadAttachment,
    handleTyping,
    handleStopTyping,
    startIndividualConversation,
    startGroupConversation,
    refetchConversations,
  };
};
