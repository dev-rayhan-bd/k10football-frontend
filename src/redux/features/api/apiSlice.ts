/* eslint-disable @typescript-eslint/no-unused-vars */
import { BASE_URL } from "@/constants/global.constant";
import TagTypes from "@/constants/tagType.constant";
import { getToken, removeToken, removeUserInfo } from "@/helpers/SessionHelper";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: async (headers) => {
        const token = getToken();
        if (token) {
            headers.set("Authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
        }
        return headers;
    },
});

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: async (args, api, extraOptions) => {
        const result = await baseQuery(args, api, extraOptions);
        if (result?.error?.status === 401) {
            removeToken();
            removeUserInfo();
            window.location.href = "/";
        }
        return result;
    },
    tagTypes: Object.values(TagTypes), //TagS WhiteLists
    endpoints: (_builder) => ({}),
});