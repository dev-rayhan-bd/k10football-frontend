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

/**
 * Requests whose 401 means "not allowed to do this" rather than "session expired".
 * Profile switching returns 401 when e.g. no parent account is linked; that must
 * show an error, not log the user out.
 */
const NO_LOGOUT_ON_401 = ["/parents/switch-to-parent", "/parents/switch-profile"];

const requestUrl = (args: string | { url: string }) => (typeof args === "string" ? args : args.url);

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: async (args, api, extraOptions) => {
        const result = await baseQuery(args, api, extraOptions);
        const url = requestUrl(args);
        const isExempt = NO_LOGOUT_ON_401.some((path) => url.startsWith(path));
        if (result?.error?.status === 401 && !isExempt) {
            removeToken();
            removeUserInfo();
            window.location.href = "/";
        }
        return result;
    },
    tagTypes: Object.values(TagTypes), //TagS WhiteLists
    endpoints: (_builder) => ({}),
});