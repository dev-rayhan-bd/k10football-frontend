/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";
import { 
  IAcademyCoachAndPlayersResponse,
  ICreateAcademyTeamPayload,
  IUpdateAcademyTeamPayload,
  IAssignCoachToTeamPayload,
  IAssignPlayerToTeamPayload,
  ITeamRosterResponse,
  ISuccessStoriesMetaResponse,
  ISuccessStoriesResponse,
  IGetSuccessStoriesParams,
  IAcademyParentsResponse,
  IGetAcademyParentsParams,
  ICreateAcademyParentPayload,
  IUpdateAcademyParentPayload,
  ITransferRequestsResponse,
  ITargetAcademiesResponse,
  ITransferMyPlayersResponse,
  ICreateTransferRequestPayload,
  IFeesPaymentsResponse,
  IGetFeesPaymentsParams,
  IFinanceCommitteeResponse,
  IGetFinanceCommitteeParams,
  IAcademyMatchesResponse,
  IGetAcademyMatchesParams,
  ICreateAcademyMatchPayload,
  IExtraEventsMetaResponse,
  IExtraEventsResponse,
  IGetExtraEventsParams,
  ICreateExtraEventPayload,
  ISponsorsMetaResponse,
  ISponsorsResponse,
  IGetSponsorsParams,
  ICreateSponsorPayload,
  IUpdateSponsorPayload,
  ITrainingSessionCoachesResponse,
  ITrainingSessionTeamsResponse,
  IGetTrainingSessionsParams,
  IGetTrainingSessionsResponse,
  ICreateTrainingSessionPayload,
  IUpdateTrainingSessionArgs,
  ISessionAttendanceResponse,
  IUpdateSessionAttendanceArgs,
  IAcademyAnalyticsReportResponse,
  IAcademyDashboardResponse,
  IAcademyNewsMetaResponse,
  IAcademyNewsResponse,
  IGetAcademyNewsParams,
  IAcademyPlayerEvaluationsResponse,
  IGetAcademyPlayerEvaluationsParams,
  IAcademyPlayerEvaluationPdfResponse,
  IPlayerEvaluationDetailsResponse,
  IAcademyGameReportsResponse,
  IGetAcademyGameReportsParams,
  ISingleGameReportResponse,
  IAcademyValidateCvResponse,
  IGetAcademyValidateCvParams,
  INotifyCoachToValidateCvPayload,
  INotifyCoachToValidateCvResponse,
  IAcademyProfileResponse,
} from "@/types/academy.type";

