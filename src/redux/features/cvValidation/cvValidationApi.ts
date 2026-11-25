import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import {
  IRequestCvValidationPayload,
  IRequestCvValidationResponse,
  IVerifyCvValidationPaymentResponse,
} from "@/types/cvValidation.type";

// Status-specific feedback (409 waiting, 403, 400/404) is handled by the calling component.
export const cvValidationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    requestCvValidation: builder.mutation<IRequestCvValidationResponse, IRequestCvValidationPayload>({
      query: (body) => ({
        url: "/players/me/request-cv-validation",
        method: "POST",
        body,
      }),
    }),

    // Safe to call repeatedly (idempotent on the server).
    verifyCvValidationPayment: builder.query<IVerifyCvValidationPaymentResponse, string>({
      query: (sessionId) => ({
        url: `/players/me/cv-validation/verify-payment?session_id=${encodeURIComponent(sessionId)}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: [TagTypes.PLAYERS],
    }),
  }),
});

export const { useRequestCvValidationMutation, useLazyVerifyCvValidationPaymentQuery } = cvValidationApi;

/** `{ status, message }` from an RTK Query error, falling back to a generic message. */
export const getApiError = (err: unknown, fallback: string) => {
  const e = err as { status?: number; data?: { message?: string } };
  return {
    status: typeof e?.status === "number" ? e.status : undefined,
    message: e?.data?.message || fallback,
  };
};
