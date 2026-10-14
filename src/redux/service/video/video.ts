import { apiSlice } from "@/redux/features/api/apiSlice";

const videoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createVideo: builder.mutation({
      query: ({ payload }: { payload: FormData }) => ({
        url: `/video`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Video"],
    }),
    getVideo: builder.query({
      query: () => ({
        url: "/video",
        method: "GET",
      }),
      providesTags: ["Video"],
    }),
    getVideoStream: builder.query({
      query: (id) => ({
        url: `/video/${id}/stream`,
        method: "GET",
      }),
      providesTags: ["Video"],
    }),
    getVideoCompletionLogs: builder.query({
      query: (params) => ({
        url: "/coupon-usage",
        method: "GET",
        params,
      }),
      providesTags: ["Video"],
    }),
    updateVideo: builder.mutation({
      query: ({ id, payload }: { id: string; payload: FormData }) => ({
        url: `/video/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Video"],
    }),
  }),
});

export const {
  useCreateVideoMutation,
  useGetVideoQuery,
  useGetVideoStreamQuery,
  useUpdateVideoMutation,
  useGetVideoCompletionLogsQuery,
} = videoApi;
