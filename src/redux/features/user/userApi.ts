/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { ErrorToast, SuccessToast } from "@/helpers/ValidationHelper";
import { setUserInfo, getUserInfo } from "@/helpers/SessionHelper";
import { IParam } from "@/types/global.type";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args !== undefined && args.length > 0) {
          args.forEach((item: IParam) => {
            if (item.value) {
              params.append(item.name, item.value);
            }
          });
        }
        return {
          url: "/user/customers",
          method: "GET",
          params: params,
        };
      },
      keepUnusedDataFor: 600,
      providesTags: [TagTypes.USERS],
    }),

    getCustomersByShopId: builder.query({
      query: ({ shopId, args }: { shopId: string; args?: IParam[] }) => {
        const params = new URLSearchParams();
        if (args !== undefined && args.length > 0) {
          args.forEach((item: IParam) => {
            if (item.value) {
              params.append(item.name, item.value);
            }
          });
        }
        return {
          url: `/user/customers/${shopId}`,
          method: "GET",
          params: params,
        };
      },
      keepUnusedDataFor: 600,
      providesTags: [TagTypes.USERS],
    }),


    getMyProfile: builder.query({
      query: () => ({
        url: "/user/my-profile",
        method: "GET",
      }),
      providesTags: [TagTypes.PROFILE, TagTypes.USERS],
    }),

    updateProfile: builder.mutation({
      query: (data) => {
        let body: FormData | any = data;
        if (!(data instanceof FormData)) {
          const formData = new FormData();
          if (data.fullName) formData.append("fullName", data.fullName);
          if (data.phone) formData.append("phone", data.phone);
          if (data.image) formData.append("image", data.image);
          body = formData;
        }
        return {
          url: "/user/update-profile",
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: (result) => {
        if (result?.success) {
          return [TagTypes.PROFILE, TagTypes.USERS, TagTypes.ADMINS];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const updated = res?.data?.data;
          if (updated) {
            const { fullName, email, profileImg, role } = updated;
            const existingInfo = getUserInfo();
            setUserInfo({
              fullName: fullName || existingInfo.fullName,
              email: email || existingInfo.email,
              profileImg:
                profileImg !== undefined
                  ? profileImg
                  : existingInfo.profileImg,
              role: role || existingInfo.role,
            });
          }
          SuccessToast(
            res?.data?.message || "Profile updated successfully"
          );
        } catch (err: any) {
          const status = err?.error?.status;
          const message =
            err?.error?.data?.message || "Something Went Wrong";
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
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomersByShopIdQuery,
  useGetMyProfileQuery,
  useUpdateProfileMutation,
} = userApi;

