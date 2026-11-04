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
} = adminApi;

