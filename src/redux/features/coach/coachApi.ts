/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";
import { 
    ICoachCvResponse, 
    IUpdateCoachPayload,
    ICoachTestimonialsResponse,
    ICreateCoachTestimonialPayload,
    ICoachListResponse,
    ICoachAnalyticsResponse,
    ICoachTeamResponse,
    ICoachGameReportsResponse,
    ICoachPlayerCvValidationsResponse,
    ICoachPlayerEvaluationsResponse,
    IUpdatePlayerFitnessStatusResponse,
    IUpdatePlayerFitnessStatusPayload,
    ICoachCompleteGameReportResponse,
    ICoachCompleteGameReportPayload,
    ICoachValidatePlayerCvPayload,
    ICoachValidatePlayerCvResponse,
} from "@/types/coach.type";

export const coachApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMyCoachProfile: builder.query<any, void>({
            query: () => ({
                url: "/coaches/me",
                method: "GET",
            }),
            providesTags: [TagTypes.COACHES, TagTypes.PROFILE],
        }),

        getMyCoachCv: builder.query<ICoachCvResponse, void>({
            query: () => ({
                url: "/coaches/me/cv",
                method: "GET",
            }),
            providesTags: [TagTypes.COACHES],
        }),

        updateMyCoachProfile: builder.mutation<ICoachCvResponse, FormData | Partial<IUpdateCoachPayload> | any>({
            query: (payload) => {
                let body = payload;
                if (typeof window !== "undefined" && !(payload instanceof FormData)) {
                    const formData = new FormData();

                    if (payload.profileImage instanceof File) {
                        formData.append("profileImage", payload.profileImage);
                    }
                    if (payload.coverImage instanceof File) {
                        formData.append("coverImage", payload.coverImage);
                    }
                    if (payload.clubLogo_0 instanceof File) {
                        formData.append("clubLogo_0", payload.clubLogo_0);
                    }
                    if (payload.clubLogo_1 instanceof File) {
                        formData.append("clubLogo_1", payload.clubLogo_1);
                    }

                    if (payload.data && typeof payload.data === "string") {
                        formData.append("data", payload.data);
                    } else {
                        const cleanPayload = { ...payload };
                        delete cleanPayload.profileImage;
                        delete cleanPayload.coverImage;
                        delete cleanPayload.clubLogo_0;
                        delete cleanPayload.clubLogo_1;
                        delete (cleanPayload as any).suppressToast;
                        formData.append("data", JSON.stringify(cleanPayload));
                    }
                    body = formData;
                }

                return {
                    url: "/coaches/me",
                    method: "PATCH",
                    body,
                };
            },
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [TagTypes.COACHES, TagTypes.PROFILE];
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
                        SuccessToast("Coach profile updated successfully");
                    }
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Failed to update coach profile";
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

        addCoachClub: builder.mutation<any, FormData | { data?: any; image?: File | null; [key: string]: any }>({
            query: (payload) => {
                let body: any = payload;
                if (typeof window !== "undefined" && !(payload instanceof FormData)) {
                    const formData = new FormData();
                    if ((payload as any)?.image instanceof File) {
                        formData.append("image", (payload as any).image);
                    }
                    if (typeof (payload as any)?.data === "string") {
                        formData.append("data", (payload as any).data);
                    } else if (typeof (payload as any)?.data === "object" && (payload as any).data !== null) {
                        formData.append("data", JSON.stringify((payload as any).data));
                    } else if (typeof payload === "object" && payload !== null) {
                        const { image, ...rest } = payload as any;
                        formData.append("data", JSON.stringify(rest));
                    }
                    body = formData;
                }
                return {
                    url: "/coaches/me/clubs",
                    method: "POST",
                    body,
                };
            },
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.COACHES, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    SuccessToast(data?.message || "Club added successfully");
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

        updateCoachClub: builder.mutation<any, { clubId: string; data: FormData | { data?: any; image?: File | null; [key: string]: any } | any }>({
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
                    } else if (typeof data === "object" && data !== null) {
                        const { image, ...rest } = data as any;
                        formData.append("data", JSON.stringify(rest));
                    }
                    body = formData;
                }
                return {
                    url: `/coaches/me/clubs/${clubId}`,
                    method: "PATCH",
                    body,
                };
            },
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.COACHES, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    SuccessToast(data?.message || "Club updated successfully");
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

        deleteCoachClub: builder.mutation<any, string>({
            query: (clubId) => ({
                url: `/coaches/me/clubs/${clubId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.COACHES, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    SuccessToast(data?.message || "Club deleted successfully");
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

        uploadCoachDocument: builder.mutation({
            query: (formData: FormData) => ({
                url: "/coaches/me/documents",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [TagTypes.COACHES, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Document uploaded successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Failed to upload document";
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

        deleteCoachDocument: builder.mutation({
            query: (documentId: string) => ({
                url: `/coaches/me/documents/${documentId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [TagTypes.COACHES, TagTypes.PROFILE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Document deleted successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Failed to delete document";
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

        updateCoachDocument: builder.mutation({
            query: ({ documentId, title }: { documentId: string; title: string }) => {
                const formData = new FormData();
                formData.append("title", title);
                return {
                    url: `/coaches/me/documents/${documentId}`,
                    method: "PATCH",
                    body: formData,
                };
            },
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [TagTypes.COACHES, TagTypes.PROFILE];
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

        getMyCoachTestimonials: builder.query<ICoachTestimonialsResponse, void>({
            query: () => ({
                url: "/coaches/me/testimonials",
                method: "GET",
            }),
            providesTags: [TagTypes.TESTIMONIALS, TagTypes.COACHES],
        }),

        createCoachTestimonial: builder.mutation<any, FormData | ICreateCoachTestimonialPayload | any>({
            query: (payload) => {
                let body = payload;
                if (typeof window !== "undefined" && !(payload instanceof FormData)) {
                    const formData = new FormData();
                    if (payload.authorAvatar instanceof File) {
                        formData.append("authorAvatar", payload.authorAvatar);
                    }
                    const dataObj = {
                        authorName: payload.authorName,
                        authorRole: payload.authorRole,
                        rating: Number(payload.rating) || 5,
                        comment: payload.comment || "",
                    };
                    formData.append("data", JSON.stringify(dataObj));
                    body = formData;
                }
                return {
                    url: "/coaches/me/testimonials",
                    method: "POST",
                    body,
                };
            },
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.TESTIMONIALS, TagTypes.COACHES];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Testimonial added successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Failed to add testimonial";
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

        updateCoachTestimonial: builder.mutation<any, { testimonialId: string; formData: FormData } | { testimonialId: string; authorName?: string; authorRole?: string; rating?: number; comment?: string; authorAvatar?: File } | any>({
            query: (payload) => {
                const testimonialId = payload.testimonialId;
                let body = payload;
                if (payload.formData instanceof FormData) {
                    body = payload.formData;
                } else if (typeof window !== "undefined" && !(payload instanceof FormData)) {
                    const formData = new FormData();
                    if (payload.authorAvatar instanceof File) {
                        formData.append("authorAvatar", payload.authorAvatar);
                    }
                    const dataObj: any = {};
                    if (payload.authorName !== undefined) dataObj.authorName = payload.authorName;
                    if (payload.authorRole !== undefined) dataObj.authorRole = payload.authorRole;
                    if (payload.rating !== undefined) dataObj.rating = Number(payload.rating);
                    if (payload.comment !== undefined) dataObj.comment = payload.comment;
                    formData.append("data", JSON.stringify(dataObj));
                    body = formData;
                }
                return {
                    url: `/coaches/me/testimonials/${testimonialId}`,
                    method: "PATCH",
                    body,
                };
            },
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.TESTIMONIALS, TagTypes.COACHES];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Testimonial updated successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Failed to update testimonial";
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

        deleteCoachTestimonial: builder.mutation<any, string>({
            query: (testimonialId: string) => ({
                url: `/coaches/me/testimonials/${testimonialId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.TESTIMONIALS, TagTypes.COACHES];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    SuccessToast("Testimonial deleted successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message = err?.error?.data?.message || "Failed to delete testimonial";
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

        getAllCoaches: builder.query<ICoachListResponse, { page?: number; limit?: number; searchTerm?: string } | void>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                if (params?.searchTerm) queryParams.append("searchTerm", params.searchTerm);
                const queryString = queryParams.toString();
                return {
                    url: queryString ? `/coaches?${queryString}` : "/coaches",
                    method: "GET",
                };
            },
            providesTags: [TagTypes.COACHES],
        }),

        getMyCoachAnalytics: builder.query<ICoachAnalyticsResponse, void>({
            query: () => ({
                url: "/coaches/my-analytics",
                method: "GET",
            }),
            providesTags: [TagTypes.COACHES],
        }),

        getMyTeams: builder.query<ICoachTeamResponse, { page?: number; limit?: number; searchTerm?: string } | void>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                if (params?.searchTerm) queryParams.append("searchTerm", params.searchTerm);
                const queryString = queryParams.toString();
                return {
                    url: queryString ? `/coaches/me/teams?${queryString}` : "/coaches/me/teams",
                    method: "GET",
                };
            },
            providesTags: [TagTypes.TEAMS, TagTypes.COACHES],
        }),

        getCoachGameReports: builder.query<
            ICoachGameReportsResponse,
            { page?: number; limit?: number; searchTerm?: string; status?: string; playerId?: string } | void
        >({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                if (params?.searchTerm) queryParams.append("searchTerm", params.searchTerm);
                if (params?.status) queryParams.append("status", params.status);
                if (params?.playerId) queryParams.append("playerId", params.playerId);
                const queryString = queryParams.toString();
                return {
                    url: queryString ? `/players/coach/game-reports?${queryString}` : "/players/coach/game-reports",
                    method: "GET",
                };
            },
            providesTags: [TagTypes.GAME_REPORTS, TagTypes.REPORTS, TagTypes.COACHES],
        }),

        getCoachPlayerCvValidations: builder.query<
            ICoachPlayerCvValidationsResponse,
            { page?: number; limit?: number; searchTerm?: string; status?: string } | void
        >({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                if (params?.searchTerm) queryParams.append("searchTerm", params.searchTerm);
                if (params?.status) queryParams.append("status", params.status);
                const queryString = queryParams.toString();
                return {
                    url: queryString ? `/coaches/me/player-cv-validations?${queryString}` : "/coaches/me/player-cv-validations",
                    method: "GET",
                };
            },
            providesTags: [TagTypes.COACHES, TagTypes.PLAYERS],
        }),

        getCoachPlayerEvaluations: builder.query<
            ICoachPlayerEvaluationsResponse,
            { page?: number; limit?: number; searchTerm?: string; status?: string } | void
        >({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                if (params?.searchTerm) queryParams.append("searchTerm", params.searchTerm);
                if (params?.status) queryParams.append("status", params.status);
                const queryString = queryParams.toString();
                return {
                    url: queryString ? `/coaches/me/player-evaluations?${queryString}` : "/coaches/me/player-evaluations",
                    method: "GET",
                };
            },
            providesTags: [TagTypes.COACHES, TagTypes.PLAYERS],
        }),

        updatePlayerFitnessStatus: builder.mutation<
            IUpdatePlayerFitnessStatusResponse,
            IUpdatePlayerFitnessStatusPayload
        >({
            query: ({ playerId, status }) => ({
                url: `/coaches/me/players/${playerId}/fitness-status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [TagTypes.TEAMS, TagTypes.COACHES, TagTypes.PLAYERS];
                }
                return [];
            },
            async onQueryStarted({ playerId, status }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    coachApi.util.updateQueryData("getMyTeams", undefined as any, (draft) => {
                        if (draft?.data?.players) {
                            const player = draft.data.players.find(
                                (p) => String(p._id || p.id) === String(playerId)
                            );
                            if (player) {
                                const prevStatus = player.status;
                                player.status = status;
                                if (draft.data.summary && prevStatus?.toUpperCase() !== status.toUpperCase()) {
                                    if (status.toUpperCase() === "ACTIVE") {
                                        draft.data.summary.active = (draft.data.summary.active ?? 0) + 1;
                                        draft.data.summary.injured = Math.max(0, (draft.data.summary.injured ?? 1) - 1);
                                    } else if (status.toUpperCase() === "INJURED") {
                                        draft.data.summary.injured = (draft.data.summary.injured ?? 0) + 1;
                                        draft.data.summary.active = Math.max(0, (draft.data.summary.active ?? 1) - 1);
                                    }
                                }
                            }
                        }
                    })
                );
                try {
                    const res = await queryFulfilled;
                    SuccessToast(res?.data?.message || `Player fitness status set to ${status}`);
                } catch (err: any) {
                    patchResult.undo();
                    const status_code = err?.error?.status;
                    const message = err?.error?.data?.message || "Failed to update player fitness status";
                    if (status_code === 500) {
                        ErrorToast("Something went wrong on the server");
                        return;
                    }
                    if (status_code !== 401) {
                        ErrorToast(message);
                    }
                }
            },
        }),

        completeCoachGameReport: builder.mutation<
            ICoachCompleteGameReportResponse,
            ICoachCompleteGameReportPayload
        >({
            query: ({ reportId, ...body }) => ({
                url: `/players/coach/game-reports/${reportId}/complete`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [TagTypes.GAME_REPORTS, TagTypes.REPORTS, TagTypes.COACHES];
                }
                return [];
            },
            async onQueryStarted({ reportId }, { queryFulfilled }) {
                try {
                    const res = await queryFulfilled;
                    SuccessToast(res?.data?.message || "Game report completed successfully");
                } catch (err: any) {
                    const status_code = err?.error?.status;
                    const message = err?.error?.data?.message || "Failed to complete game report";
                    if (status_code === 500) {
                        ErrorToast("Something went wrong on the server");
                        return;
                    }
                    if (status_code !== 401) {
                        ErrorToast(message);
                    }
                }
            },
        }),

        getCoachStripeStatus: builder.query<any, void>({
            query: () => ({
                url: "/coaches/me/stripe/status",
                method: "GET",
            }),
            providesTags: [TagTypes.COACHES, TagTypes.PAYMENTS, TagTypes.FINANCE],
        }),

        connectCoachStripe: builder.mutation<any, void | Record<string, any>>({
            query: (body) => ({
                url: "/coaches/me/stripe/connect",
                method: "POST",
                body: body || {},
            }),
            invalidatesTags: (result) => {
                if (result?.success || !result?.error) {
                    return [TagTypes.COACHES, TagTypes.PAYMENTS, TagTypes.FINANCE];
                }
                return [];
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    SuccessToast(data?.message || "Stripe Connect onboarding link generated successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message =
                        err?.error?.data?.message ||
                        err?.error?.data?.errorSources?.[0]?.message ||
                        err?.error?.message ||
                        "Failed to generate Stripe onboarding link";
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

        validatePlayerCv: builder.mutation<
            ICoachValidatePlayerCvResponse,
            ICoachValidatePlayerCvPayload
        >({
            query: ({ playerId, ...body }) => ({
                url: `/coaches/players/${playerId}/validate-cv`,
                method: "POST",
                body,
            }),
            invalidatesTags: (result) => {
                if (result?.success) {
                    return [
                        TagTypes.PLAYERS,
                        TagTypes.VALIDATE_CV,
                        TagTypes.COACHES,
                        TagTypes.PLAYER_EVALUATIONS,
                    ];
                }
                return [];
            },
            async onQueryStarted({ playerId }, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    SuccessToast(data?.message || "Player CV validated successfully");
                } catch (err: any) {
                    const status = err?.error?.status;
                    const message =
                        err?.error?.data?.message ||
                        err?.error?.data?.errorSources?.[0]?.message ||
                        err?.error?.message ||
                        "Failed to validate player CV";
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
    }),
});

export const {
    useGetMyCoachProfileQuery,
    useLazyGetMyCoachProfileQuery,
    useGetMyCoachCvQuery,
    useLazyGetMyCoachCvQuery,
    useUpdateMyCoachProfileMutation,
    useAddCoachClubMutation,
    useUpdateCoachClubMutation,
    useDeleteCoachClubMutation,
    useUploadCoachDocumentMutation,
    useDeleteCoachDocumentMutation,
    useUpdateCoachDocumentMutation,
    useGetMyCoachTestimonialsQuery,
    useLazyGetMyCoachTestimonialsQuery,
    useCreateCoachTestimonialMutation,
    useUpdateCoachTestimonialMutation,
    useDeleteCoachTestimonialMutation,
    useGetAllCoachesQuery,
    useLazyGetAllCoachesQuery,
    useGetMyCoachAnalyticsQuery,
    useLazyGetMyCoachAnalyticsQuery,
    useGetMyTeamsQuery,
    useLazyGetMyTeamsQuery,
    useGetCoachGameReportsQuery,
    useLazyGetCoachGameReportsQuery,
    useGetCoachPlayerCvValidationsQuery,
    useLazyGetCoachPlayerCvValidationsQuery,
    useGetCoachPlayerEvaluationsQuery,
    useLazyGetCoachPlayerEvaluationsQuery,
    useUpdatePlayerFitnessStatusMutation,
    useCompleteCoachGameReportMutation,
    useGetCoachStripeStatusQuery,
    useLazyGetCoachStripeStatusQuery,
    useConnectCoachStripeMutation,
    useValidatePlayerCvMutation,
} = coachApi;

