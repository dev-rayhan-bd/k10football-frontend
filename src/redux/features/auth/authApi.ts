/* eslint-disable @typescript-eslint/no-explicit-any */

import { ErrorToast, SuccessToast } from "@/helpers/ValidationHelper";
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { removeToken, setToken, setUserInfo, removeUserInfo, normalizeRole } from "@/helpers/SessionHelper";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (data) => {
        let body: any = data;
        if (!(data instanceof FormData)) {
          const formData = new FormData();
          formData.append("data", JSON.stringify(data));
          body = formData;
        }
        return {
          url: "/users/register",
          method: "POST",
          body,
        };
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const message = res?.data?.message || "Registration successful! Please verify OTP.";
          SuccessToast(message);
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            ErrorToast("Something Went Wrong");
          }
          else {
            ErrorToast(message);
          }
        }
      },
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/users/verify-otp",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const token = res?.data?.data?.accessToken;
          if (token) {
            setToken(token);
            const { fullName, name, email, profileImg, role } = res?.data?.data || {};
            setUserInfo({ fullName: fullName || name, email, profileImg, role });
          }
          const message = res?.data?.message || "OTP verified successfully";
          SuccessToast(message);
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            ErrorToast("Something Went Wrong");
          }
          else {
            ErrorToast(message);
          }
        }
      },
    }),
    login: builder.mutation({
      query: (data) => ({
        url: "/users/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const token = res?.data?.data?.accessToken;
          const user = res?.data?.data?.user || res?.data?.data || {};
          const rawRole = user?.role || "PLAYER";
          const role = normalizeRole(rawRole);
          const fullName = user?.name || user?.fullName || "";
          const email = user?.email || "";
          const profileImg = user?.profileImg || user?.avatar || "";

          if (token) {
            removeToken();
            setToken(token);
          }

          setUserInfo({ fullName, email, profileImg, role });
          SuccessToast(res?.data?.message || "Login Successful");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            ErrorToast("Something Went Wrong");
          }
          else {
            ErrorToast(message);
          }
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          removeToken();
          removeUserInfo();
          SuccessToast("Successfully logged out!");
          window.location.href = "/login";
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            ErrorToast("Something Went Wrong");
            return;
          }
          if (status !== 401) {
            ErrorToast(message);
          }

        }
      },
    }),
    logoutFromAll: builder.mutation({
      query: () => ({
        url: "/auth/logout-all",
        method: "POST",
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          removeToken();
          removeUserInfo();
          SuccessToast("Successfully logged out from all devices!");
          window.location.href = "/login";
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            ErrorToast("Something Went Wrong");
            return;
          }
          if (status !== 401) {
            ErrorToast(message);
          }
        }
      },
    }),
    forgotPasswordSendOtp: builder.mutation({
      query: (data) => ({
        url: "/users/forgot-password",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          SuccessToast("OTP sent successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            ErrorToast("Something Went Wrong");
          }
          else {
            ErrorToast(message);
          }
        }
      },
    }),
    resendOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/forgot-password/send-otp",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          SuccessToast("OTP ressent successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            ErrorToast("Something Went Wrong");
          }
          else {
            ErrorToast(message);
          }
        }
      },
    }),
    forgotPasswordVerifyOtp: builder.mutation({
      query: (data) => ({
        url: "/users/verify-reset-otp",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          SuccessToast("Otp is verified successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            ErrorToast("Something Went Wrong");
          }
          else {
            ErrorToast(message);
          }
        }
      },
    }),
    forgotPasswordResendOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/forgot-pass-send-otp",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          SuccessToast("OTP is sent successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            ErrorToast("Something Went Wrong");
          }
          else {
            ErrorToast(message);
          }
        }
      },
    }),
    forgotPasswordReset: builder.mutation({
      query: (data) => ({
        url: `/users/reset-password`,
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          SuccessToast("Password is reset successfully!");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            ErrorToast("Something Went Wrong");
          }
          else {
            ErrorToast(message);
          }
        }
      },
    }),
    changeStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/auth/change-status/${id}`,
        method: "PATCH",
        body: data
      }),
      invalidatesTags: (result) => {
        if (result?.success) {
          return [TagTypes.USERS, TagTypes.ADMINS, TagTypes.OWNERS];
        }
        return [];
      },
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          SuccessToast("Update Success");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            ErrorToast("Something Went Wrong");
          }
          else {
            ErrorToast(message);
          }
        }
      },
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/users/change-password",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          SuccessToast("Password is updated successfully");
          localStorage.clear();
          window.location.href = "/login";
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Something Went Wrong";
          if (status === 500) {
            ErrorToast("Something Went Wrong");
          }
          else {
            ErrorToast(message);
          }
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyOtpMutation,
  useLoginMutation,
  useLogoutMutation,
  useLogoutFromAllMutation,
  useForgotPasswordSendOtpMutation,
  useResendOtpMutation,
  useForgotPasswordResendOtpMutation,
  useForgotPasswordVerifyOtpMutation,
  useForgotPasswordResetMutation,
  useChangeStatusMutation,
  useChangePasswordMutation,
} = authApi;
