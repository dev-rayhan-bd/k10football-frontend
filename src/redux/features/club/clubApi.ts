/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";
import {
  IScoutingBoardResponse,
  IGetScoutingBoardParams,
  IToggleScoutingBoardFavouritePayload,
  IToggleScoutingBoardFavouriteResponse,
  ICvsLibraryResponse,
  IGetCvsLibraryParams,
  IToggleLikeCvsPlayerResponse,
  IShareCvsPlayerResponse,
  IClubSuccessStoriesResponse,
  IGetClubSuccessStoriesParams,
  IClubAnalyticsResponse,
  IGetClubAnalyticsParams,
  IClubProfileResponse,
  IClubDashboardAnalyticsResponse,
} from "@/types/club.type";

export const clubApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getScoutingBoard: builder.query<IScoutingBoardResponse, IGetScoutingBoardParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.position && params.position !== "ALL") {
          queryParams.append("position", params.position);
        }
        if (params?.country && params.country !== "ALL") {
          queryParams.append("country", params.country);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.role && params.role !== "ALL") {
          queryParams.append("role", params.role);
        }
        if (params?.speciality && params.speciality !== "ALL") {
          queryParams.append("speciality", params.speciality);
        }
        if (params?.coachStatus && params.coachStatus !== "ALL") {
          queryParams.append("coachStatus", params.coachStatus);
        }
        if (params?.playerPage) {
          queryParams.append("playerPage", params.playerPage.toString());
        }
        if (params?.playerLimit) {
          queryParams.append("playerLimit", params.playerLimit.toString());
        }
        if (params?.coachPage) {
          queryParams.append("coachPage", params.coachPage.toString());
        }
        if (params?.coachLimit) {
          queryParams.append("coachLimit", params.coachLimit.toString());
        }

        const qs = queryParams.toString();
        return {
          url: qs ? `/clubs/scouting-board?${qs}` : "/clubs/scouting-board",
          method: "GET",
        };
      },
      providesTags: [TagTypes.SCOUTING_BOARD],
    }),

    getCvsLibrary: builder.query<ICvsLibraryResponse, IGetCvsLibraryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.tab) {
          queryParams.append("tab", params.tab);
        }
        if (params?.page) {
          queryParams.append("page", params.page.toString());
        }
        if (params?.limit) {
          queryParams.append("limit", params.limit.toString());
        }
        if (params?.position && params.position !== "ALL") {
          queryParams.append("position", params.position);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }

        const qs = queryParams.toString();
        return {
          url: qs ? `/clubs/cvs-library?${qs}` : "/clubs/cvs-library",
          method: "GET",
        };
      },
      providesTags: [TagTypes.CVS_LIBRARY],
    }),

    toggleScoutingBoardFavourite: builder.mutation<
      IToggleScoutingBoardFavouriteResponse,
      IToggleScoutingBoardFavouritePayload
    >({
      query: (body) => ({
        url: "/clubs/scouting-board/favourite",
        method: "POST",
        body,
      }),
      invalidatesTags: [TagTypes.SCOUTING_BOARD, TagTypes.CVS_LIBRARY],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Favourite updated successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to update favourite";
          ErrorToast(message);
        }
      },
    }),

    toggleLikeCvsPlayer: builder.mutation<IToggleLikeCvsPlayerResponse, string>({
      query: (playerId: string) => ({
        url: `/clubs/cvs-library/${playerId}/like`,
        method: "POST",
      }),
      invalidatesTags: [TagTypes.CVS_LIBRARY, TagTypes.SCOUTING_BOARD],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Like updated successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to update like";
          ErrorToast(message);
        }
      },
    }),

    shareCvsPlayer: builder.mutation<IShareCvsPlayerResponse, string>({
      query: (playerId: string) => ({
        url: `/clubs/cvs-library/${playerId}/share`,
        method: "POST",
      }),
      invalidatesTags: [TagTypes.CVS_LIBRARY],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Profile shared successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to share profile";
          ErrorToast(message);
        }
      },
    }),

    getClubSuccessStories: builder.query<IClubSuccessStoriesResponse, IGetClubSuccessStoriesParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) {
          queryParams.append("page", params.page.toString());
        }
        if (params?.limit) {
          queryParams.append("limit", params.limit.toString());
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/clubs/success-stories?${qs}` : "/clubs/success-stories",
          method: "GET",
        };
      },
      providesTags: [TagTypes.SUCCESS_STORIES, TagTypes.CLUBS],
    }),

    addClubSuccessStory: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/clubs/success-stories",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.SUCCESS_STORIES, TagTypes.CLUBS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Success story created successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to create success story";
          ErrorToast(message);
        }
      },
    }),

    updateClubSuccessStory: builder.mutation<any, { storyId: string; formData: FormData }>({
      query: ({ storyId, formData }) => ({
        url: `/clubs/success-stories/${storyId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.SUCCESS_STORIES, TagTypes.CLUBS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Success story updated successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to update success story";
          ErrorToast(message);
        }
      },
    }),

    deleteClubSuccessStory: builder.mutation<any, string>({
      query: (storyId) => ({
        url: `/clubs/success-stories/${storyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.SUCCESS_STORIES, TagTypes.CLUBS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Success story deleted successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to delete success story";
          ErrorToast(message);
        }
      },
    }),

    getClubAnalytics: builder.query<IClubAnalyticsResponse, IGetClubAnalyticsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.year) {
          queryParams.append("year", params.year.toString());
        }
        if (params?.page) {
          queryParams.append("page", params.page.toString());
        }
        if (params?.limit) {
          queryParams.append("limit", params.limit.toString());
        }
        if (params?.position && params.position !== "ALL") {
          queryParams.append("position", params.position);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/clubs/analytics?${qs}` : "/clubs/analytics",
          method: "GET",
        };
      },
      providesTags: [TagTypes.ANALYTICS, TagTypes.CLUBS],
    }),

    getClubProfile: builder.query<IClubProfileResponse, void>({
      query: () => ({
        url: "/clubs/club-profile",
        method: "GET",
      }),
      providesTags: [TagTypes.PROFILE, TagTypes.CLUBS],
    }),

    updateClubProfile: builder.mutation<any, FormData | Record<string, any>>({
      query: (body) => ({
        url: "/clubs/club-profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.PROFILE, TagTypes.CLUBS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Club profile updated successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to update club profile";
          ErrorToast(message);
        }
      },
    }),

    getClubDashboardAnalytics: builder.query<IClubDashboardAnalyticsResponse, void>({
      query: () => ({
        url: "/clubs/dashboard-analytics",
        method: "GET",
      }),
      providesTags: [TagTypes.DASHBOARD, TagTypes.CLUBS],
    }),
  }),
});

export const {
  useGetScoutingBoardQuery,
  useToggleScoutingBoardFavouriteMutation,
  useGetCvsLibraryQuery,
  useToggleLikeCvsPlayerMutation,
  useShareCvsPlayerMutation,
  useGetClubSuccessStoriesQuery,
  useAddClubSuccessStoryMutation,
  useUpdateClubSuccessStoryMutation,
  useDeleteClubSuccessStoryMutation,
  useGetClubAnalyticsQuery,
  useGetClubProfileQuery,
  useUpdateClubProfileMutation,
  useGetClubDashboardAnalyticsQuery,
} = clubApi;
