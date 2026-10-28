/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";
import {
  IScoutingBoardResponse,
  IGetScoutingBoardParams,
  IToggleScoutingBoardFavouritePayload,
  IToggleScoutingBoardFavouriteResponse,
} from "@/types/club.type";

export const clubApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getScoutingBoard: builder.query<IScoutingBoardResponse, IGetScoutingBoardParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.position && params.position !== "ALL") {
          queryParams.append("position", params.position);
        }
        if (params?.country && params.country !== "ALL") {
          queryParams.append("country", params.country);
        }
        if (params?.status && params.status !== "ALL") {
          queryParams.append("status", params.status);
        }
        if (params?.role && params.role !== "ALL") {
          queryParams.append("role", params.role);
        }
        if (params?.speciality && params.speciality !== "ALL") {
          queryParams.append("speciality", params.speciality);
        }
        if (params?.coachStatus && params.coachStatus !== "ALL") {
          queryParams.append("coachStatus", params.coachStatus);
        }
        if (params?.playerPage) {
          queryParams.append("playerPage", params.playerPage.toString());
        }
        if (params?.playerLimit) {
          queryParams.append("playerLimit", params.playerLimit.toString());
        }
        if (params?.coachPage) {
          queryParams.append("coachPage", params.coachPage.toString());
        }
        if (params?.coachLimit) {
          queryParams.append("coachLimit", params.coachLimit.toString());
        }

        const qs = queryParams.toString();
        return {
          url: qs ? `/clubs/scouting-board?${qs}` : "/clubs/scouting-board",
          method: "GET",
        };
      },
      providesTags: [TagTypes.SCOUTING_BOARD],
    }),

    toggleScoutingBoardFavourite: builder.mutation<
      IToggleScoutingBoardFavouriteResponse,
      IToggleScoutingBoardFavouritePayload
    >({
      query: (body) => ({
        url: "/clubs/scouting-board/favourite",
        method: "POST",
        body,
      }),
      invalidatesTags: [TagTypes.SCOUTING_BOARD],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Favourite updated successfully");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to update favourite";
          ErrorToast(message);
        }
      },
    }),
  }),
});

export const {
  useGetScoutingBoardQuery,
  useToggleScoutingBoardFavouriteMutation,
} = clubApi;
