export type ChatRole =
  | "ALL"
  | "PARENTS"
  | "COACHES"
  | "AGENTS"
  | "CLUBS"
  | "ACADEMIES"
  | "PARENT"
  | "COACH"
  | "AGENT"
  | "SCOUT"
  | "CLUB"
  | "ACADEMY"
  | "ADMIN"
  | "SUPER_ADMIN";

export interface IChatUser {
  _id: string;
  id?: string;
  name: string;
  fullName?: string;
  role: string;
  avatar?: string;
  email?: string;
  club?: string;
  isOnline?: boolean;
}

export interface IConversation {
  _id: string;
  id: string;
  type: "INDIVIDUAL" | "GROUP";
  name?: string;
  avatar?: string;
  user?: IChatUser;
  participants?: IChatUser[];
  participantIds?: string[];
  /** Includes the current user (from GET /chats/conversations/:id). */
  membersCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  time?: string;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMessage {
  _id: string;
  id: string;
  conversationId: string;
  senderId: string;
  sender?: IChatUser;
  text?: string;
  imageUrl?: string;
  attachmentsJson?: string | null;
  isRead: boolean;
  isMe?: boolean;
  time?: string;
  createdAt: string;
  isSending?: boolean;
  isError?: boolean;
}

export interface IContact {
  _id: string;
  id?: string;
  name: string;
  fullName?: string;
  role: string;
  avatar?: string;
  email?: string;
  club?: string;
  isOnline?: boolean;
}

export interface IUploadAttachmentData {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isImage: boolean;
}

export interface IUploadAttachmentResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IUploadAttachmentData;
}

export interface IContactsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: IContact[];
}

export interface IConversationsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: IConversation[];
}

export interface IMessagesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IMessage[];
}

export interface IMarkReadResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    success: boolean;
    modifiedCount?: number;
  };
}

export type StartConversationPayload =
  | {
      type: "INDIVIDUAL";
      participantId: string;
    }
  | {
      type: "GROUP";
      name: string;
      avatar?: string;
      participantIds: string[];
    };

export interface SendMessagePayload {
  conversationId?: string;
  receiverId?: string;
  text?: string;
  imageUrl?: string;
  attachmentsJson?: string;
}

// GET /chats/conversations/:conversationId (also returned by PATCH)
export type ConversationMemberRole = "ADMIN" | "MEMBER";

export interface IConversationMember {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  userRole?: string;
  chatRole?: ConversationMemberRole | string;
  isAdmin?: boolean;
  isCreator?: boolean;
  isMe?: boolean;
  isOnline?: boolean;
  joinedAt?: string;
}

export interface IConversationDetails {
  _id: string;
  type: "GROUP" | "INDIVIDUAL";
  name?: string;
  avatar?: string;
  creatorId?: string;
  membersCount: number;
  members: IConversationMember[];
  myChatRole?: ConversationMemberRole | string;
  permissions?: { canEdit?: boolean; canDelete?: boolean };
  createdAt?: string;
}

export interface IConversationDetailsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IConversationDetails;
}

export interface IDeleteConversationResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: { conversationId: string; deleted: boolean };
}
