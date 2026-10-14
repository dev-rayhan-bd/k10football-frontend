/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "@/redux/features/api/apiSlice";

const supportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSupportRequests: builder.query({
      query: (params) => ({
        url: "/help-request",
        method: "GET",
        params,
      }),
      providesTags: ["Support"],
    }),
    updateSupportRequest: builder.mutation({
      query: ({ id, payload }: { id: string; payload: any }) => ({
        url: `/help-request/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Support"],
    }),
    deleteSupportRequest: builder.mutation({
      query: ({ id }: { id: string }) => ({
        url: `/help-request/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Support"],
    }),
  }),
});

export const {
  useGetSupportRequestsQuery,
  useUpdateSupportRequestMutation,
  useDeleteSupportRequestMutation,
} = supportApi;
