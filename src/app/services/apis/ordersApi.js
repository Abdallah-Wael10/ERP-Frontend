import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "@/app/utils/page";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    // Create order (Sales Team) - ✅ Email Triggered
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/api/orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),

    // Get all orders (Role-based access)
    getOrders: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `/api/orders?${searchParams}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Order", id: _id })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),

    // Get order by ID (Role-based access)
    getOrderById: builder.query({
      query: (id) => `/api/orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    // Update order (Sales Team)
    updateOrder: builder.mutation({
      query: ({ id, ...orderData }) => ({
        url: `/api/orders/${id}`,
        method: "PUT",
        body: orderData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    // Confirm order (Manager+) - ✅ Email Triggered
    confirmOrder: builder.mutation({
      query: (id) => ({
        url: `/api/orders/${id}/confirm`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    // Ship order (Inventory/SuperAdmin) - ✅ Email Triggered
    shipOrder: builder.mutation({
      query: (id) => ({
        url: `/api/orders/${id}/ship`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    // Cancel order (Manager+) - ✅ Email Triggered
    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `/api/orders/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    // Delete order (SuperAdmin only)
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/api/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    // Get orders by status (helper query)
    getOrdersByStatus: builder.query({
      query: (status) => `/api/orders?status=${status}`,
      providesTags: (result, error, status) => [
        { type: "Order", id: `STATUS_${status}` },
      ],
    }),

    // Get my orders (for sales users)
    getMyOrders: builder.query({
      query: () => "/api/orders?my=true",
      providesTags: [{ type: "Order", id: "MY_ORDERS" }],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useConfirmOrderMutation,
  useShipOrderMutation,
  useCancelOrderMutation,
  useDeleteOrderMutation,
  useGetOrdersByStatusQuery,
  useGetMyOrdersQuery,
} = ordersApi;
