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
  ISessionAttendanceResponse,
  IUpdateSessionAttendanceArgs,
} from "@/types/academy.type";

export const academyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const {
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
  useGetSessionAttendanceQuery,
  useLazyGetSessionAttendanceQuery,
  useUpdateSessionAttendanceMutation,
} = academyApi;



