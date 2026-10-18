import { IParam } from "@/types/global.type";
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";

export const supportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSupports: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args !== undefined && args.length > 0) {
          args.forEach((item: IParam) => {
            if (item.value) {
              params.append(item.name, item.value);
            }
          });
        }
        return {
          url: "/support/all-supports",
          method: "GET",
          params: params,
        };
      },
      keepUnusedDataFor: 600,
      providesTags: [TagTypes.SUPPORTS],
    }),
  }),
});

export const { useGetSupportsQuery } = supportApi;
