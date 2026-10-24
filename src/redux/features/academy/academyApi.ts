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
} from "@/types/academy.type";

export const academyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const {
  useGetTeamRosterQuery,
  useLazyGetTeamRosterQuery,
  useGetAcademyCoachAndPlayersQuery,
  useLazyGetAcademyCoachAndPlayersQuery,
  useCreateAcademyTeamMutation,
  useUpdateAcademyTeamMutation,
  useDeleteAcademyTeamMutation,
  useAssignCoachToTeamMutation,
  useAssignPlayerToTeamMutation,
} = academyApi;
