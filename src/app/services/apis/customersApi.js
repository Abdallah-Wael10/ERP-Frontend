import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "@/app/utils/page";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const customersApi = createApi({
  reducerPath: "customersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/customers`,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    // Get all customers (for superadmin/salesManager)
    getCustomers: builder.query({
      query: () => "/",
      providesTags: ["Customer"],
    }),

    // Get my customers (for sales/salesManager)
    getMyCustomers: builder.query({
      query: () => "/my-customers",
      providesTags: ["Customer"],
    }),

    // Get single customer
    getCustomer: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Customer", id }],
    }),

    // Create customer
    createCustomer: builder.mutation({
      query: (customerData) => ({
        url: "/",
        method: "POST",
        body: customerData,
      }),
      invalidatesTags: ["Customer"],
    }),

    // Update customer
    updateCustomer: builder.mutation({
      query: ({ id, ...customerData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: customerData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Customer", id },
        "Customer",
      ],
    }),

    // Delete customer
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customer"],
    }),

    // Bulk delete customers
    bulkDeleteCustomers: builder.mutation({
      query: (ids) => ({
        url: `/bulk/${ids.join(",")}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetMyCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useBulkDeleteCustomersMutation,
} = customersApi;