export const academyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyAcademyProfile: builder.query<IAcademyProfileResponse, void>({
      query: () => ({
        url: "/academies/my-profile",
        method: "GET",
      }),
      providesTags: [TagTypes.ACADEMY, TagTypes.PROFILE],
    }),

    updateAcademyProfile: builder.mutation<any, FormData | Record<string, any>>({
      query: (data) => {
        let body: any = data;
        if (!(data instanceof FormData)) {
          const formData = new FormData();
          formData.append("data", JSON.stringify(data));
          body = formData;
        }
        return {
          url: "/academies/my-profile",
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY, TagTypes.PROFILE, TagTypes.DASHBOARD];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Academy profile updated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to update academy profile";
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

    getAcademyParents: builder.query<IAcademyParentsResponse, IGetAcademyParentsParams | void>({
      query: (params) => ({
        url: "/academies/parents",
        method: "GET",
        params: params || {},
      }),
      providesTags: [TagTypes.PARENTS, TagTypes.ACADEMY],
    }),

    createAcademyParent: builder.mutation<any, ICreateAcademyParentPayload>({
      query: (data) => ({
        url: "/academies/parents",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.PARENTS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Parent created successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to create parent";
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

    updateAcademyParent: builder.mutation<any, { parentId: string; data: IUpdateAcademyParentPayload }>({
      query: ({ parentId, data }) => ({
        url: `/academies/parents/${parentId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.PARENTS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Parent updated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to update parent";
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

    deleteAcademyParent: builder.mutation<any, string>({
      query: (parentId) => ({
        url: `/academies/parents/${parentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.PARENTS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Parent deleted successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to delete parent";
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
    getTeamRoster: builder.query<ITeamRosterResponse, string>({
      query: (teamId) => ({
        url: `/academies/teams/${teamId}/roster`,
        method: "GET",
      }),
      providesTags: [TagTypes.ACADEMY, TagTypes.TEAMS],
    }),

    getAcademyCoachAndPlayers: builder.query<IAcademyCoachAndPlayersResponse, void>({
      query: () => ({
        url: "/academies/coach-and-players",
        method: "GET",
      }),
      providesTags: [TagTypes.ACADEMY, TagTypes.TEAMS],
    }),

    getSuccessStoriesMeta: builder.query<ISuccessStoriesMetaResponse, void>({
      query: () => ({
        url: "/academies/success-stories/meta",
        method: "GET",
      }),
      providesTags: [TagTypes.SUCCESS_STORIES],
    }),

    getSuccessStories: builder.query<ISuccessStoriesResponse, IGetSuccessStoriesParams | void>({
      query: (params) => ({
        url: "/academies/success-stories",
        method: "GET",
        params: params || {},
      }),
      providesTags: [TagTypes.SUCCESS_STORIES],
    }),

    addSuccessStory: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/academies/success-stories",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.SUCCESS_STORIES, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Success story submitted for approval");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to submit success story";
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

    deleteSuccessStory: builder.mutation<any, string>({
      query: (storyId) => ({
        url: `/academies/success-stories/${storyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.SUCCESS_STORIES, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Success story deleted successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to delete success story";
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

    updateSuccessStory: builder.mutation<any, { storyId: string; formData: FormData }>({
      query: ({ storyId, formData }) => ({
        url: `/academies/success-stories/${storyId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.SUCCESS_STORIES, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Success story updated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to update success story";
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

    createAcademyTeam: builder.mutation<any, ICreateAcademyTeamPayload>({
      query: (data) => ({
        url: "/academies/teams",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY, TagTypes.TEAMS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Team created successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to create team";
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

    updateAcademyTeam: builder.mutation<any, { teamId: string; data: IUpdateAcademyTeamPayload }>({
      query: ({ teamId, data }) => ({
        url: `/academies/teams/${teamId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY, TagTypes.TEAMS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Team updated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to update team";
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

    deleteAcademyTeam: builder.mutation<any, string>({
      query: (teamId) => ({
        url: `/academies/teams/${teamId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY, TagTypes.TEAMS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Team deleted successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to delete team";
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

    assignCoachToTeam: builder.mutation<any, { teamId: string; data: IAssignCoachToTeamPayload }>({
      query: ({ teamId, data }) => ({
        url: `/academies/teams/${teamId}/coaches`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY, TagTypes.TEAMS, TagTypes.COACHES];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Coach assigned to team successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to assign coach";
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

    assignPlayerToTeam: builder.mutation<any, { teamId: string; data: IAssignPlayerToTeamPayload }>({
      query: ({ teamId, data }) => ({
        url: `/academies/teams/${teamId}/players`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY, TagTypes.TEAMS, TagTypes.PLAYERS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Player assigned to team successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to assign player";
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

    removeCoachFromTeam: builder.mutation<any, { teamId: string; coachId: string }>({
      query: ({ teamId, coachId }) => ({
        url: `/academies/teams/${teamId}/coaches/${coachId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY, TagTypes.TEAMS, TagTypes.COACHES];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Coach removed from team successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to remove coach from team";
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

    removePlayerFromTeam: builder.mutation<any, { teamId: string; playerId: string }>({
      query: ({ teamId, playerId }) => ({
        url: `/academies/teams/${teamId}/players/${playerId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY, TagTypes.TEAMS, TagTypes.PLAYERS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Player removed from team successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to remove player from team";
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

    // Transfer Requests Endpoints
    getTransferRequests: builder.query<ITransferRequestsResponse, void>({
      query: () => ({
        url: "/academies/transfer-requests",
        method: "GET",
      }),
      providesTags: [TagTypes.TRANSFERS, TagTypes.ACADEMY],
    }),

    getTargetAcademies: builder.query<ITargetAcademiesResponse, void>({
      query: () => ({
        url: "/academies/transfer-requests/target-academies",
        method: "GET",
      }),
      providesTags: [TagTypes.TRANSFERS, TagTypes.ACADEMY],
    }),

    getMyPlayersForTransfer: builder.query<ITransferMyPlayersResponse, void>({
      query: () => ({
        url: "/academies/transfer-requests/my-players",
        method: "GET",
      }),
      providesTags: [TagTypes.TRANSFERS, TagTypes.PLAYERS],
    }),

    createTransferRequest: builder.mutation<any, ICreateTransferRequestPayload>({
      query: (data) => ({
        url: "/academies/transfer-requests",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.TRANSFERS, TagTypes.ACADEMY, TagTypes.PLAYERS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Transfer request submitted successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to create transfer request";
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

    approveTransferRequest: builder.mutation<any, string>({
      query: (requestId) => ({
        url: `/academies/transfer-requests/${requestId}/approve`,
        method: "POST",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.TRANSFERS, TagTypes.ACADEMY, TagTypes.PLAYERS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Transfer request approved successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to approve transfer request";
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

    rejectTransferRequest: builder.mutation<any, { requestId: string; note?: string }>({
      query: ({ requestId, note }) => ({
        url: `/academies/transfer-requests/${requestId}/reject`,
        method: "POST",
        body: note ? { note } : {},
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.TRANSFERS, TagTypes.ACADEMY, TagTypes.PLAYERS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Transfer request rejected");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to reject transfer request";
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

    // Fees & Payments Endpoint
    getFeesPayments: builder.query<IFeesPaymentsResponse, IGetFeesPaymentsParams | void>({
      query: (params) => ({
        url: "/academies/fees-payments",
        method: "GET",
        params: params || {},
      }),
      providesTags: [TagTypes.FEES, TagTypes.PAYMENTS, TagTypes.ACADEMY],
    }),

    // Finance Committee Endpoint
    getFinanceCommittee: builder.query<IFinanceCommitteeResponse, IGetFinanceCommitteeParams | void>({
      query: (params) => ({
        url: "/academies/finance-committee",
        method: "GET",
        params: params || {},
      }),
      providesTags: [TagTypes.FINANCE, TagTypes.ACADEMY],
    }),

    // Scheduled Matches Endpoints
    getAcademyMatches: builder.query<IAcademyMatchesResponse, IGetAcademyMatchesParams | void>({
      query: (params) => ({
        url: "/academies/matches",
        method: "GET",
        params: params || {},
      }),
      providesTags: [TagTypes.MATCHES, TagTypes.ACADEMY],
    }),

    createAcademyMatch: builder.mutation<any, ICreateAcademyMatchPayload>({
      query: (data) => ({
        url: "/academies/matches",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.MATCHES, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Match scheduled successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to schedule match";
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

    deleteAcademyMatch: builder.mutation<any, string>({
      query: (matchId) => ({
        url: `/academies/matches/${matchId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.MATCHES, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Match deleted successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to delete match";
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

    getExtraEventsMeta: builder.query<IExtraEventsMetaResponse, void>({
      query: () => ({
        url: "/academies/extra-events/meta",
        method: "GET",
      }),
      providesTags: [TagTypes.EXTRA_EVENTS, TagTypes.ACADEMY],
    }),

    getExtraEvents: builder.query<IExtraEventsResponse, IGetExtraEventsParams | void>({
      query: (params) => ({
        url: "/academies/extra-events",
        method: "GET",
        params: params || {},
      }),
      providesTags: [TagTypes.EXTRA_EVENTS, TagTypes.ACADEMY],
    }),

    createExtraEvent: builder.mutation<any, FormData | ICreateExtraEventPayload>({
      query: (arg) => {
        let body: FormData;
        if (typeof window !== "undefined" && arg instanceof FormData) {
          body = arg;
        } else {
          const formData = new FormData();
          const payload = arg as any;
          if (payload.bannerImage instanceof File) {
            formData.append("bannerImage", payload.bannerImage);
          }
          const cleanData = { ...payload };
          delete cleanData.bannerImage;
          formData.append("data", JSON.stringify(cleanData));
          body = formData;
        }
        return {
          url: "/academies/extra-events",
          method: "POST",
          body,
        };
      },
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.EXTRA_EVENTS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Extra event created successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to create extra event";
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

    registerClubForExtraEvent: builder.mutation<any, { eventId: string; body: FormData | any }>({
      query: ({ eventId, body }) => {
        let reqBody = body;
        if (typeof window !== "undefined" && !(body instanceof FormData)) {
          const formData = new FormData();
          if (body?.logo instanceof File) {
            formData.append("logo", body.logo);
          }
          if (typeof body?.data === "string") {
            formData.append("data", body.data);
          } else if (typeof body?.data === "object" && body?.data !== null) {
            formData.append("data", JSON.stringify(body.data));
          } else if (typeof body === "object" && body !== null) {
            const { logo, ...rest } = body;
            formData.append("data", JSON.stringify(rest));
          }
          reqBody = formData;
        }

        return {
          url: `/academies/extra-events/${eventId}/register-club`,
          method: "POST",
          body: reqBody,
        };
      },
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.EXTRA_EVENTS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Club registration initiated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message =
            err?.error?.data?.message ||
            err?.error?.data?.errorSources?.[0]?.message ||
            err?.error?.message ||
            "Failed to initiate club registration";
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

    allocateTournamentGroups: builder.mutation<
      any,
      {
        eventId: string;
        allocations: Array<{ _id: string; group: string }>;
      }
    >({
      query: ({ eventId, allocations }) => ({
        url: `/academies/extra-events/${eventId}/allocate-groups`,
        method: "PATCH",
        body: { allocations },
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.EXTRA_EVENTS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Groups allocated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message =
            err?.error?.data?.message ||
            err?.error?.data?.errorSources?.[0]?.message ||
            err?.error?.message ||
            "Failed to allocate tournament groups";
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

    startTournament: builder.mutation<any, string>({
      query: (eventId) => ({
        url: `/academies/extra-events/${eventId}/start-tournament`,
        method: "POST",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.EXTRA_EVENTS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Tournament started & fixtures generated successfully!");
        } catch (err: any) {
          const status = err?.error?.status;
          const message =
            err?.error?.data?.message ||
            err?.error?.data?.errorSources?.[0]?.message ||
            err?.error?.message ||
            "Failed to start tournament";
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

    getTournamentArena: builder.query<
      any,
      { eventId: string; tab?: "standings" | "fixtures" | "bracket" | string }
    >({
      query: ({ eventId, tab }) => ({
        url: `/academies/extra-events/${eventId}/arena${tab ? `?tab=${tab}` : ""}`,
        method: "GET",
      }),
      providesTags: [TagTypes.EXTRA_EVENTS, TagTypes.ACADEMY],
    }),

    getSingleExtraEvent: builder.query<any, string>({
      query: (eventId) => ({
        url: `/academies/extra-events/${eventId}`,
        method: "GET",
      }),
      providesTags: [TagTypes.EXTRA_EVENTS, TagTypes.ACADEMY],
    }),

    getRegisteredClubsForExtraEvent: builder.query<any, string>({
      query: (eventId) => ({
        url: `/academies/extra-events/${eventId}/registered-clubs`,
        method: "GET",
      }),
      providesTags: [TagTypes.EXTRA_EVENTS, TagTypes.ACADEMY],
    }),

    getClubPlayerRoster: builder.query<any, { eventId: string; clubId: string }>({
      query: ({ eventId, clubId }) => ({
        url: `/academies/extra-events/${eventId}/registered-clubs/${clubId}/roster`,
        method: "GET",
      }),
      providesTags: [TagTypes.EXTRA_EVENTS, TagTypes.ACADEMY],
    }),

    getSponsorsMeta: builder.query<ISponsorsMetaResponse, void>({
      query: () => ({
        url: "/academies/sponsors/meta",
        method: "GET",
      }),
      providesTags: [TagTypes.SPONSORS, TagTypes.ACADEMY],
    }),

    getSponsors: builder.query<ISponsorsResponse, IGetSponsorsParams | void>({
      query: (params) => ({
        url: "/academies/sponsors",
        method: "GET",
        params: params || {},
      }),
      providesTags: [TagTypes.SPONSORS, TagTypes.ACADEMY],
    }),

    createSponsor: builder.mutation<any, ICreateSponsorPayload>({
      query: (body) => ({
        url: "/academies/sponsors",
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.SPONSORS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Sponsor created successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to create sponsor";
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

    updateSponsor: builder.mutation<any, IUpdateSponsorPayload>({
      query: ({ sponsorId, data }) => ({
        url: `/academies/sponsors/${sponsorId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.SPONSORS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Sponsor updated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to update sponsor";
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

    deleteSponsor: builder.mutation<any, string>({
      query: (sponsorId) => ({
        url: `/academies/sponsors/${sponsorId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.SPONSORS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Sponsor deleted successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to delete sponsor";
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

    getTrainingSessionCoaches: builder.query<ITrainingSessionCoachesResponse, void>({
      query: () => ({
        url: "/academies/training-sessions/coaches",
        method: "GET",
      }),
      providesTags: [TagTypes.TRAINING_SESSIONS, TagTypes.COACHES, TagTypes.ACADEMY],
    }),

    getTrainingSessionTeams: builder.query<ITrainingSessionTeamsResponse, void>({
      query: () => ({
        url: "/academies/training-sessions/teams",
        method: "GET",
      }),
      providesTags: [TagTypes.TRAINING_SESSIONS, TagTypes.TEAMS, TagTypes.ACADEMY],
    }),

    getTrainingSessions: builder.query<IGetTrainingSessionsResponse, IGetTrainingSessionsParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.searchTerm) queryParams.searchTerm = params.searchTerm;
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.teamId) queryParams.teamId = params.teamId;
        if (params?.coachId) queryParams.coachId = params.coachId;
        return {
          url: "/academies/training-sessions",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: [TagTypes.TRAINING_SESSIONS, TagTypes.ACADEMY],
    }),

    createTrainingSession: builder.mutation<any, ICreateTrainingSessionPayload>({
      query: (body) => ({
        url: "/academies/training-sessions",
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.TRAINING_SESSIONS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Training session created successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to create training session";
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

    getSessionAttendance: builder.query<ISessionAttendanceResponse, string>({
      query: (sessionId) => ({
        url: `/academies/training-sessions/${sessionId}/attendance`,
        method: "GET",
      }),
      providesTags: [TagTypes.TRAINING_SESSIONS, TagTypes.ACADEMY],
    }),

    updateSessionAttendance: builder.mutation<any, IUpdateSessionAttendanceArgs>({
      query: ({ sessionId, body }) => ({
        url: `/academies/training-sessions/${sessionId}/attendance`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.TRAINING_SESSIONS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Attendance updated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to update attendance";
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

    updateTrainingSession: builder.mutation<any, IUpdateTrainingSessionArgs>({
      query: ({ sessionId, body }) => ({
        url: `/academies/training-sessions/${sessionId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.TRAINING_SESSIONS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Training session updated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to update training session";
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

    deleteTrainingSession: builder.mutation<any, string>({
      query: (sessionId) => ({
        url: `/academies/training-sessions/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.TRAINING_SESSIONS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Training session deleted successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to delete training session";
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

    getAcademyAnalyticsReport: builder.query<IAcademyAnalyticsReportResponse, void>({
      query: () => ({
        url: "/academies/analytics-report",
        method: "GET",
      }),
      providesTags: [TagTypes.REPORTS, TagTypes.ACADEMY],
    }),

    getAcademyDashboard: builder.query<IAcademyDashboardResponse, void>({
      query: () => ({
        url: "/academies/dashboard",
        method: "GET",
      }),
      providesTags: [TagTypes.ACADEMY],
    }),

    getAcademyNewsMeta: builder.query<IAcademyNewsMetaResponse, void>({
      query: () => ({
        url: "/academies/academy-news/meta",
        method: "GET",
      }),
      providesTags: [TagTypes.ACADEMY_NEWS],
    }),

    getAcademyNews: builder.query<IAcademyNewsResponse, IGetAcademyNewsParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.status) {
          queryParams.status = params.status;
        }
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.search) queryParams.search = params.search;
        if (params?.category) queryParams.category = params.category;
        return {
          url: "/academies/academy-news",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: [TagTypes.ACADEMY_NEWS],
    }),

    createAcademyNews: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/academies/academy-news",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY_NEWS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "News article created successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to create news article";
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

    deleteAcademyNews: builder.mutation<any, string>({
      query: (id) => ({
        url: `/academies/academy-news/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY_NEWS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Article deleted permanently");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to delete article";
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

    updateAcademyNews: builder.mutation<any, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/academies/academy-news/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY_NEWS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "News article updated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to update news article";
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

    toggleNewsVisibility: builder.mutation<any, string>({
      query: (id) => ({
        url: `/academies/academy-news/${id}/toggle-visibility`,
        method: "PATCH",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY_NEWS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "News visibility updated");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to toggle visibility";
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

    moveNewsToBin: builder.mutation<any, string>({
      query: (id) => ({
        url: `/academies/academy-news/${id}/bin`,
        method: "PATCH",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY_NEWS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "News moved to bin");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to move news to bin";
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

    restoreNewsFromBin: builder.mutation<any, string>({
      query: (id) => ({
        url: `/academies/academy-news/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY_NEWS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "News restored from bin");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to restore news";
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

    getAcademyPlayerEvaluations: builder.query<IAcademyPlayerEvaluationsResponse, IGetAcademyPlayerEvaluationsParams | void>({
      query: (params) => ({
        url: "/academies/player-evaluations",
        method: "GET",
        params: params || {},
      }),
      providesTags: [TagTypes.ACADEMY, TagTypes.PLAYER_EVALUATIONS],
    }),

    getAcademyPlayerEvaluationPdf: builder.query<IAcademyPlayerEvaluationPdfResponse, string>({
      query: (evaluationId) => ({
        url: `/academies/player-evaluations/${evaluationId}/pdf`,
        method: "GET",
      }),
      providesTags: (_result, _error, evaluationId) => [
        { type: TagTypes.PLAYER_EVALUATIONS, id: evaluationId },
        TagTypes.ACADEMY,
      ],
    }),

    getPlayerEvaluationDetails: builder.query<IPlayerEvaluationDetailsResponse, string>({
      query: (evaluationId) => ({
        url: `/coaches/player-evaluations/${evaluationId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, evaluationId) => [
        { type: TagTypes.PLAYER_EVALUATIONS, id: evaluationId },
        TagTypes.ACADEMY,
      ],
    }),

    getAcademyGameReports: builder.query<IAcademyGameReportsResponse, IGetAcademyGameReportsParams | void>({
      query: (params) => ({
        url: "/academies/game-reports",
        method: "GET",
        params: params || {},
      }),
      providesTags: [TagTypes.GAME_REPORTS, TagTypes.ACADEMY],
    }),

    getSingleGameReport: builder.query<ISingleGameReportResponse, string>({
      query: (reportId) => ({
        url: `/players/game-reports/${reportId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, reportId) => [
        { type: TagTypes.GAME_REPORTS, id: reportId },
        TagTypes.ACADEMY,
      ],
    }),

    getAcademyValidateCv: builder.query<IAcademyValidateCvResponse, IGetAcademyValidateCvParams | void>({
      query: (params) => ({
        url: "/academies/validate-cv",
        method: "GET",
        params: params || {},
      }),
      providesTags: [TagTypes.VALIDATE_CV, TagTypes.ACADEMY],
    }),

    notifyCoachToValidateCv: builder.mutation<INotifyCoachToValidateCvResponse, INotifyCoachToValidateCvPayload>({
      query: (data) => ({
        url: "/academies/validate-cv/notify-coach",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TagTypes.VALIDATE_CV, TagTypes.ACADEMY],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Coach notified successfully to validate player CV");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to notify coach";
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

    getAcademyStripeStatus: builder.query<any, void>({
      query: () => ({
        url: "/academies/me/stripe/status",
        method: "GET",
      }),
      providesTags: [TagTypes.ACADEMY, TagTypes.PAYMENTS, TagTypes.FINANCE],
    }),

    connectAcademyStripe: builder.mutation<any, void | Record<string, any>>({
      query: (body) => ({
        url: "/academies/me/stripe/connect",
        method: "POST",
        body: body || {},
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.ACADEMY, TagTypes.PAYMENTS, TagTypes.FINANCE];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Stripe onboarding URL generated successfully");
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
  }),
});

export const {
  useGetAcademyDashboardQuery,
  useLazyGetAcademyDashboardQuery,
  useGetAcademyParentsQuery,
  useLazyGetAcademyParentsQuery,
  useCreateAcademyParentMutation,
  useUpdateAcademyParentMutation,
  useDeleteAcademyParentMutation,
  useGetTeamRosterQuery,
  useLazyGetTeamRosterQuery,
  useGetAcademyCoachAndPlayersQuery,
  useLazyGetAcademyCoachAndPlayersQuery,
  useGetSuccessStoriesMetaQuery,
  useGetSuccessStoriesQuery,
  useLazyGetSuccessStoriesQuery,
  useAddSuccessStoryMutation,
  useUpdateSuccessStoryMutation,
  useDeleteSuccessStoryMutation,
  useCreateAcademyTeamMutation,
  useUpdateAcademyTeamMutation,
  useDeleteAcademyTeamMutation,
  useAssignCoachToTeamMutation,
  useAssignPlayerToTeamMutation,
  useRemoveCoachFromTeamMutation,
  useRemovePlayerFromTeamMutation,
  useGetTransferRequestsQuery,
  useLazyGetTransferRequestsQuery,
  useGetTargetAcademiesQuery,
  useLazyGetTargetAcademiesQuery,
  useGetMyPlayersForTransferQuery,
  useLazyGetMyPlayersForTransferQuery,
  useCreateTransferRequestMutation,
  useApproveTransferRequestMutation,
  useRejectTransferRequestMutation,
  useGetFeesPaymentsQuery,
  useLazyGetFeesPaymentsQuery,
  useGetFinanceCommitteeQuery,
  useLazyGetFinanceCommitteeQuery,
  useGetAcademyMatchesQuery,
  useLazyGetAcademyMatchesQuery,
  useCreateAcademyMatchMutation,
  useDeleteAcademyMatchMutation,
  useGetExtraEventsMetaQuery,
  useLazyGetExtraEventsMetaQuery,
  useGetExtraEventsQuery,
  useLazyGetExtraEventsQuery,
  useCreateExtraEventMutation,
  useRegisterClubForExtraEventMutation,
  useAllocateTournamentGroupsMutation,
  useStartTournamentMutation,
  useGetTournamentArenaQuery,
  useLazyGetTournamentArenaQuery,
  useGetSingleExtraEventQuery,
  useLazyGetSingleExtraEventQuery,
  useGetRegisteredClubsForExtraEventQuery,
  useLazyGetRegisteredClubsForExtraEventQuery,
  useGetClubPlayerRosterQuery,
  useLazyGetClubPlayerRosterQuery,
  useGetSponsorsMetaQuery,
  useLazyGetSponsorsMetaQuery,
  useGetSponsorsQuery,
  useLazyGetSponsorsQuery,
  useCreateSponsorMutation,
  useUpdateSponsorMutation,
  useDeleteSponsorMutation,
  useGetTrainingSessionCoachesQuery,
  useLazyGetTrainingSessionCoachesQuery,
  useGetTrainingSessionTeamsQuery,
  useLazyGetTrainingSessionTeamsQuery,
  useGetTrainingSessionsQuery,
  useLazyGetTrainingSessionsQuery,
  useCreateTrainingSessionMutation,
  useUpdateTrainingSessionMutation,
  useDeleteTrainingSessionMutation,
  useGetSessionAttendanceQuery,
  useLazyGetSessionAttendanceQuery,
  useUpdateSessionAttendanceMutation,
  useGetAcademyAnalyticsReportQuery,
  useLazyGetAcademyAnalyticsReportQuery,
  useGetAcademyNewsMetaQuery,
  useLazyGetAcademyNewsMetaQuery,
  useGetAcademyNewsQuery,
  useLazyGetAcademyNewsQuery,
  useCreateAcademyNewsMutation,
  useUpdateAcademyNewsMutation,
  useToggleNewsVisibilityMutation,
  useMoveNewsToBinMutation,
  useRestoreNewsFromBinMutation,
  useDeleteAcademyNewsMutation,
  useGetAcademyPlayerEvaluationsQuery,
  useLazyGetAcademyPlayerEvaluationsQuery,
  useGetAcademyPlayerEvaluationPdfQuery,
  useLazyGetAcademyPlayerEvaluationPdfQuery,
  useGetPlayerEvaluationDetailsQuery,
  useLazyGetPlayerEvaluationDetailsQuery,
  useGetAcademyGameReportsQuery,
  useLazyGetAcademyGameReportsQuery,
  useGetSingleGameReportQuery,
  useLazyGetSingleGameReportQuery,
  useGetAcademyValidateCvQuery,
  useLazyGetAcademyValidateCvQuery,
  useNotifyCoachToValidateCvMutation,
  useGetMyAcademyProfileQuery,
  useLazyGetMyAcademyProfileQuery,
  useUpdateAcademyProfileMutation,
  useGetAcademyStripeStatusQuery,
  useLazyGetAcademyStripeStatusQuery,
  useConnectAcademyStripeMutation,
} = academyApi;





