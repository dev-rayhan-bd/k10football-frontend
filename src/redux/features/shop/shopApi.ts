/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import {
  IGetProductsResponse,
  IGetProductCategoriesResponse,
  IGetProductsParams,
} from "@/types/shop.type";

import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";

export const shopApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<IGetProductsResponse, IGetProductsParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {};
        if (params?.category && params.category.toLowerCase() !== "all") {
          queryParams.category = params.category;
        }
        if (params?.minPrice !== undefined && params?.minPrice !== null && !isNaN(params.minPrice)) {
          queryParams.minPrice = params.minPrice;
        }
        if (params?.maxPrice !== undefined && params?.maxPrice !== null && !isNaN(params.maxPrice)) {
          queryParams.maxPrice = params.maxPrice;
        }
        if (params?.stockStatus) {
          queryParams.stockStatus = params.stockStatus;
        }
        if (params?.searchTerm) {
          queryParams.searchTerm = params.searchTerm;
        }
        if (params?.page) {
          queryParams.page = params.page;
        }
        if (params?.limit) {
          queryParams.limit = params.limit;
        }

        return {
          url: "/shop/products",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: [TagTypes.SHOPS, TagTypes.PRODUCTS, TagTypes.ACADEMY],
    }),

    getProductCategories: builder.query<IGetProductCategoriesResponse, void>({
      query: () => ({
        url: "/shop/products/categories",
        method: "GET",
      }),
      providesTags: [TagTypes.SHOPS, TagTypes.PRODUCTS, TagTypes.ACADEMY],
    }),

    createProduct: builder.mutation<any, FormData | any>({
      query: (body) => ({
        url: "/shop/products",
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.SHOPS, TagTypes.PRODUCTS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Product created successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to create product";
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

    updateProduct: builder.mutation<any, { slugOrId: string; data: FormData | any }>({
      query: ({ slugOrId, data }) => ({
        url: `/shop/products/${slugOrId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.SHOPS, TagTypes.PRODUCTS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Product updated successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to update product";
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

    deleteProduct: builder.mutation<any, string>({
      query: (slugOrId) => ({
        url: `/shop/products/${slugOrId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success || !result?.error) {
          return [TagTypes.SHOPS, TagTypes.PRODUCTS, TagTypes.ACADEMY];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Product deleted successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to delete product";
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
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetProductCategoriesQuery,
  useLazyGetProductCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = shopApi;
