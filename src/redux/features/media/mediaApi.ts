/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";
import {
  IMediaGalleryResponse,
  IUploadMediaResponse,
  IUpdateMediaPayload,
} from "@/types/media.type";

export const mediaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyMedia: builder.query<
      IMediaGalleryResponse,
      { mediaType?: "IMAGE" | "VIDEO"; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.mediaType) queryParams.append("mediaType", params.mediaType);
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        const qs = queryParams.toString();
        return {
          url: qs ? `/media/me?${qs}` : "/media/me",
          method: "GET",
        };
      },
      providesTags: [TagTypes.MEDIA],
    }),

    uploadMedia: builder.mutation<IUploadMediaResponse, FormData>({
      query: (formData) => ({
        url: "/media/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (_result, error) => {
        if (!error) {
          return [TagTypes.MEDIA];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Media uploaded successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to upload media";
          if (status === 500) {
            ErrorToast("Something went wrong on the server");
            return;
          }
          if (status !== 401) {
            ErrorToast(message);
          }
        }
      },
    }),

    updateMedia: builder.mutation<any, IUpdateMediaPayload>({
      query: ({ mediaId, title }) => {
        const formData = new FormData();
        formData.append("data", JSON.stringify({ title }));
        return {
          url: `/media/${mediaId}`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: (_result, error) => {
        if (!error) {
          return [TagTypes.MEDIA];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Media updated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to update media";
          if (status === 500) {
            ErrorToast("Something went wrong on the server");
            return;
          }
          if (status !== 401) {
            ErrorToast(message);
          }
        }
      },
    }),

    deleteMedia: builder.mutation<any, string>({
      query: (mediaId) => ({
        url: `/media/${mediaId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, error) => {
        if (!error) {
          return [TagTypes.MEDIA];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Media deleted successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to delete media";
          if (status === 500) {
            ErrorToast("Something went wrong on the server");
            return;
          }
          if (status !== 401) {
            ErrorToast(message);
          }
        }
      },
    }),
  }),
});

export const {
  useGetMyMediaQuery,
  useLazyGetMyMediaQuery,
  useUploadMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
} = mediaApi;
