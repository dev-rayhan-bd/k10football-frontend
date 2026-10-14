import { apiSlice } from "@/redux/features/api/apiSlice";

const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: (params) => ({
        url: "/user",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),
    getUsersStats: builder.query({
      query: () => ({
        url: "/user/stats",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateUserById: builder.mutation({
      query: ({ id, payload }: { id: string; payload: FormData }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUsersStatsQuery,
  useUpdateUserByIdMutation,
} = userApi;
