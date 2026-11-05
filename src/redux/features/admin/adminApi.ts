/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";
import {
  IMembershipPlansResponse,
  ISingleMembershipPlanResponse,
  ICreateMembershipPlanPayload,
  IUpdateMembershipPlanPayload,
  IMembershipGrantsResponse,
  IGrantMembershipPayload,
  IGrantMembershipResponse,
  IApprovalsResponse,
  IApprovalDetailsResponse,
  IUpdateApprovalStatusPayload,
  IGetApprovalsParams,
  ISuccessStoriesResponse,
  ISuccessStoryDetailsResponse,
  IUpdateSuccessStoryStatusPayload,
  IGetSuccessStoriesParams,
  IAdminAnalyticsResponse,
  IAdminPlayersResponse,
  IGetAdminPlayersParams,
  IAdminCoachesResponse,
  IGetAdminCoachesParams,
  IAdminAcademiesResponse,
  IGetAdminAcademiesParams,
  IAdminAgentsResponse,
  IGetAdminAgentsParams,
  IAdminClubsResponse,
  IGetAdminClubsParams,
  IAdminPaymentsResponse,
  IGetAdminPaymentsParams,
  IToggleUserStatusResponse,
} from "@/types/admin.type";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMembershipPlans: builder.query<IMembershipPlansResponse, void>({
      query: () => ({
        url: "/admin/membership-plans",
        method: "GET",
      }),
      providesTags: [TagTypes.MEMBERSHIP_PLANS],
    }),

    createMembershipPlan: builder.mutation<
      ISingleMembershipPlanResponse,
      ICreateMembershipPlanPayload
    >({
      query: (data) => ({
        url: "/admin/membership-plans",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TagTypes.MEMBERSHIP_PLANS],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Membership plan created successfully");
        } catch (err: any) {
          ErrorToast(err?.error?.data?.message || "Failed to create membership plan");
        }
      },
    }),

    updateMembershipPlan: builder.mutation<
      ISingleMembershipPlanResponse,
      { id: string; data: IUpdateMembershipPlanPayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/membership-plans/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TagTypes.MEMBERSHIP_PLANS],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Membership plan updated successfully");
        } catch (err: any) {
          ErrorToast(err?.error?.data?.message || "Failed to update membership plan");
        }
      },
    }),

    togglePlanStatus: builder.mutation<
      ISingleMembershipPlanResponse,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/admin/membership-plans/${id}`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: [TagTypes.MEMBERSHIP_PLANS],
      async onQueryStarted({ isActive }, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(
            data?.message ||
              `Membership plan ${isActive ? "activated" : "deactivated"} successfully`
          );
        } catch (err: any) {
          ErrorToast(
            err?.error?.data?.message ||
              `Failed to ${isActive ? "activate" : "deactivate"} plan`
          );
        }
      },
    }),

    deleteMembershipPlan: builder.mutation<
      { statusCode: number; success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/admin/membership-plans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TagTypes.MEMBERSHIP_PLANS],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Membership plan deleted successfully");
        } catch (err: any) {
          ErrorToast(err?.error?.data?.message || "Failed to delete membership plan");
        }
      },
    }),

    getMembershipGrants: builder.query<IMembershipGrantsResponse, void>({
      query: () => ({
        url: "/admin/membership-grants",
        method: "GET",
      }),
      providesTags: [TagTypes.MEMBERSHIP_GRANTS],
    }),

    grantMembership: builder.mutation<
      IGrantMembershipResponse,
      IGrantMembershipPayload
    >({
      query: (data) => ({
        url: "/admin/membership-grants",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TagTypes.MEMBERSHIP_GRANTS],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Membership granted successfully");
        } catch (err: any) {
          ErrorToast(err?.error?.data?.message || "Failed to grant membership");
        }
      },
    }),

    revokeMembershipGrant: builder.mutation<
      { statusCode: number; success: boolean; message: string },
      string
    >({
      query: (grantId) => ({
        url: `/admin/membership-grants/${grantId}`,
        method: "DELETE",
      }),
      invalidatesTags: [TagTypes.MEMBERSHIP_GRANTS],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Membership grant revoked successfully");
        } catch (err: any) {
          ErrorToast(
            err?.error?.data?.message || "Failed to revoke membership grant"
          );
        }
      },
    }),

    getApprovals: builder.query<IApprovalsResponse, IGetApprovalsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.role && params.role !== "ALL") {
          queryParams.append("role", params.role);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.search) {
          queryParams.append("search", params.search);
        }
        if (params?.page) {
          queryParams.append("page", String(params.page));
        }
        if (params?.limit) {
          queryParams.append("limit", String(params.limit));
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/admin/approvals?${qs}` : "/admin/approvals",
          method: "GET",
        };
      },
      providesTags: [TagTypes.APPROVALS],
    }),

    getApprovalDetails: builder.query<IApprovalDetailsResponse, string>({
      query: (approvalId) => ({
        url: `/admin/approvals/${approvalId}`,
        method: "GET",
      }),
      providesTags: [TagTypes.APPROVALS],
    }),

    updateApprovalStatus: builder.mutation<
      IApprovalDetailsResponse,
      { id: string; data: IUpdateApprovalStatusPayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/approvals/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TagTypes.APPROVALS],
      async onQueryStarted({ data: payload }, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(
            data?.message ||
              `Application ${payload.status === "APPROVED" ? "approved" : "rejected"} successfully`
          );
        } catch (err: any) {
          ErrorToast(
            err?.error?.data?.message ||
              `Failed to ${payload.status === "APPROVED" ? "approve" : "reject"} application`
          );
        }
      },
    }),

    getAdminSuccessStories: builder.query<
      ISuccessStoriesResponse,
      IGetSuccessStoriesParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.role && params.role !== "ALL") {
          queryParams.append("role", params.role);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.search) {
          queryParams.append("search", params.search);
        }
        if (params?.page) {
          queryParams.append("page", String(params.page));
        }
        if (params?.limit) {
          queryParams.append("limit", String(params.limit));
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/admin/success-stories?${qs}` : "/admin/success-stories",
          method: "GET",
        };
      },
      providesTags: [TagTypes.ADMIN_SUCCESS_STORIES, TagTypes.SUCCESS_STORIES],
    }),

    getAdminSuccessStoryDetails: builder.query<
      ISuccessStoryDetailsResponse,
      string
    >({
      query: (storyId) => ({
        url: `/admin/success-stories/${storyId}`,
        method: "GET",
      }),
      providesTags: [TagTypes.ADMIN_SUCCESS_STORIES, TagTypes.SUCCESS_STORIES],
    }),

    updateSuccessStoryStatus: builder.mutation<
      ISuccessStoryDetailsResponse,
      { id: string; data: IUpdateSuccessStoryStatusPayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/success-stories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TagTypes.ADMIN_SUCCESS_STORIES, TagTypes.SUCCESS_STORIES],
      async onQueryStarted({ data: payload }, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(
            data?.message ||
              `Story ${payload.status === "APPROVED" ? "approved" : "rejected"} successfully`
          );
        } catch (err: any) {
          ErrorToast(
            err?.error?.data?.message ||
              `Failed to ${payload.status === "APPROVED" ? "approve" : "reject"} story`
          );
        }
      },
    }),

    getAdminAnalytics: builder.query<IAdminAnalyticsResponse, void>({
      query: () => ({
        url: "/admin/analytics",
        method: "GET",
      }),
      providesTags: [TagTypes.ANALYTICS, TagTypes.DASHBOARD],
    }),

    getAdminPlayers: builder.query<
      IAdminPlayersResponse,
      IGetAdminPlayersParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) {
          queryParams.append("search", params.search);
        }
        if (params?.position && params.position !== "ALL") {
          queryParams.append("position", params.position);
        }
        if (params?.country && params.country !== "ALL") {
          queryParams.append("country", params.country);
        }
        if (params?.ageRange && params.ageRange !== "ALL") {
          queryParams.append("ageRange", params.ageRange);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.cvTier && params.cvTier !== "ALL") {
          queryParams.append("cvTier", params.cvTier);
        }
        if (params?.page) {
          queryParams.append("page", String(params.page));
        }
        if (params?.limit) {
          queryParams.append("limit", String(params.limit));
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/admin/players?${qs}` : "/admin/players",
          method: "GET",
        };
      },
      providesTags: [TagTypes.PLAYERS, TagTypes.ADMINS],
    }),

    getAdminCoaches: builder.query<
      IAdminCoachesResponse,
      IGetAdminCoachesParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) {
          queryParams.append("search", params.search);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.academy && params.academy !== "ALL") {
          queryParams.append("academy", params.academy);
        }
        if (params?.cvTier && params.cvTier !== "ALL") {
          queryParams.append("cvTier", params.cvTier);
        }
        if (params?.page) {
          queryParams.append("page", String(params.page));
        }
        if (params?.limit) {
          queryParams.append("limit", String(params.limit));
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/admin/coaches?${qs}` : "/admin/coaches",
          method: "GET",
        };
      },
      providesTags: [TagTypes.COACHES, TagTypes.ADMINS],
    }),

    getAdminAcademies: builder.query<
      IAdminAcademiesResponse,
      IGetAdminAcademiesParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) {
          queryParams.append("search", params.search);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.country && params.country !== "ALL") {
          queryParams.append("country", params.country);
        }
        if (params?.category && params.category !== "ALL") {
          queryParams.append("category", params.category);
        }
        if (params?.page) {
          queryParams.append("page", String(params.page));
        }
        if (params?.limit) {
          queryParams.append("limit", String(params.limit));
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/admin/academies?${qs}` : "/admin/academies",
          method: "GET",
        };
      },
      providesTags: [TagTypes.ACADEMY, TagTypes.ADMINS],
    }),

    getAdminAgents: builder.query<
      IAdminAgentsResponse,
      IGetAdminAgentsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) {
          queryParams.append("search", params.search);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.verificationStatus && params.verificationStatus !== "ALL") {
          queryParams.append("verificationStatus", params.verificationStatus);
        }
        if (params?.country && params.country !== "ALL") {
          queryParams.append("country", params.country);
        }
        if (params?.page) {
          queryParams.append("page", String(params.page));
        }
        if (params?.limit) {
          queryParams.append("limit", String(params.limit));
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/admin/agents?${qs}` : "/admin/agents",
          method: "GET",
        };
      },
      providesTags: [TagTypes.AGENTS, TagTypes.ADMINS],
    }),

    getAdminClubs: builder.query<
      IAdminClubsResponse,
      IGetAdminClubsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) {
          queryParams.append("search", params.search);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.country && params.country !== "ALL") {
          queryParams.append("country", params.country);
        }
        if (params?.league && params.league !== "ALL") {
          queryParams.append("league", params.league);
        }
        if (params?.page) {
          queryParams.append("page", String(params.page));
        }
        if (params?.limit) {
          queryParams.append("limit", String(params.limit));
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/admin/clubs?${qs}` : "/admin/clubs",
          method: "GET",
        };
      },
      providesTags: [TagTypes.CLUBS, TagTypes.ADMINS],
    }),

    getAdminPayments: builder.query<
      IAdminPaymentsResponse,
      IGetAdminPaymentsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) {
          queryParams.append("search", params.search);
        }
        if (params?.type && params.type !== "ALL") {
          queryParams.append("type", params.type);
        }
        if (params?.category && params.category !== "ALL") {
          queryParams.append("category", params.category);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.startDate) {
          queryParams.append("startDate", params.startDate);
        }
        if (params?.endDate) {
          queryParams.append("endDate", params.endDate);
        }
        if (params?.page) {
          queryParams.append("page", String(params.page));
        }
        if (params?.limit) {
          queryParams.append("limit", String(params.limit));
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/admin/payments?${qs}` : "/admin/payments",
          method: "GET",
        };
      },
      providesTags: [TagTypes.PAYMENTS, TagTypes.ADMINS],
    }),

    toggleUserStatus: builder.mutation<
      IToggleUserStatusResponse,
      string
    >({
      query: (userId) => ({
        url: `/admin/users/${userId}/status`,
        method: "PATCH",
      }),
      invalidatesTags: [
        TagTypes.USERS,
        TagTypes.PLAYERS,
        TagTypes.COACHES,
        TagTypes.ACADEMY,
        TagTypes.AGENTS,
        TagTypes.CLUBS,
        TagTypes.ADMINS,
      ],
      async onQueryStarted(_userId, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "User status updated successfully");
        } catch (err: any) {
          ErrorToast(err?.error?.data?.message || "Failed to update user status");
        }
      },
    }),
  }),
});

export const {
  useGetMembershipPlansQuery,
  useCreateMembershipPlanMutation,
  useUpdateMembershipPlanMutation,
  useTogglePlanStatusMutation,
  useDeleteMembershipPlanMutation,
  useGetMembershipGrantsQuery,
  useGrantMembershipMutation,
  useRevokeMembershipGrantMutation,
  useGetApprovalsQuery,
  useGetApprovalDetailsQuery,
  useUpdateApprovalStatusMutation,
  useGetAdminSuccessStoriesQuery,
  useGetAdminSuccessStoryDetailsQuery,
  useUpdateSuccessStoryStatusMutation,
  useGetAdminAnalyticsQuery,
  useGetAdminPlayersQuery,
  useGetAdminCoachesQuery,
  useGetAdminAcademiesQuery,
  useGetAdminAgentsQuery,
  useGetAdminClubsQuery,
  useGetAdminPaymentsQuery,
  useToggleUserStatusMutation,
} = adminApi;

