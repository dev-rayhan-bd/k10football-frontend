/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import {
  IGetProductsResponse,
  IGetProductCategoriesResponse,
  IGetProductsParams,
  IGetCartResponse,
  IAddToCartPayload,
  ICreateOrderPayload,
  ICreateOrderResponse,
  IVerifyOrderResponse,
  IGetMyOrdersResponse,
  IGetAcademyOrdersParams,
  IGetAcademyOrdersResponse,
  IUpdateOrderStatusPayload,
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

    getCart: builder.query<IGetCartResponse, void>({
      query: () => ({
        url: "/shop/cart",
        method: "GET",
      }),
      providesTags: [TagTypes.CART],
    }),

    addToCart: builder.mutation<any, IAddToCartPayload>({
      query: (body) => ({
        url: "/shop/cart",
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => {
        if (result?.success) {
          return [TagTypes.CART];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Item added to cart");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to add item to cart";
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

    updateCartItem: builder.mutation<any, { itemId: string; body: { quantity: number; size?: string } }>({
      query: ({ itemId, body }) => ({
        url: `/shop/cart/items/${itemId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result) => {
        if (result?.success) {
          return [TagTypes.CART];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Cart updated");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to update cart";
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

    deleteCartItem: builder.mutation<any, string>({
      query: (itemId) => ({
        url: `/shop/cart/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success) {
          return [TagTypes.CART];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Item removed from cart");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to remove item";
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

    clearCart: builder.mutation<any, void>({
      query: () => ({
        url: "/shop/cart",
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success) {
          return [TagTypes.CART];
        }
        return [];
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Cart cleared successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to clear cart";
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

    createOrder: builder.mutation<ICreateOrderResponse, ICreateOrderPayload | void>({
      query: (body) => ({
        url: "/shop/orders",
        method: "POST",
        body: body || { shippingAddress: "Flat 4B, Road 12, London, UK" },
      }),
      // Do NOT invalidate CART here — the backend only empties the cart after
      // Stripe confirms payment. verifyOrder handles the invalidation on success.
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Order created successfully");
        } catch (err: any) {
          const status = err?.error?.status;
          const message = err?.error?.data?.message || "Failed to create order";
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

    verifyOrder: builder.query<IVerifyOrderResponse, { orderId: string; sessionId: string }>({
      query: ({ orderId, sessionId }) => ({
        url: `/shop/orders/${orderId}/verify`,
        method: "GET",
        params: { sessionId },
      }),
      // On successful payment verification, clear the cart cache so the shop
      // shows an empty cart when the user returns.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(apiSlice.util.invalidateTags([TagTypes.CART]));
        } catch {
          // Verification failed — leave the cart as-is so the user can retry.
        }
      },
    }),

    getMyOrders: builder.query<IGetMyOrdersResponse, void>({
      query: () => ({
        url: "/shop/orders",
        method: "GET",
      }),
      providesTags: [TagTypes.CART],
    }),

    getAcademyOrders: builder.query<IGetAcademyOrdersResponse, IGetAcademyOrdersParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append("status", params.status);
        if (params?.orderStatus) queryParams.append("orderStatus", params.orderStatus);
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.limit) queryParams.append("limit", String(params.limit));
        const qs = queryParams.toString();
        return { url: qs ? `/shop/orders/academy?${qs}` : "/shop/orders/academy", method: "GET" };
      },
      providesTags: [TagTypes.SHOPS, TagTypes.PRODUCTS],
    }),

    updateOrderStatus: builder.mutation<any, IUpdateOrderStatusPayload>({
      query: ({ orderId, orderStatus }) => ({
        url: `/shop/orders/${orderId}/status`,
        method: "PATCH",
        body: { orderStatus },
      }),
      invalidatesTags: [TagTypes.SHOPS, TagTypes.PRODUCTS],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          SuccessToast(data?.message || "Order status updated");
        } catch (err: any) {
          const message = err?.error?.data?.message || "Failed to update order status";
          ErrorToast(message);
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
  useGetCartQuery,
  useLazyGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
  useClearCartMutation,
  useCreateOrderMutation,
  useVerifyOrderQuery,
  useLazyVerifyOrderQuery,
  useGetMyOrdersQuery,
  useLazyGetMyOrdersQuery,
  useGetAcademyOrdersQuery,
  useLazyGetAcademyOrdersQuery,
  useUpdateOrderStatusMutation,
} = shopApi;
