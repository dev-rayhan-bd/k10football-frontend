/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";
import { IParam } from "@/types/global.type";
import { 
    IPlayerProfileResponse, 
    IUpdatePlayerPayload, 
    ICreateSelfGameReportPayload, 
    IRequestCoachGameReportPayload,
    IRequestCoachGameReportResponse,
    IGameReportResponse,
    IPlayerGameReportsResponse,
    IPlayerAnalyticsResponse 
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

        updateMyPlayerProfile: builder.mutation<IPlayerProfileResponse, FormData | Partial<IUpdatePlayerPayload> | any>({
            query: (payload) => {
                let body = payload;
                if (typeof window !== "undefined" && !(payload instanceof FormData)) {
                    if (
                        payload?.clubLogo_0 instanceof File ||
                        payload?.profileImage instanceof File ||
                        payload?.highlightVideo instanceof File ||
                        payload?.coverImage instanceof File ||
                        payload?.data
                    ) {
                        const formData = new FormData();
                        if (payload.profileImage instanceof File) formData.append("profileImage", payload.profileImage);
                        if (payload.highlightVideo instanceof File) formData.append("highlightVideo", payload.highlightVideo);
                        if (payload.coverImage instanceof File) formData.append("coverImage", payload.coverImage);
                        if (payload.clubLogo_0 instanceof File) formData.append("clubLogo_0", payload.clubLogo_0);
                        if (payload.clubLogo_1 instanceof File) formData.append("clubLogo_1", payload.clubLogo_1);

                        if (typeof payload.data === "string") {
                            formData.append("data", payload.data);
                        } else if (typeof payload.data === "object" && payload.data !== null) {
                            formData.append("data", JSON.stringify(payload.data));
                        } else {
                            const cleanPayload = { ...payload };
                            delete cleanPayload.profileImage;
                            delete cleanPayload.highlightVideo;
                            delete cleanPayload.coverImage;
                            delete cleanPayload.clubLogo_0;
                            delete cleanPayload.clubLogo_1;
                            formData.append("data", JSON.stringify(cleanPayload));
                        }
                        body = formData;
                    }
                }
                return {
                    url: "/players/me",
                    method: "PATCH",
                    body,
                };
            },
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [TagTypes.PLAYERS, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    const isClubUpdate = Boolean(
                        (arg && typeof arg === "object" && ("clubHistory" in arg || "clubs" in arg || (arg as any).suppressToast)) ||
                        (typeof FormData !== "undefined" && arg instanceof FormData && arg.has("data") && arg.get("data")?.toString().includes('"clubHistory"'))
                    );

                    if (!isClubUpdate) {
                        SuccessToast("Player updated successfully");
                    }
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

        addPlayerClub: builder.mutation<any, FormData | { image?: File | null; data: any }>({
            query: (payload) => {
                let body = payload;
                if (typeof window !== "undefined" && !(payload instanceof FormData)) {
                    const formData = new FormData();
                    if (payload.image instanceof File) {
                        formData.append("image", payload.image);
                    }
                    if (typeof payload.data === "string") {
                        formData.append("data", payload.data);
                    } else if (typeof payload.data === "object" && payload.data !== null) {
                        formData.append("data", JSON.stringify(payload.data));
                    }
                    body = formData;
                }
                return {
                    url: "/players/me/clubs",
                    method: "POST",
                    body,
                };
            },
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.PLAYERS, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Club added successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message =
                        err?.error?.data?.message ||
                        err?.error?.data?.errorSources?.[0]?.message ||
                        err?.error?.message ||
                        "Failed to add club";
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

        deletePlayerClub: builder.mutation<any, string>({
            query: (clubId) => ({
                url: `/players/me/clubs/${clubId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.PLAYERS, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Club deleted successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message =
                        err?.error?.data?.message ||
                        err?.error?.data?.errorSources?.[0]?.message ||
                        err?.error?.message ||
                        "Failed to delete club";
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

        updatePlayerClub: builder.mutation<any, { clubId: string; data: FormData | { data: any; image?: File | null } }>({
            query: ({ clubId, data }) => {
                let body: any = data;
                if (typeof window !== "undefined" && !(data instanceof FormData)) {
                    const formData = new FormData();
                    if ((data as any)?.image instanceof File) {
                        formData.append("image", (data as any).image);
                    }
                    if (typeof (data as any)?.data === "string") {
                        formData.append("data", (data as any).data);
                    } else if (typeof (data as any)?.data === "object" && (data as any).data !== null) {
                        formData.append("data", JSON.stringify((data as any).data));
                    }
                    body = formData;
                }
                return {
                    url: `/players/me/clubs/${clubId}`,
                    method: "PATCH",
                    body,
                };
            },
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.PLAYERS, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Club updated successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message =
                        err?.error?.data?.message ||
                        err?.error?.data?.errorSources?.[0]?.message ||
                        err?.error?.message ||
                        "Failed to update club";
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

        getPlayerCvById: builder.query<any, string>({
            query: (playerId: string) => ({
                url: `/players/${playerId}/cv`,
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

        requestCoachGameReport: builder.mutation<IRequestCoachGameReportResponse, IRequestCoachGameReportPayload>({
            query: (data) => ({
                url: "/players/me/game-reports/request-coach",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [TagTypes.PLAYERS, TagTypes.GAME_REPORTS, TagTypes.REPORTS];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    SuccessToast(data?.message || "Game report requested from coach successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Failed to request game report from coach";
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

        uploadPlayerDocument: builder.mutation<any, FormData | { file: File; title: string }>({
            query: (arg) => {
                let body: FormData;
                if (arg instanceof FormData) {
                    body = arg;
                } else {
                    body = new FormData();
                    if (arg.file) body.append("file", arg.file);
                    if (arg.title) body.append("title", arg.title);
                }
                return {
                    url: "/players/me/documents",
                    method: "POST",
                    body,
                };
            },
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.PLAYERS, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Certificate uploaded successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Failed to upload certificate";
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

        deletePlayerDocument: builder.mutation<any, string>({
            query: (documentId) => ({
                url: `/players/me/documents/${documentId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.PLAYERS, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Certificate deleted successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Failed to delete certificate";
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

        updatePlayerDocument: builder.mutation<any, { documentId: string; title: string }>({
            query: ({ documentId, title }) => {
                const formData = new FormData();
                formData.append("title", title);
                return {
                    url: `/players/me/documents/${documentId}`,
                    method: "PATCH",
                    body: formData,
                };
            },
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.PLAYERS, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Document title updated successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Failed to update document title";
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

        getMyPlayerAnalytics: builder.query<IPlayerAnalyticsResponse, void>({
            query: () => ({
                url: "/players/me/analytics",
                method: "GET",
            }),
            providesTags: [TagTypes.PLAYERS],
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
    useGetPlayerCvByIdQuery,
    useLazyGetPlayerCvByIdQuery,
    useGetMyPlayerMediaQuery,
    useUploadPlayerMediaMutation,
    useCreateSelfGameReportMutation,
    useRequestCoachGameReportMutation,
    useGetMyGameReportsQuery,
    useUploadPlayerDocumentMutation,
    useDeletePlayerDocumentMutation,
    useUpdatePlayerDocumentMutation,
    useGetMyPlayerAnalyticsQuery,
    useLazyGetMyPlayerAnalyticsQuery,
    useAddPlayerClubMutation,
    useDeletePlayerClubMutation,
    useUpdatePlayerClubMutation,
} = playerApi;

// Export aliases for convenience
export const useGetMyProfileQuery = useGetMyPlayerProfileQuery;
export const useGetMyPlayerQuery = useGetMyPlayerProfileQuery;
export const useGetMyCvQuery = useGetMyPlayerCvQuery;
export const useLazyGetMyCvQuery = useLazyGetMyPlayerCvQuery;
export const useCreatePlayerClubMutation = useAddPlayerClubMutation;
export const useRemovePlayerClubMutation = useDeletePlayerClubMutation;


