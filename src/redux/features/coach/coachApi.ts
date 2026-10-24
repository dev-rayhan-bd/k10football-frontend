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
} from "@/types/coach.type";

export const coachApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
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
    }),
});

export const {
    useGetMyCoachCvQuery,
    useLazyGetMyCoachCvQuery,
    useUpdateMyCoachProfileMutation,
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
} = coachApi;

