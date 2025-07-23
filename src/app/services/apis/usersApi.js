import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "@/app/utils/page";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const usersApi = createApi({
  reducerPath: "usersApi",
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
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // Get all users (SuperAdmin/HR only)
    getUsers: builder.query({
      query: () => "/users",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "User", id: _id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // Get user by ID (SuperAdmin/HR only)
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // Create new user (SuperAdmin/HR only)
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    // Update user (SuperAdmin/HR only)
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    // Delete user (SuperAdmin/HR only)
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    // Bulk operations for better UX
    bulkCreateUsers: builder.mutation({
      query: (usersData) => ({
        url: "/users/bulk",
        method: "POST",
        body: { users: usersData },
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    // Get users by role (helper for specific role filtering)
    getUsersByRole: builder.query({
      query: (role) => `/users?role=${role}`,
      providesTags: (result, error, role) => [
        { type: "User", id: `ROLE_${role}` },
      ],
    }),

    // Get users with pagination
    getUsersPaginated: builder.query({
      query: ({ page = 1, limit = 10, search = "", role = "" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(role && { role }),
        });
        return `/users?${params}`;
      },
      providesTags: (result) => [{ type: "User", id: "PAGINATED" }],
    }),

    // Toggle user status (active/suspended)
    toggleUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    // Reset user password
    resetUserPassword: builder.mutation({
      query: ({ id, newPassword }) => ({
        url: `/users/${id}/reset-password`,
        method: "PATCH",
        body: { newPassword },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkCreateUsersMutation,
  useGetUsersByRoleQuery,
  useGetUsersPaginatedQuery,
  useToggleUserStatusMutation,
  useResetUserPasswordMutation,
} = usersApi;
