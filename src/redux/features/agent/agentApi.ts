/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";
import {
  IAgentSuccessStoriesResponse,
  IGetAgentSuccessStoriesParams,
  IAgentAnalyticsResponse,
  IGetAgentAnalyticsParams,
  IAgentCvsLibraryResponse,
  IGetAgentCvsLibraryParams,
  IAgentDiscoverPlayersResponse,
  IGetAgentDiscoverPlayersParams,
  IAgentProfileResponse,
  IAgentLicenseVerificationResponse,
} from "@/types/agent.type";

export const agentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAgentSuccessStories: builder.query<
      IAgentSuccessStoriesResponse,
      IGetAgentSuccessStoriesParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) {
          queryParams.append("page", params.page.toString());
        }
        if (params?.limit) {
          queryParams.append("limit", params.limit.toString());
        }
        if (params?.search) {
          queryParams.append("search", params.search);
        }
        if (params?.status) {
          queryParams.append("status", params.status);
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/agents/success-stories?${qs}` : "/agents/success-stories",
          method: "GET",
        };
      },
      providesTags: [
        TagTypes.AGENT_SUCCESS_STORIES,
        TagTypes.AGENTS,
        TagTypes.SUCCESS_STORIES,
      ],
    }),

    addAgentSuccessStory: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/agents/success-stories",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [
            TagTypes.AGENT_SUCCESS_STORIES,
            TagTypes.AGENTS,
            TagTypes.SUCCESS_STORIES,
          ];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Success story submitted successfully");
        } catch (err: any) {
          const message =
            err?.error?.data?.message || "Failed to submit success story";
          ErrorToast(message);
        }
      },
    }),

    updateAgentSuccessStory: builder.mutation<
      any,
      { storyId: string; formData: FormData }
    >({
      query: ({ storyId, formData }) => ({
        url: `/agents/success-stories/${storyId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [
            TagTypes.AGENT_SUCCESS_STORIES,
            TagTypes.AGENTS,
            TagTypes.SUCCESS_STORIES,
          ];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Success story updated successfully");
        } catch (err: any) {
          const message =
            err?.error?.data?.message || "Failed to update success story";
          ErrorToast(message);
        }
      },
    }),

    deleteAgentSuccessStory: builder.mutation<any, string>({
      query: (storyId) => ({
        url: `/agents/success-stories/${storyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [
            TagTypes.AGENT_SUCCESS_STORIES,
            TagTypes.AGENTS,
            TagTypes.SUCCESS_STORIES,
          ];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Success story deleted successfully");
        } catch (err: any) {
          const message =
            err?.error?.data?.message || "Failed to delete success story";
          ErrorToast(message);
        }
      },
    }),

    getAgentAnalytics: builder.query<
      IAgentAnalyticsResponse,
      IGetAgentAnalyticsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.year) {
          queryParams.append("year", params.year.toString());
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/agents/analytics?${qs}` : "/agents/analytics",
          method: "GET",
        };
      },
      providesTags: [TagTypes.ANALYTICS, TagTypes.AGENTS],
    }),

    getAgentCvsLibrary: builder.query<
      IAgentCvsLibraryResponse,
      IGetAgentCvsLibraryParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.liked !== undefined) {
          queryParams.append("liked", params.liked.toString());
        }
        if (params?.shared !== undefined) {
          queryParams.append("shared", params.shared.toString());
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
        if (params?.country && params.country !== "ALL") {
          queryParams.append("country", params.country);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/agents/cvs-library?${qs}` : "/agents/cvs-library",
          method: "GET",
        };
      },
      providesTags: [TagTypes.CVS_LIBRARY, TagTypes.AGENTS],
    }),

    getAgentDiscoverPlayers: builder.query<
      IAgentDiscoverPlayersResponse,
      IGetAgentDiscoverPlayersParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) {
          queryParams.append("page", params.page.toString());
        }
        if (params?.limit) {
          queryParams.append("limit", params.limit.toString());
        }
        if (params?.position && params.position !== "ALL") {
          queryParams.append("position", params.position);
        }
        if (params?.country && params.country !== "ALL") {
          queryParams.append("country", params.country);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.ageRange && params.ageRange !== "ALL") {
          queryParams.append("ageRange", params.ageRange);
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/agents/discover-players?${qs}` : "/agents/discover-players",
          method: "GET",
        };
      },
      providesTags: [TagTypes.SCOUTING_BOARD, TagTypes.AGENTS, TagTypes.PLAYERS],
    }),

    toggleLikeAgentCvsPlayer: builder.mutation<any, string>({
      query: (playerId: string) => ({
        url: `/agents/discover-players/${playerId}/like`,
        method: "POST",
      }),
      invalidatesTags: [
        TagTypes.CVS_LIBRARY,
        TagTypes.AGENTS,
        TagTypes.ANALYTICS,
        TagTypes.SCOUTING_BOARD,
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Updated like status");
        } catch (err: any) {
          const message =
            err?.error?.data?.message || "Failed to update like status";
          ErrorToast(message);
        }
      },
    }),

    shareAgentCvsPlayer: builder.mutation<any, string>({
      query: (playerId: string) => ({
        url: `/agents/cvs-library/${playerId}/share`,
        method: "POST",
      }),
      invalidatesTags: [
        TagTypes.CVS_LIBRARY,
        TagTypes.AGENTS,
        TagTypes.ANALYTICS,
        TagTypes.SCOUTING_BOARD,
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Profile shared successfully");
        } catch {
          // Toast handled elsewhere or keep silent
        }
      },
    }),

    getAgentProfile: builder.query<IAgentProfileResponse, void>({
      query: () => ({
        url: "/agents/agent-profile",
        method: "GET",
      }),
      providesTags: [TagTypes.PROFILE, TagTypes.AGENTS],
    }),

    updateAgentProfile: builder.mutation<any, FormData | Record<string, any>>({
      query: (body) => ({
        url: "/agents/agent-profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [TagTypes.PROFILE, TagTypes.AGENTS],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Agent profile updated successfully");
        } catch (err: any) {
          const message =
            err?.error?.data?.message || "Failed to update agent profile";
          ErrorToast(message);
        }
      },
    }),
    getAgentLicenseVerification: builder.query<
      IAgentLicenseVerificationResponse,
      void
    >({
      query: () => ({
        url: "/agents/license-verification",
        method: "GET",
      }),
      providesTags: [TagTypes.PROFILE, TagTypes.AGENTS],
    }),
  }),
});

export const {
  useGetAgentSuccessStoriesQuery,
  useAddAgentSuccessStoryMutation,
  useUpdateAgentSuccessStoryMutation,
  useDeleteAgentSuccessStoryMutation,
  useGetAgentAnalyticsQuery,
  useGetAgentCvsLibraryQuery,
  useGetAgentDiscoverPlayersQuery,
  useGetAgentProfileQuery,
  useUpdateAgentProfileMutation,
  useGetAgentLicenseVerificationQuery,
  useToggleLikeAgentCvsPlayerMutation,
  useShareAgentCvsPlayerMutation,
} = agentApi;

export const useToggleLikeAgentPlayerMutation =
  useToggleLikeAgentCvsPlayerMutation;

