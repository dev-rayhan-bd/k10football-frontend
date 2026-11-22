/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import {
  ISubscriptionPlansResponse,
  ISubscribeToPlanPayload,
  ISubscribeToPlanResponse,
  IUserSubscriptionResponse,
  IGetMySubscriptionParams,
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

    getMySubscription: builder.query<
      IUserSubscriptionResponse,
      IGetMySubscriptionParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.childPlayerId) {
          queryParams.append("childPlayerId", params.childPlayerId);
        }
        const qs = queryParams.toString();
        return {
          url: qs
            ? `/subscriptions/my-subscription?${qs}`
            : "/subscriptions/my-subscription",
          method: "GET",
        };
      },
      providesTags: [TagTypes.SUBSCRIPTION, TagTypes.PARENTS],
    }),

    subscribeToPlan: builder.mutation<ISubscribeToPlanResponse, ISubscribeToPlanPayload>({
      query: (body) => ({
        url: "/subscriptions/subscribe",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        TagTypes.MEMBERSHIP_PLANS,
        TagTypes.PROFILE,
        TagTypes.DASHBOARD,
        TagTypes.SUBSCRIPTION,
      ],
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

export const {
  useGetSubscriptionPlansQuery,
  useGetMySubscriptionQuery,
  useSubscribeToPlanMutation,
} = subscriptionApi;
