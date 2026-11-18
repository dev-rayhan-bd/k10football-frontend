import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import {
  IContactsResponse,
  IConversationsResponse,
  IMarkReadResponse,
  IMessagesResponse,
  IUploadAttachmentResponse,
} from "@/types/chat.type";

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContacts: builder.query<
      IContactsResponse,
      { role?: string; search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.role && params.role !== "ALL") queryParams.append("role", params.role);
        if (params?.search) queryParams.append("search", params.search);
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        return {
          url: `/chats/contacts?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.CHATS],
    }),

    getConversations: builder.query<
      IConversationsResponse,
      { search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append("search", params.search);
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        return {
          url: `/chats/conversations?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.CONVERSATIONS],
    }),

    getMessages: builder.query<
      IMessagesResponse,
      { conversationId: string; page?: number; limit?: number }
    >({
      query: ({ conversationId, page = 1, limit = 100 }) => ({
        url: `/chats/messages/${conversationId}?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: (_result, _error, { conversationId }) => [
        { type: TagTypes.CHATS, id: conversationId },
      ],
    }),

    uploadAttachment: builder.mutation<IUploadAttachmentResponse, FormData>({
      query: (formData) => ({
        url: "/chats/upload-attachment",
        method: "POST",
        body: formData,
      }),
    }),

    markMessagesRead: builder.mutation<
      IMarkReadResponse,
      { conversationId: string }
    >({
      query: ({ conversationId }) => ({
        url: `/chats/messages/${conversationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: [TagTypes.CONVERSATIONS],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useLazyGetContactsQuery,
  useGetConversationsQuery,
  useLazyGetConversationsQuery,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useUploadAttachmentMutation,
  useMarkMessagesReadMutation,
} = chatApi;
