import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => ({
        url: "/dashboard/stats",
        method: "GET",
      }),
      providesTags: [TagTypes.DASHBOARD, TagTypes.SHOPS, TagTypes.USERS],
    }),
  }),
});

export const { useGetStatsQuery } = dashboardApi;
