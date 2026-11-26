import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import type {
  IAcademyEventDetail,
  IAcademyEventListData,
  IAcademyEventListParams,
  IApiEnvelope,
  IBadgePreset,
  IEventFixture,
  IEventPublicPortal,
  IExtraEventMeta,
  IGroupAllocationData,
  IPublicEvent,
  IPublicEventListParams,
  IRegisterClubData,
  IRegisterForEventData,
  IRegisterForEventPayload,
  IRegisteredClub,
  IRosterPlayer,
  IUpdateFixturePayload,
  TournamentGroup,
  TournamentStageStep,
} from "@/types/extraEvent.type";

// Academy Extra Events & Tournaments (all roles). No toasts here: callers show `message` (see
// getExtraEventApiError) so status-specific UI (403 Elite, 409 close instead, …) stays in the page.
const BASE = "/academies/extra-events";
const TAG = TagTypes.EXTRA_EVENTS;

const cleanParams = (params?: object | void) =>
  Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== "ALL")
  );

const eventTag = (id: string) => [{ type: TAG, id }];

export const extraEventApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ───────── Academy (manage) / Coach (read-only) ─────────
    getEventMeta: builder.query<IApiEnvelope<IExtraEventMeta>, void>({
      query: () => ({ url: `${BASE}/meta`, method: "GET" }),
      providesTags: [TAG],
    }),

    listAcademyEvents: builder.query<IApiEnvelope<IAcademyEventListData>, IAcademyEventListParams | void>({
      query: (params) => ({ url: BASE, method: "GET", params: cleanParams(params) }),
      providesTags: [TAG],
    }),

    getAcademyEventDetail: builder.query<IApiEnvelope<IAcademyEventDetail>, string>({
      query: (id) => ({ url: `${BASE}/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [TAG, ...eventTag(id)],
    }),

    /** multipart: banner file → "bannerImage" (or a URL string in the same field). 403 → Elite plan required. */
    createAcademyEvent: builder.mutation<IApiEnvelope<IAcademyEventDetail>, FormData>({
      query: (body) => ({ url: BASE, method: "POST", body }),
      invalidatesTags: (r) => (r?.success ? [TAG] : []),
    }),

    /** Same fields as create (FormData when a new banner is sent). Close registration: { status: "CLOSED" }. */
    updateAcademyEvent: builder.mutation<
      IApiEnvelope<IAcademyEventDetail>,
      { id: string; body: FormData | Record<string, unknown> }
    >({
      query: ({ id, body }) => ({ url: `${BASE}/${id}`, method: "PATCH", body }),
      invalidatesTags: (r, _e, { id }) => (r?.success ? [TAG, ...eventTag(id)] : []),
    }),

    /** 409 when paid registrations exist → offer "Close the event instead". */
    deleteAcademyEvent: builder.mutation<IApiEnvelope<unknown>, string>({
      query: (id) => ({ url: `${BASE}/${id}`, method: "DELETE" }),
      invalidatesTags: (r) => (r?.success ? [TAG] : []),
    }),

    getEventRegisteredClubs: builder.query<IApiEnvelope<IRegisteredClub[] | { clubs: IRegisteredClub[] }>, string>({
      query: (id) => ({ url: `${BASE}/${id}/registered-clubs`, method: "GET" }),
      providesTags: (_r, _e, id) => eventTag(id),
    }),

    getEventClubRoster: builder.query<
      IApiEnvelope<IRosterPlayer[] | { club?: IRegisteredClub; roster: IRosterPlayer[] }>,
      { eventId: string; clubId: string }
    >({
      query: ({ eventId, clubId }) => ({ url: `${BASE}/${eventId}/registered-clubs/${clubId}/roster`, method: "GET" }),
      providesTags: (_r, _e, { eventId }) => eventTag(eventId),
    }),

    /**
     * Team registration (CLUB mode), multipart: clubName, coachName, contactEmail, contactPerson?,
     * contactPhone?, category?, roster (JSON string), logo (file) OR badgePreset, paymentMethod?
     * ("MANUAL" — organising academy only). Paid → data.checkoutUrl.
     */
    registerEventClub: builder.mutation<IApiEnvelope<IRegisterClubData>, { eventId: string; body: FormData }>({
      query: ({ eventId, body }) => ({ url: `${BASE}/${eventId}/register-club`, method: "POST", body }),
      invalidatesTags: (r, _e, { eventId }) => (r?.success ? [TAG, ...eventTag(eventId)] : []),
    }),

    getEventGroupAllocation: builder.query<IApiEnvelope<IGroupAllocationData>, string>({
      query: (id) => ({ url: `${BASE}/${id}/allocate-groups`, method: "GET" }),
      providesTags: (_r, _e, id) => eventTag(id),
    }),

    allocateEventGroups: builder.mutation<
      IApiEnvelope<unknown>,
      { eventId: string; allocations: { clubId: string; group: TournamentGroup }[] }
    >({
      query: ({ eventId, allocations }) => ({
        url: `${BASE}/${eventId}/allocate-groups`,
        method: "PATCH",
        body: { allocations },
      }),
      invalidatesTags: (r, _e, { eventId }) => (r?.success ? [TAG, ...eventTag(eventId)] : []),
    }),

    /** Needs ≥ 4 PAID clubs. Generates the group fixtures. */
    startEventTournament: builder.mutation<IApiEnvelope<unknown>, string>({
      query: (id) => ({ url: `${BASE}/${id}/start-tournament`, method: "POST" }),
      invalidatesTags: (r, _e, id) => (r?.success ? [TAG, ...eventTag(id)] : []),
    }),

    updateEventFixture: builder.mutation<
      IApiEnvelope<IEventFixture>,
      { eventId: string; matchId: string; body: IUpdateFixturePayload }
    >({
      query: ({ eventId, matchId, body }) => ({ url: `${BASE}/${eventId}/fixtures/${matchId}`, method: "PATCH", body }),
      invalidatesTags: (r, _e, { eventId }) => (r?.success ? [TAG, ...eventTag(eventId)] : []),
    }),

    recordEventMatchResult: builder.mutation<
      IApiEnvelope<unknown>,
      { eventId: string; matchId: string; score1: number; score2: number }
    >({
      query: ({ eventId, ...body }) => ({ url: `${BASE}/${eventId}/record-match-result`, method: "POST", body }),
      invalidatesTags: (r, _e, { eventId }) => (r?.success ? [TAG, ...eventTag(eventId)] : []),
    }),

    simulateEventStage: builder.mutation<
      IApiEnvelope<unknown>,
      {
        eventId: string;
        step: TournamentStageStep;
        scores?: { matchId: string; homeScore: number; awayScore: number }[];
      }
    >({
      query: ({ eventId, ...body }) => ({ url: `${BASE}/${eventId}/simulate-stage`, method: "POST", body }),
      invalidatesTags: (r, _e, { eventId }) => (r?.success ? [TAG, ...eventTag(eventId)] : []),
    }),

    /** Back to REGISTRATION (confirm first). */
    resetEventTournament: builder.mutation<IApiEnvelope<unknown>, string>({
      query: (id) => ({ url: `${BASE}/${id}/reset-tournament`, method: "POST" }),
      invalidatesTags: (r, _e, id) => (r?.success ? [TAG, ...eventTag(id)] : []),
    }),

    // ───────── Public / player / parent ─────────
    listPublicEvents: builder.query<IApiEnvelope<IPublicEvent[]>, IPublicEventListParams | void>({
      query: (params) => ({ url: `${BASE}/public`, method: "GET", params: cleanParams(params) }),
      providesTags: [TAG],
    }),

    getPublicEvent: builder.query<IApiEnvelope<IPublicEvent>, string>({
      query: (id) => ({ url: `${BASE}/public/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [TAG, ...eventTag(id)],
    }),

    /** INDIVIDUAL mode; login optional (email required when logged out). Paid → data.checkoutUrl. */
    registerForEvent: builder.mutation<
      IApiEnvelope<IRegisterForEventData>,
      { eventId: string; body: IRegisterForEventPayload }
    >({
      query: ({ eventId, body }) => ({ url: `${BASE}/${eventId}/register`, method: "POST", body }),
      invalidatesTags: (r, _e, { eventId }) => (r?.success ? [TAG, ...eventTag(eventId)] : []),
    }),

    getMyEventRegistrations: builder.query<IApiEnvelope<IPublicEvent[]>, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: `${BASE}/my-registrations`, method: "GET", params: cleanParams(params) }),
      providesTags: [TAG],
    }),

    // ───────── Public tournament view ─────────
    getEventArena: builder.query<
      IApiEnvelope<Record<string, unknown>>,
      { eventId: string; tab?: string; group?: string; stage?: string }
    >({
      query: ({ eventId, ...params }) => ({ url: `${BASE}/${eventId}/arena`, method: "GET", params: cleanParams(params) }),
      providesTags: (_r, _e, { eventId }) => eventTag(eventId),
    }),

    getEventFixtures: builder.query<IApiEnvelope<IEventFixture[] | { fixtures: IEventFixture[] }>, string>({
      query: (id) => ({ url: `${BASE}/${id}/fixtures`, method: "GET" }),
      providesTags: (_r, _e, id) => eventTag(id),
    }),

    getEventPublicPortal: builder.query<IApiEnvelope<IEventPublicPortal>, string>({
      query: (id) => ({ url: `${BASE}/${id}/public-portal`, method: "GET" }),
      providesTags: (_r, _e, id) => eventTag(id),
    }),

    getEventBadgePresets: builder.query<IApiEnvelope<IBadgePreset[] | { presets: IBadgePreset[] }>, string>({
      query: (id) => ({ url: `${BASE}/${id}/badge-presets`, method: "GET" }),
      providesTags: (_r, _e, id) => eventTag(id),
    }),
  }),
});

