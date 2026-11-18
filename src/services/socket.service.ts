import { io, Socket } from "socket.io-client";
import { getToken } from "@/helpers/SessionHelper";
import { SendMessagePayload, StartConversationPayload } from "@/types/chat.type";

const getSocketServerUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiBase) {
    try {
      const url = new URL(apiBase);
      return url.origin;
    } catch {
      return apiBase.replace(/\/api\/v1\/?$/, "");
    }
  }
  return "http://localhost:5005";
};

class SocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;
  private activeConversationId: string | null = null;
  private isConnecting: boolean = false;

  public getSocket(): Socket | null {
    return this.socket;
  }

  public connect(tokenOverride?: string): Socket | null {
    if (typeof window === "undefined") return null;

    const token = tokenOverride || getToken();
    const cleanToken = token ? token.replace(/^Bearer\s+/i, "").trim() : "";

    if (!cleanToken) {
      if (this.socket) {
        this.disconnect();
      }
      return null;
    }

    // Reuse existing socket if connected with same token
    if (this.socket && this.socket.connected && this.currentToken === cleanToken) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentToken = cleanToken;
    this.isConnecting = true;

    const socketUrl = getSocketServerUrl();

    this.socket = io(socketUrl, {
      auth: {
        token: cleanToken,
      },
      query: {
        token: cleanToken,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      this.isConnecting = false;
      // Re-join active conversation room if we were previously in one
      if (this.activeConversationId) {
        this.joinConversation(this.activeConversationId);
      }
    });

    this.socket.on("disconnect", () => {
      this.isConnecting = false;
    });

    this.socket.on("connect_error", (error) => {
      this.isConnecting = false;
      console.warn("[Socket] Connect error:", error.message);
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      if (this.activeConversationId) {
        this.leaveConversation(this.activeConversationId);
      }
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null;
      this.activeConversationId = null;
      this.isConnecting = false;
    }
  }

  public setActiveConversation(conversationId: string | null): void {
    if (this.activeConversationId && this.activeConversationId !== conversationId) {
      this.leaveConversation(this.activeConversationId);
    }
    this.activeConversationId = conversationId;
    if (conversationId) {
      this.joinConversation(conversationId);
    }
  }

  public getActiveConversationId(): string | null {
    return this.activeConversationId;
  }

  public joinConversation(conversationId: string): void {
    if (!this.socket || !conversationId) return;
    this.socket.emit("join_conversation", { conversationId });
  }

  public leaveConversation(conversationId: string): void {
    if (!this.socket || !conversationId) return;
    this.socket.emit("leave_conversation", { conversationId });
  }

  public sendMessage(payload: SendMessagePayload): void {
    if (!this.socket) {
      this.connect();
    }
    if (this.socket) {
      this.socket.emit("send_message", payload);
    }
  }

  public startConversation(payload: StartConversationPayload): void {
    if (!this.socket) {
      this.connect();
    }
    if (this.socket) {
      this.socket.emit("start_conversation", payload);
    }
  }

  public emitTyping(conversationId: string): void {
    if (this.socket && conversationId) {
      this.socket.emit("typing", { conversationId });
    }
  }

  public emitStopTyping(conversationId: string): void {
    if (this.socket && conversationId) {
      this.socket.emit("stop_typing", { conversationId });
    }
  }

  public markAsRead(conversationId: string): void {
    if (this.socket && conversationId) {
      this.socket.emit("mark_as_read", { conversationId });
    }
  }
}

export const socketService = new SocketService();
