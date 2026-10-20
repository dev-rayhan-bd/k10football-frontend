/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";
import { IParam } from "@/types/global.type";
import { 
    IPlayerProfileResponse, 
    IUpdatePlayerPayload, 
    ICreateSelfGameReportPayload, 
    IGameReportResponse,
    IPlayerGameReportsResponse 
} from "@/types/player.type";

export const playerApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPlayers: builder.query({
            query: (args) => {
                const params = new URLSearchParams();
                if (Array.isArray(args)) {
                    args.forEach((item: IParam) => {
                        if (item.value !== undefined && item.value !== null && item.value !== "") {
                            params.append(item.name, String(item.value));
                        }
                    });
                } else if (args && typeof args === "object") {
                    Object.entries(args).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== "") {
                            params.append(key, String(value));
                        }
                    });
                }
                return {
                    url: "/players",
                    method: "GET",
                    params: params,
                };
            },
            providesTags: [TagTypes.PLAYERS],
        }),

        getMyPlayerCv: builder.query<IPlayerProfileResponse, void>({
            query: () => ({
                url: "/players/me/cv",
                method: "GET",
            }),
            providesTags: [TagTypes.PLAYERS],
        }),

        getMyPlayerProfile: builder.query<IPlayerProfileResponse, void>({
            query: () => ({
                url: "/players/me",
                method: "GET",
            }),
            providesTags: [TagTypes.PLAYERS],
        }),

        updateMyPlayerProfile: builder.mutation<IPlayerProfileResponse, Partial<IUpdatePlayerPayload>>({
            query: (data) => ({
                url: "/players/me",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [TagTypes.PLAYERS, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Player updated successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Something Went Wrong";
                    if (status === 500) {
                        ErrorToast("Something went wrong.");
                        return;
                    }
                    if (status !== 401) {
                        ErrorToast(message);
                    }
                }
            },
        }),

        getMyPlayerAttributes: builder.query<any, void>({
            query: () => ({
                url: "/players/me/attributes",
                method: "GET",
            }),
            providesTags: [TagTypes.PLAYERS],
        }),

        updateMyPlayerAttributes: builder.mutation({
            query: (data) => ({
                url: "/players/me/attributes",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [TagTypes.PLAYERS];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Player attributes updated successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Something Went Wrong";
                    if (status === 500) {
                        ErrorToast("Something Went Wrong");
                        return;
                    }
                    if (status !== 401) {
                        ErrorToast(message);
                    }
                }
            },
        }),

        getPlayerById: builder.query({
            query: (id: string | number) => ({
                url: `/players/${id}`,
                method: "GET",
            }),
            providesTags: [TagTypes.PLAYERS],
        }),

        getMyPlayerMedia: builder.query({
            query: (args) => {
                const params = new URLSearchParams();
                if (Array.isArray(args)) {
                    args.forEach((item: IParam) => {
                        if (item.value !== undefined && item.value !== null && item.value !== "") {
                            params.append(item.name, String(item.value));
                        }
                    });
                } else if (args && typeof args === "object") {
                    Object.entries(args).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== "") {
                            params.append(key, String(value));
                        }
                    });
                }
                return {
                    url: "/players/me/media",
                    method: "GET",
                    params: params,
                };
            },
            providesTags: [TagTypes.PLAYERS],
        }),

        uploadPlayerMedia: builder.mutation({
            query: (data) => {
                return {
                    url: `/players/me/media`,
                    method: "POST",
                    body: data,
                };
            },
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [TagTypes.PLAYERS];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Media uploaded successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Something Went Wrong";
                    if (status === 500) {
                        ErrorToast("Something Went Wrong");
                        return;
                    }
                    if (status !== 401) {
                        ErrorToast(message);
                    }
                }
            },
        }),

        createSelfGameReport: builder.mutation<IGameReportResponse, ICreateSelfGameReportPayload>({
            query: (data) => ({
                url: "/players/me/game-reports/self",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [TagTypes.PLAYERS, TagTypes.GAME_REPORTS];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    SuccessToast(data?.message || "Game report created successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Something went wrong creating game report";
                    if (status === 500) {
                        ErrorToast("Something went wrong on the server");
                        return;
                    }
                    if (status !== 401) {
                        ErrorToast(message);
                    }
                }
            },
        }),

        getMyGameReports: builder.query<IPlayerGameReportsResponse, void>({
            query: () => ({
                url: "/players/me/game-reports",
                method: "GET",
            }),
            providesTags: [TagTypes.GAME_REPORTS],
        }),
    }),
});

export const {
    useGetPlayersQuery,
    useGetMyPlayerCvQuery,
    useLazyGetMyPlayerCvQuery,
    useGetMyPlayerProfileQuery,
    useUpdateMyPlayerProfileMutation,
    useGetMyPlayerAttributesQuery,
    useUpdateMyPlayerAttributesMutation,
    useGetPlayerByIdQuery,
    useGetMyPlayerMediaQuery,
    useUploadPlayerMediaMutation,
    useCreateSelfGameReportMutation,
    useGetMyGameReportsQuery,
} = playerApi;

// Export aliases for convenience
export const useGetMyProfileQuery = useGetMyPlayerProfileQuery;
export const useGetMyPlayerQuery = useGetMyPlayerProfileQuery;
export const useGetMyCvQuery = useGetMyPlayerCvQuery;
export const useLazyGetMyCvQuery = useLazyGetMyPlayerCvQuery;