export const {
  useGetEventMetaQuery,
  useListAcademyEventsQuery,
  useGetAcademyEventDetailQuery,
  useCreateAcademyEventMutation,
  useUpdateAcademyEventMutation,
  useDeleteAcademyEventMutation,
  useGetEventRegisteredClubsQuery,
  useGetEventClubRosterQuery,
  useRegisterEventClubMutation,
  useGetEventGroupAllocationQuery,
  useAllocateEventGroupsMutation,
  useStartEventTournamentMutation,
  useUpdateEventFixtureMutation,
  useRecordEventMatchResultMutation,
  useSimulateEventStageMutation,
  useResetEventTournamentMutation,
  useListPublicEventsQuery,
  useGetPublicEventQuery,
  useRegisterForEventMutation,
  useGetMyEventRegistrationsQuery,
  useGetEventArenaQuery,
  useGetEventFixturesQuery,
  useGetEventPublicPortalQuery,
  useGetEventBadgePresetsQuery,
} = extraEventApi;

/** `{ status, message }` from an RTK Query error (server `message` first). */
export const getExtraEventApiError = (err: unknown, fallback: string) => {
  const e = err as { status?: number; data?: { message?: string; errorSources?: { message?: string }[] } };
  return {
    status: typeof e?.status === "number" ? e.status : undefined,
    message: e?.data?.message || e?.data?.errorSources?.[0]?.message || fallback,
  };
};

/** Arrays may come bare or wrapped ({ clubs }, { fixtures }, { presets }, …). */
export const unwrapList = <T,>(data: unknown, keys: string[] = []): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    for (const key of [...keys, "items", "results", "data"]) {
      const value = (data as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
};
