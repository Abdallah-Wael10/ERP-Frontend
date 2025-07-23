import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "@/app/utils/page";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const productsApi = createApi({
  reducerPath: "productsApi",
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
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    // Get all products (Inventory/SuperAdmin)
    getProducts: builder.query({
      query: () => "/api/products",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Product", id: _id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    // Get product by ID (Inventory/SuperAdmin)
    getProductById: builder.query({
      query: (id) => `/api/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // Create new product (Inventory/SuperAdmin)
    createProduct: builder.mutation({
      query: (productData) => ({
        url: "/api/products",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    // Update product (Inventory/SuperAdmin)
    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/api/products/${id}`,
        method: "PUT",
        body: productData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    // Delete product (SuperAdmin)
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    // Reduce product quantity (Inventory/SuperAdmin)
    reduceProductQuantity: builder.mutation({
      query: ({ id, quantity }) => ({
        url: `/api/products/${id}/reduce-quantity`,
        method: "PUT",
        body: { quantity },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    // Get products with filters and pagination
    getProductsFiltered: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        category = "",
        minPrice = "",
        maxPrice = "",
        inStock = "",
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(category && { category }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          ...(inStock && { inStock }),
        });
        return `/api/products?${params}`;
      },
      providesTags: [{ type: "Product", id: "FILTERED" }],
    }),

    // Get products by category
    getProductsByCategory: builder.query({
      query: (category) => `/api/products/category/${category}`,
      providesTags: (result, error, category) => [
        { type: "Product", id: `CATEGORY_${category}` },
      ],
    }),

    // Get low stock products
    getLowStockProducts: builder.query({
      query: (threshold = 10) =>
        `/api/products/low-stock?threshold=${threshold}`,
      providesTags: [{ type: "Product", id: "LOW_STOCK" }],
    }),

    // Get out of stock products
    getOutOfStockProducts: builder.query({
      query: () => "/api/products/out-of-stock",
      providesTags: [{ type: "Product", id: "OUT_OF_STOCK" }],
    }),

    // Bulk update products
    bulkUpdateProducts: builder.mutation({
      query: (updates) => ({
        url: "/api/products/bulk-update",
        method: "PUT",
        body: { updates },
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    // Bulk delete products
    bulkDeleteProducts: builder.mutation({
      query: (productIds) => ({
        url: "/api/products/bulk-delete",
        method: "DELETE",
        body: { productIds },
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    // Import products from CSV
    importProducts: builder.mutation({
      query: (csvData) => ({
        url: "/api/products/import",
        method: "POST",
        body: csvData,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    // Export products to CSV
    exportProducts: builder.query({
      query: () => "/api/products/export",
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useReduceProductQuantityMutation,
  useGetProductsFilteredQuery,
  useGetProductsByCategoryQuery,
  useGetLowStockProductsQuery,
  useGetOutOfStockProductsQuery,
  useBulkUpdateProductsMutation,
  useBulkDeleteProductsMutation,
  useImportProductsMutation,
  useExportProductsQuery,
} = productsApi;
