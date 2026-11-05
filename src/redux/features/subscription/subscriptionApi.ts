/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import {
  ISubscriptionPlansResponse,
  ISubscribeToPlanPayload,
  ISubscribeToPlanResponse,
} from "@/types/subscription.type";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";

export const subscriptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<ISubscriptionPlansResponse, void>({
      query: () => ({
        url: "/subscriptions/plans",
        method: "GET",
      }),
      providesTags: [TagTypes.MEMBERSHIP_PLANS],
    }),

    subscribeToPlan: builder.mutation<ISubscribeToPlanResponse, ISubscribeToPlanPayload>({
      query: (body) => ({
        url: "/subscriptions/subscribe",
        method: "POST",
        body,
      }),
      invalidatesTags: [TagTypes.MEMBERSHIP_PLANS, TagTypes.PROFILE, TagTypes.DASHBOARD],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Subscribed to plan successfully!");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to subscribe to plan";
          ErrorToast(message);
        }
      },
    }),
  }),
});

export const { useGetSubscriptionPlansQuery, useSubscribeToPlanMutation } = subscriptionApi;
