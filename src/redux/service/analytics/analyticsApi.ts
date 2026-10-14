import { apiSlice } from "@/redux/features/api/apiSlice";

const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: () => ({
        url: "/analytics",
        method: "GET",
      }),
      providesTags: ["Auth", "User", "Coupon", "Video"],
    }),
  }),
});

export const { useGetAnalyticsQuery } = analyticsApi;
