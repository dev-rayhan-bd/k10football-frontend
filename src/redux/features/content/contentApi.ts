/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { ErrorToast, SuccessToast } from "@/helpers/ValidationHelper";
import { SetCreateUpdateContentError } from "./contentSlice";
import { IPolicyDocumentResponse } from "@/types/policy.type";

export const contentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContentByType: builder.query({
      query: (type: string) => ({
        url: `/content/content-by-type/${type}`,
        method: "GET",
      }),
      providesTags: (_result, _error, type) => [
        { type: TagTypes.CONTENT, id: type },
        TagTypes.CONTENT,
      ],
    }),

    getPolicyByType: builder.query<IPolicyDocumentResponse, string>({
      query: (type: string) => ({
        url: `/cms/policies/${type}`,
        method: "GET",
      }),
      providesTags: (_result, _error, type) => [
        { type: TagTypes.CONTENT, id: `policy-${type}` },
        TagTypes.CONTENT,
      ],
    }),

    createUpdateContent: builder.mutation({
      query: (data) => ({
        url: "/content/create-update",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, _error, { type }) => {
        if (result?.success) {
          return [
            { type: TagTypes.CONTENT, id: type },
            TagTypes.CONTENT,
          ];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Content updated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message =
            err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            dispatch(SetCreateUpdateContentError("Something Went Wrong"));
            ErrorToast("Something Went Wrong");
            return;
          }
          if (status !== 401) {
            dispatch(SetCreateUpdateContentError(message));
            ErrorToast(message);
          }
        }
      },
    }),
  }),
});

export const {
  useGetContentByTypeQuery,
  useGetPolicyByTypeQuery,
  useCreateUpdateContentMutation,
  // Alias for semantic clarity
  useCreateUpdateContentMutation: useCreateOrUpdateContentMutation,
} = contentApi;
