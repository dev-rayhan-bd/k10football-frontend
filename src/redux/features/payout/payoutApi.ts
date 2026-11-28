import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import {
  IAdminPayoutsResponse,
  IGetAdminPayoutsParams,
  IRecordPayoutPayload,
  IRecordPayoutResponse,
  IRecordAllPayoutsPayload,
  IRecordAllPayoutsResponse,
} from "@/types/payout.type";

export const payoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminPayouts: builder.query<IAdminPayoutsResponse, IGetAdminPayoutsParams | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.recipientType) search.append("recipientType", params.recipientType);
        if (params?.status) search.append("status", params.status);
        if (params?.recipientId) search.append("recipientId", params.recipientId);
        const qs = search.toString();
        return {
          url: `/admin/payouts${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.PAYMENTS],
    }),

    recordPayout: builder.mutation<IRecordPayoutResponse, IRecordPayoutPayload>({
      query: (body) => ({
        url: "/admin/payouts/record",
        method: "POST",
        body,
      }),
      invalidatesTags: [TagTypes.PAYMENTS],
    }),

    recordAllPayouts: builder.mutation<IRecordAllPayoutsResponse, IRecordAllPayoutsPayload | void>({
      query: (body) => ({
        url: "/admin/payouts/record-all",
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: [TagTypes.PAYMENTS],
    }),
  }),
});

export const {
  useGetAdminPayoutsQuery,
  useRecordPayoutMutation,
  useRecordAllPayoutsMutation,
} = payoutApi;
