import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IConversation, IMessage } from "@/types/chat.type";

export interface ChatState {
  activeConversationId: string | null;
  activeConversation: IConversation | null;
  conversations: IConversation[];
  messages: Record<string, IMessage[]>;
  onlineUserIds: Record<string, boolean>;
  typingUsers: Record<string, { _id: string; name: string; avatar?: string; role?: string }[]>;
  totalUnreadCount: number;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
}

const initialState: ChatState = {
  activeConversationId: null,
  activeConversation: null,
  conversations: [],
  messages: {},
  onlineUserIds: {},
  typingUsers: {},
  totalUnreadCount: 0,
  isLoadingConversations: false,
  isLoadingMessages: false,
};

const calculateTotalUnread = (conversations: IConversation[]): number => {
  return conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversationId(state, action: PayloadAction<string | null>) {
      const convId = action.payload;
      state.activeConversationId = convId;
      if (convId) {
        const found = state.conversations.find((c) => c._id === convId || c.id === convId);
        state.activeConversation = found || null;
        if (found) {
          found.unreadCount = 0;
          state.totalUnreadCount = calculateTotalUnread(state.conversations);
        }
      } else {
        state.activeConversation = null;
      }
    },

    setActiveConversation(state, action: PayloadAction<IConversation | null>) {
      state.activeConversation = action.payload;
      if (action.payload) {
        const id = action.payload._id || action.payload.id;
        state.activeConversationId = id;
        const index = state.conversations.findIndex((c) => (c._id || c.id) === id);
        if (index >= 0) {
          state.conversations[index] = { ...state.conversations[index], ...action.payload, unreadCount: 0 };
        } else {
          state.conversations.unshift({ ...action.payload, unreadCount: 0 });
        }
        state.totalUnreadCount = calculateTotalUnread(state.conversations);
      }
    },

    setConversations(state, action: PayloadAction<IConversation[]>) {
      state.conversations = action.payload.slice().sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.lastMessageTime || b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      state.totalUnreadCount = calculateTotalUnread(state.conversations);
    },

    upsertConversation(state, action: PayloadAction<IConversation>) {
      const conv = action.payload;
      const convId = conv._id || conv.id;
      const index = state.conversations.findIndex((c) => (c._id || c.id) === convId);

      if (index >= 0) {
        state.conversations[index] = {
          ...state.conversations[index],
          ...conv,
        };
        // Move to top
        const [moved] = state.conversations.splice(index, 1);
        state.conversations.unshift(moved);
      } else {
        state.conversations.unshift(conv);
      }

      if (state.activeConversationId === convId) {
        state.activeConversation = { ...state.conversations[0], unreadCount: 0 };
        state.conversations[0].unreadCount = 0;
      }
      state.totalUnreadCount = calculateTotalUnread(state.conversations);
    },

    setConversationMessages(
      state,
      action: PayloadAction<{ conversationId: string; messages: IMessage[] }>
    ) {
      const { conversationId, messages } = action.payload;
      // Deduplicate by _id or id
      const seen = new Set<string>();
      const deduplicated: IMessage[] = [];

      for (const msg of messages) {
        const id = msg._id || msg.id;
        if (!seen.has(id)) {
          seen.add(id);
          deduplicated.push(msg);
        }
      }

      // Sort chronologically (oldest first)
      deduplicated.sort(
        (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );

      state.messages[conversationId] = deduplicated;
    },

    addMessage(state, action: PayloadAction<{ message: IMessage; currentUserId?: string }>) {
      const { message, currentUserId } = action.payload;
      const convId = message.conversationId;
      if (!convId) return;

      const isCurrentActive = state.activeConversationId === convId;
      const isSentByMe =
        message.isMe ||
        (Boolean(currentUserId) &&
          (message.senderId === currentUserId || message.sender?._id === currentUserId));

      const normalizedMsg: IMessage = {
        ...message,
        isMe: isSentByMe,
      };

      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }

      const msgId = normalizedMsg._id || normalizedMsg.id;
      const existingIdx = state.messages[convId].findIndex((m) => (m._id || m.id) === msgId);

      if (existingIdx >= 0) {
        state.messages[convId][existingIdx] = normalizedMsg;
      } else {
        state.messages[convId].push(normalizedMsg);
      }

      // Update sidebar conversation preview
      const previewText =
        normalizedMsg.text ||
        (normalizedMsg.imageUrl ? "📷 Sent an image" : "Sent an attachment");
      const previewTime = normalizedMsg.createdAt || new Date().toISOString();

      const convIndex = state.conversations.findIndex((c) => (c._id || c.id) === convId);
      if (convIndex >= 0) {
        const targetConv = { ...state.conversations[convIndex] };
        targetConv.lastMessage = previewText;
        targetConv.lastMessageTime = previewTime;

        if (isCurrentActive || isSentByMe) {
          targetConv.unreadCount = 0;
        } else {
          targetConv.unreadCount = (targetConv.unreadCount || 0) + 1;
        }

        // Move conversation to top
        state.conversations.splice(convIndex, 1);
        state.conversations.unshift(targetConv);
      } else {
        // Conversation doesn't exist in sidebar yet, create preview stub
        const newConvStub: IConversation = {
          _id: convId,
          id: convId,
          type: "INDIVIDUAL",
          user: normalizedMsg.sender,
          lastMessage: previewText,
          lastMessageTime: previewTime,
          unreadCount: isCurrentActive || isSentByMe ? 0 : 1,
          createdAt: previewTime,
        };
        state.conversations.unshift(newConvStub);
      }

      if (isCurrentActive && state.activeConversation) {
        state.activeConversation = {
          ...state.activeConversation,
          lastMessage: previewText,
          lastMessageTime: previewTime,
          unreadCount: 0,
        };
      }

      state.totalUnreadCount = calculateTotalUnread(state.conversations);
    },

    updateConversationSidebar(
      state,
      action: PayloadAction<{
        conversationId: string;
        lastMessage?: string;
        lastMessageTime?: string;
        unreadIncrement?: number;
        senderName?: string;
      }>
    ) {
      const { conversationId, lastMessage, lastMessageTime, unreadIncrement } = action.payload;
      const isCurrentActive = state.activeConversationId === conversationId;

      const convIndex = state.conversations.findIndex((c) => (c._id || c.id) === conversationId);
      if (convIndex >= 0) {
        const conv = { ...state.conversations[convIndex] };
        if (lastMessage) conv.lastMessage = lastMessage;
        if (lastMessageTime) conv.lastMessageTime = lastMessageTime;

        if (isCurrentActive) {
          conv.unreadCount = 0;
        } else if (typeof unreadIncrement === "number") {
          conv.unreadCount = (conv.unreadCount || 0) + unreadIncrement;
        }

        state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }

      state.totalUnreadCount = calculateTotalUnread(state.conversations);
    },

    markMessagesReadInConversation(
      state,
      action: PayloadAction<{ conversationId: string; readerId?: string; currentUserId?: string }>
    ) {
      const { conversationId, readerId, currentUserId } = action.payload;
      const convId = conversationId;

      // Update sidebar unread count
      const conv = state.conversations.find((c) => (c._id || c.id) === convId);
      if (conv) {
        conv.unreadCount = 0;
      }
      if (state.activeConversation && (state.activeConversation._id || state.activeConversation.id) === convId) {
        state.activeConversation.unreadCount = 0;
      }

      // If reader is NOT the current user, then the other party read MY messages -> mark my sent messages as read!
      if (state.messages[convId]) {
        state.messages[convId] = state.messages[convId].map((msg) => {
          if (readerId && currentUserId && readerId === currentUserId) {
            // I read incoming messages
            if (!msg.isMe) return { ...msg, isRead: true };
          } else {
            // Someone else read my messages
            if (msg.isMe) return { ...msg, isRead: true };
          }
          return msg;
        });
      }

      state.totalUnreadCount = calculateTotalUnread(state.conversations);
    },

    setUserOnlineStatus(state, action: PayloadAction<{ userId: string; isOnline: boolean }>) {
      const { userId, isOnline } = action.payload;
      state.onlineUserIds[userId] = isOnline;

      // Update in conversation users
      state.conversations.forEach((conv) => {
        if (conv.user && (conv.user._id === userId || conv.user.id === userId)) {
          conv.user.isOnline = isOnline;
        }
        if (conv.participants) {
          conv.participants.forEach((p) => {
            if (p._id === userId || p.id === userId) {
              p.isOnline = isOnline;
            }
          });
        }
      });

      if (state.activeConversation?.user && (state.activeConversation.user._id === userId || state.activeConversation.user.id === userId)) {
        state.activeConversation.user.isOnline = isOnline;
      }
    },

    setUserTyping(
      state,
      action: PayloadAction<{ conversationId: string; user: { _id: string; name: string; avatar?: string; role?: string } }>
    ) {
      const { conversationId, user } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      const exists = state.typingUsers[conversationId].some((u) => u._id === user._id);
      if (!exists) {
        state.typingUsers[conversationId].push(user);
      }
    },

    setUserStopTyping(
      state,
      action: PayloadAction<{ conversationId: string; userId: string }>
    ) {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          (u) => u._id !== userId
        );
      }
    },

    setLoadingConversations(state, action: PayloadAction<boolean>) {
      state.isLoadingConversations = action.payload;
    },

    setLoadingMessages(state, action: PayloadAction<boolean>) {
      state.isLoadingMessages = action.payload;
    },
  },
});

export const {
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
} = chatSlice.actions;

export default chatSlice.reducer;
