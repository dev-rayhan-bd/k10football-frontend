import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { ErrorToast, SuccessToast } from "@/helpers/ValidationHelper";
import {
  IAcademyEvaluationAnalyticsResponse,
  IAcademyEvaluationsDashboardResponse,
  ICoachEvaluationDetailResponse,
  ICoachEvaluationsResponse,
  IEvaluationPdfResponse,
  IEvaluationSheetResponse,
  IGetAcademyEvaluationAnalyticsParams,
  IGetCoachEvaluationsParams,
  IPlayerEvaluationHistoryResponse,
  IRemindEvaluationResponse,
  IRequestEvaluationPayload,
  IRequestEvaluationResponse,
  ISubmitCoachEvaluationPayload,
  ISubmitCoachEvaluationResponse,
} from "@/types/evaluation.type";

/** `{ status, message }` from an RTK Query error. */
export const getEvaluationApiError = (err: unknown, fallback: string) => {
  const e = err as { status?: number; data?: { message?: string }; error?: { status?: number; data?: { message?: string } } };
  const status = e?.status ?? e?.error?.status;
  const message = e?.data?.message || e?.error?.data?.message || fallback;
  return { status: typeof status === "number" ? status : undefined, message };
};

const cleanParams = (params?: object) =>
  Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );

const EVAL = TagTypes.PLAYER_EVALUATIONS;

// Only the endpoints from the 4-month evaluation contract. Removed routes are not used here.
export const evaluationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ---------- Academy ----------
    getAcademyEvaluationsDashboard: builder.query<IAcademyEvaluationsDashboardResponse, void>({
      query: () => ({ url: "/academies/evaluations/dashboard", method: "GET" }),
      providesTags: [EVAL],
    }),

    // Callers handle 409 (open request → offer "Send reminder"); other errors toast here.
    requestEvaluation: builder.mutation<IRequestEvaluationResponse, IRequestEvaluationPayload>({
      query: (body) => ({ url: "/academies/evaluations/request", method: "POST", body }),
      invalidatesTags: (result) => (result?.success ? [EVAL] : []),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Evaluation requested");
        } catch (err) {
          const { status, message } = getEvaluationApiError(err, "Failed to request evaluation");
          if (status !== 401 && status !== 409) ErrorToast(message);
        }
      },
    }),

    remindEvaluation: builder.mutation<IRemindEvaluationResponse, string>({
      query: (evaluationId) => ({ url: `/academies/evaluations/${evaluationId}/remind`, method: "POST" }),
      invalidatesTags: (result) => (result?.success ? [EVAL] : []),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Reminder sent to coach");
        } catch (err) {
          const { status, message } = getEvaluationApiError(err, "Failed to send reminder");
          if (status !== 401) ErrorToast(message);
        }
      },
    }),

    getAcademyEvaluationAnalytics: builder.query<IAcademyEvaluationAnalyticsResponse, IGetAcademyEvaluationAnalyticsParams | void>({
      query: (params) => ({
        url: "/academies/player-evaluations/dashboard",
        method: "GET",
        params: cleanParams(params || undefined),
      }),
      providesTags: [EVAL],
    }),

    /** `:id` = evaluation id, or a player id (latest evaluation). Used by academy and player. */
    getEvaluationSheet: builder.query<IEvaluationSheetResponse, string>({
      query: (id) => ({ url: `/academies/player-evaluations/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: EVAL, id }, EVAL],
    }),

    /** 404 = nothing submitted yet → hide Download. */
    getAcademyEvaluationPdf: builder.query<IEvaluationPdfResponse, string>({
      query: (id) => ({ url: `/academies/player-evaluations/${id}/pdf`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: EVAL, id }],
    }),

    // ---------- Coach ----------
    getCoachEvaluations: builder.query<ICoachEvaluationsResponse, IGetCoachEvaluationsParams | void>({
      query: (params) => ({
        url: "/coaches/me/player-evaluations",
        method: "GET",
        params: cleanParams({ status: "PENDING", ...(params || {}) }),
      }),
      providesTags: [EVAL],
    }),

    getCoachEvaluationDetail: builder.query<ICoachEvaluationDetailResponse, string>({
      query: (id) => ({ url: `/coaches/me/player-evaluations/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: EVAL, id }, EVAL],
    }),

    // Callers toast success (with the new overall rating) and handle errors (400/402/403/409).
    submitCoachEvaluation: builder.mutation<ISubmitCoachEvaluationResponse, ISubmitCoachEvaluationPayload>({
      query: ({ id, ...body }) => ({
        url: `/coaches/me/player-evaluations/${id}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => (result?.success ? [EVAL, TagTypes.PLAYERS] : []),
    }),

    /** Used by coach (B4) and player (C). 404 = not submitted yet. */
    getCoachEvaluationPdf: builder.query<IEvaluationPdfResponse, string>({
      query: (id) => ({ url: `/coaches/me/player-evaluations/${id}/pdf`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: EVAL, id }],
    }),

    // ---------- Player ----------
    getMyEvaluationHistory: builder.query<IPlayerEvaluationHistoryResponse, void>({
      query: () => ({ url: "/academies/evaluations", method: "GET" }),
      providesTags: [EVAL],
    }),
  }),
});

export const {
  useGetAcademyEvaluationsDashboardQuery,
  useRequestEvaluationMutation,
  useRemindEvaluationMutation,
  useGetAcademyEvaluationAnalyticsQuery,
  useGetEvaluationSheetQuery,
  useGetAcademyEvaluationPdfQuery,
  useLazyGetAcademyEvaluationPdfQuery,
  useGetCoachEvaluationsQuery,
  useGetCoachEvaluationDetailQuery,
  useLazyGetCoachEvaluationDetailQuery,
  useSubmitCoachEvaluationMutation,
  useGetCoachEvaluationPdfQuery,
  useLazyGetCoachEvaluationPdfQuery,
  useGetMyEvaluationHistoryQuery,
} = evaluationApi;
