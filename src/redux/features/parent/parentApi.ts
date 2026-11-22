/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";
import {
  ILinkedChildrenResponse,
  IUpdateChildProfilePayload,
  IParentOverviewResponse,
  IGetParentOverviewParams,
  IGetParentFeesResponse,
  IGetParentFeesParams,
  IPayFeeResponse,
  IVerifyFeePaymentResponse,
  IVerifyFeePaymentParams,
  IParentTrainingSessionsResponse,
  IGetParentTrainingSessionsParams,
  ISubmitSessionRsvpPayload,
  ICreateChildPayload,
  ICreateChildResponse,
  ISwitchProfileToChildPayload,
  ISwitchProfileResponse,
  IGetParentReportsParams,
  IGetParentReportsResponse,
  ICreateParentReportPayload,
  IRequestParentReportReviewPayload,
} from "@/types/parent.type";

export const parentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getParentOverview: builder.query<
      IParentOverviewResponse,
      IGetParentOverviewParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        const targetChildPlayerId = params?.childPlayerId || params?.childId;
        if (targetChildPlayerId) {
          queryParams.append("childPlayerId", targetChildPlayerId);
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/parents/overview?${qs}` : "/parents/overview",
          method: "GET",
        };
      },
      providesTags: [TagTypes.PARENTS, TagTypes.DASHBOARD, TagTypes.SUBSCRIPTION],
    }),

    getMyChildren: builder.query<ILinkedChildrenResponse, void>({
      query: () => ({
        url: "/parents/my-children",
        method: "GET",
      }),
      providesTags: [TagTypes.PARENTS, TagTypes.PLAYERS],
    }),

    updateChildProfile: builder.mutation<
      any,
      { childPlayerId: string; data: IUpdateChildProfilePayload | FormData }
    >({
      query: ({ childPlayerId, data }) => ({
        url: `/parents/my-children/${childPlayerId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TagTypes.PARENTS, TagTypes.PLAYERS, TagTypes.DASHBOARD],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Child profile updated successfully");
        } catch (err: any) {
          const message =
            err?.error?.data?.message || "Failed to update child profile";
          ErrorToast(message);
        }
      },
    }),

    getParentFees: builder.query<IGetParentFeesResponse, IGetParentFeesParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.childPlayerId) {
          queryParams.append("childPlayerId", params.childPlayerId);
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/parents/fees?${qs}` : "/parents/fees",
          method: "GET",
        };
      },
      providesTags: [TagTypes.PARENTS, TagTypes.FEES],
    }),

    payFeeInvoice: builder.mutation<IPayFeeResponse, string>({
      query: (id) => ({
        url: `/parents/fees/${id}/pay`,
        method: "POST",
      }),
      invalidatesTags: [TagTypes.PARENTS, TagTypes.FEES],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Stripe checkout session created successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to create payment session";
          ErrorToast(message);
        }
      },
    }),

    verifyFeePayment: builder.query<IVerifyFeePaymentResponse, IVerifyFeePaymentParams>({
      query: ({ session_id, invoiceId, sessionId }) => {
        const queryParams = new URLSearchParams();
        const sid = session_id || sessionId;
        if (sid) {
          queryParams.append("session_id", sid);
        }
        if (invoiceId) {
          queryParams.append("invoiceId", invoiceId);
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/parents/fees/verify-payment?${qs}` : "/parents/fees/verify-payment",
          method: "GET",
        };
      },
      providesTags: [TagTypes.PARENTS, TagTypes.FEES, TagTypes.DASHBOARD],
    }),

    getParentTrainingSessions: builder.query<
      IParentTrainingSessionsResponse,
      IGetParentTrainingSessionsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.childPlayerId) {
          queryParams.append("childPlayerId", params.childPlayerId);
        }
        if (params?.childId) {
          queryParams.append("childId", params.childId);
        }
        if (params?.page) {
          queryParams.append("page", String(params.page));
        }
        if (params?.limit) {
          queryParams.append("limit", String(params.limit));
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/parents/training-sessions?${qs}` : "/parents/training-sessions",
          method: "GET",
        };
      },
      providesTags: [TagTypes.PARENTS, TagTypes.TRAINING_SESSIONS],
    }),

    submitSessionRsvp: builder.mutation<
      any,
      ISubmitSessionRsvpPayload
    >({
      query: ({ sessionId, ...body }) => ({
        url: `/parents/sessions/${sessionId}/rsvp`,
        method: "POST",
        body,
      }),
      invalidatesTags: [TagTypes.PARENTS, TagTypes.TRAINING_SESSIONS, TagTypes.DASHBOARD],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "RSVP updated successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to update RSVP";
          ErrorToast(message);
        }
      },
    }),

    createChildProfile: builder.mutation<
      ICreateChildResponse,
      ICreateChildPayload | FormData
    >({
      query: (payload) => {
        let body: FormData;
        if (payload instanceof FormData) {
          body = payload;
        } else {
          body = new FormData();
          if (payload.avatar) {
            body.append("avatar", payload.avatar);
          }
          body.append("data", JSON.stringify(payload.data));
        }
        return {
          url: "/parents/create-child",
          method: "POST",
          body,
        };
      },
      invalidatesTags: [TagTypes.PARENTS, TagTypes.PLAYERS, TagTypes.DASHBOARD],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Child profile created successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to create child profile";
          ErrorToast(message);
        }
      },
    }),

    getParentReports: builder.query<
      IGetParentReportsResponse,
      IGetParentReportsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.childPlayerId) {
          queryParams.append("childPlayerId", params.childPlayerId);
        }
        if (params?.page) {
          queryParams.append("page", String(params.page));
        }
        if (params?.limit) {
          queryParams.append("limit", String(params.limit));
        }
        const qs = queryParams.toString();
        return {
          url: qs ? `/parents/reports?${qs}` : "/parents/reports",
          method: "GET",
        };
      },
      providesTags: [TagTypes.PARENTS, TagTypes.GAME_REPORTS, TagTypes.REPORTS],
    }),

    createParentReport: builder.mutation<any, ICreateParentReportPayload>({
      query: (body) => ({
        url: "/parents/reports",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        TagTypes.PARENTS,
        TagTypes.GAME_REPORTS,
        TagTypes.REPORTS,
        TagTypes.DASHBOARD,
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Match report submitted successfully");
        } catch (err: any) {
          if (err?.error?.status === 402) {
            return;
          }
          const message =
            err?.error?.data?.message || "Failed to submit match report";
          ErrorToast(message);
        }
      },
    }),

    requestParentReportReview: builder.mutation<
      any,
      IRequestParentReportReviewPayload
    >({
      query: ({ reportId, childPlayerId }) => ({
        url: `/parents/reports/${reportId}/request-review`,
        method: "POST",
        body: childPlayerId ? { childPlayerId } : {},
      }),
      invalidatesTags: [
        TagTypes.PARENTS,
        TagTypes.GAME_REPORTS,
        TagTypes.REPORTS,
        TagTypes.DASHBOARD,
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Coach review requested successfully");
        } catch (err: any) {
          if (err?.error?.status === 402) {
            return;
          }
          const message =
            err?.error?.data?.message || "Failed to request coach review";
          ErrorToast(message);
        }
      },
    }),

    switchProfileToChild: builder.mutation<
      ISwitchProfileResponse,
      ISwitchProfileToChildPayload
    >({
      query: (body) => ({
        url: "/parents/switch-profile",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        TagTypes.PARENTS,
        TagTypes.PLAYERS,
        TagTypes.PROFILE,
        TagTypes.USERS,
        TagTypes.DASHBOARD,
        TagTypes.SUBSCRIPTION,
        TagTypes.GAME_REPORTS,
        TagTypes.REPORTS,
        TagTypes.FEES,
        TagTypes.TRAINING_SESSIONS,
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Profile switched to child successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to switch profile";
          ErrorToast(message);
        }
      },
    }),

    switchToParent: builder.mutation<ISwitchProfileResponse, void>({
      query: () => ({
        url: "/parents/switch-to-parent",
        method: "POST",
        body: {},
      }),
      invalidatesTags: [
        TagTypes.PARENTS,
        TagTypes.PLAYERS,
        TagTypes.PROFILE,
        TagTypes.USERS,
        TagTypes.DASHBOARD,
        TagTypes.SUBSCRIPTION,
        TagTypes.GAME_REPORTS,
        TagTypes.REPORTS,
        TagTypes.FEES,
        TagTypes.TRAINING_SESSIONS,
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Profile switched back to parent successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to switch back to parent";
          ErrorToast(message);
        }
      },
    }),
  }),
});

export const {
  useGetParentOverviewQuery,
  useGetMyChildrenQuery,
  useLazyGetMyChildrenQuery,
  useUpdateChildProfileMutation,
  useCreateChildProfileMutation,
  useGetParentFeesQuery,
  useLazyGetParentFeesQuery,
  usePayFeeInvoiceMutation,
  useVerifyFeePaymentQuery,
  useLazyVerifyFeePaymentQuery,
  useGetParentTrainingSessionsQuery,
  useLazyGetParentTrainingSessionsQuery,
  useSubmitSessionRsvpMutation,
  useGetParentReportsQuery,
  useLazyGetParentReportsQuery,
  useCreateParentReportMutation,
  useRequestParentReportReviewMutation,
  useSwitchProfileToChildMutation,
  useSwitchToParentMutation,
} = parentApi;
