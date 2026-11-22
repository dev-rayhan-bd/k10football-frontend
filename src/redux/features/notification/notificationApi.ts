/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import {
  IGetNotificationsResponse,
  IGetUnreadCountResponse,
  IGetNotificationsParams,
  IBaseNotificationResponse,
  IGetNotificationSettingsResponse,
  IUpdateNotificationSettingsPayload,
  IUpdateNotificationSettingsResponse,
} from "@/types/notification.type";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. GET /notifications
    getNotifications: builder.query<IGetNotificationsResponse, IGetNotificationsParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.page !== undefined) queryParams.page = params.page;
        if (params?.limit !== undefined) queryParams.limit = params.limit;
        if (params?.isRead !== undefined) queryParams.isRead = params.isRead;

        return {
          url: "/notifications",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: [TagTypes.NOTIFICATIONS],
    }),

    // 2. GET /notifications/unread-count
    getUnreadNotificationCount: builder.query<IGetUnreadCountResponse, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      providesTags: [TagTypes.NOTIFICATIONS],
    }),

    // 3. PATCH /notifications/mark-all-read
    markAllNotificationsAsRead: builder.mutation<IBaseNotificationResponse, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      }),
      invalidatesTags: [TagTypes.NOTIFICATIONS],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "All notifications marked as read");
        } catch (err: any) {
          const status = err?.error?.status;
          const message =
            err?.error?.data?.message ||
            err?.error?.message ||
            "Failed to mark notifications as read";
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

    // 4. PATCH /notifications/:id/read
    markNotificationAsRead: builder.mutation<IBaseNotificationResponse, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: [TagTypes.NOTIFICATIONS],
      async onQueryStarted(_id, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          const status = err?.error?.status;
          const message =
            err?.error?.data?.message ||
            err?.error?.message ||
            "Failed to mark notification as read";
          if (status !== 401 && status !== 500) {
            ErrorToast(message);
          }
        }
      },
    }),

    // 5. DELETE /notifications/:id
    deleteNotification: builder.mutation<IBaseNotificationResponse, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TagTypes.NOTIFICATIONS],
      async onQueryStarted(_id, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Notification deleted successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message =
            err?.error?.data?.message ||
            err?.error?.message ||
            "Failed to delete notification";
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

    // 6. GET /notifications/settings
    getNotificationSettings: builder.query<IGetNotificationSettingsResponse, void>({
      query: () => ({
        url: "/notifications/settings",
        method: "GET",
      }),
      providesTags: [TagTypes.NOTIFICATIONS],
    }),

    // 7. PATCH /notifications/settings
    updateNotificationSettings: builder.mutation<
      IUpdateNotificationSettingsResponse,
      IUpdateNotificationSettingsPayload
    >({
      query: (body) => ({
        url: "/notifications/settings",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [TagTypes.NOTIFICATIONS],
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData("getNotificationSettings", undefined, (draft) => {
            if (draft?.data) {
              if (draft.data.settings) {
                Object.entries(patch).forEach(([key, val]) => {
                  if (typeof val === "boolean") {
                    draft.data.settings[key] = val;
                  }
                });
              }
              if (Array.isArray(draft.data.controls)) {
                draft.data.controls = draft.data.controls.map((ctrl) => {
                  if (ctrl.key in patch) {
                    return { ...ctrl, value: Boolean(patch[ctrl.key]) };
                  }
                  return ctrl;
                });
              }
            }
          })
        );
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Notification preferences updated");
        } catch (err: any) {
          patchResult.undo();
          const status = err?.error?.status;
          const message =
            err?.error?.data?.message ||
            err?.error?.message ||
            "Failed to update notification settings";
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
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useLazyGetUnreadNotificationCountQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationSettingsQuery,
  useLazyGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} = notificationApi;
