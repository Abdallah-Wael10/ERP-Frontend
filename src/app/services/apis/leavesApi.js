import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "@/app/utils/page";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const leavesApi = createApi({
  reducerPath: "leavesApi",
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
  tagTypes: ["Leave"],
  endpoints: (builder) => ({
    // Create leave request (All Users except SuperAdmin) - ✅ Email Triggered
    createLeaveRequest: builder.mutation({
      query: (leaveData) => ({
        url: "/api/leaves",
        method: "POST",
        body: leaveData,
      }),
      invalidatesTags: [
        { type: "Leave", id: "LIST" },
        { type: "Leave", id: "MY_LEAVES" },
      ],
    }),

    // Get all leaves (HR/SuperAdmin)
    getAllLeaves: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `/api/leaves?${searchParams}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Leave", id: _id })),
              { type: "Leave", id: "LIST" },
            ]
          : [{ type: "Leave", id: "LIST" }],
    }),

    // Get my leaves (All Users)
    getMyLeaves: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `/api/leaves/my-leaves?${searchParams}`;
      },
      providesTags: [{ type: "Leave", id: "MY_LEAVES" }],
    }),

    // Get leave statistics (HR/SuperAdmin)
    getLeaveStats: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `/api/leaves/stats?${searchParams}`;
      },
      providesTags: [{ type: "Leave", id: "STATS" }],
    }),

    // Get leave by ID (HR/SuperAdmin/Owner)
    getLeaveById: builder.query({
      query: (id) => `/api/leaves/${id}`,
      providesTags: (result, error, id) => [{ type: "Leave", id }],
    }),

    // Update leave request (Owner if pending)
    updateLeaveRequest: builder.mutation({
      query: ({ id, ...leaveData }) => ({
        url: `/api/leaves/${id}`,
        method: "PUT",
        body: leaveData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Leave", id },
        { type: "Leave", id: "LIST" },
        { type: "Leave", id: "MY_LEAVES" },
      ],
    }),

    // Approve leave (HR/SuperAdmin) - ✅ Email Triggered
    approveLeave: builder.mutation({
      query: ({ id, ...reviewData }) => ({
        url: `/api/leaves/${id}/approve`,
        method: "PATCH",
        body: reviewData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Leave", id },
        { type: "Leave", id: "LIST" },
        { type: "Leave", id: "MY_LEAVES" },
        { type: "Leave", id: "STATS" },
      ],
    }),

    // Reject leave (HR/SuperAdmin) - ✅ Email Triggered
    rejectLeave: builder.mutation({
      query: ({ id, ...reviewData }) => ({
        url: `/api/leaves/${id}/reject`,
        method: "PATCH",
        body: reviewData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Leave", id },
        { type: "Leave", id: "LIST" },
        { type: "Leave", id: "MY_LEAVES" },
        { type: "Leave", id: "STATS" },
      ],
    }),

    // Delete leave (SuperAdmin)
    deleteLeave: builder.mutation({
      query: (id) => ({
        url: `/api/leaves/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Leave", id },
        { type: "Leave", id: "LIST" },
        { type: "Leave", id: "MY_LEAVES" },
        { type: "Leave", id: "STATS" },
      ],
    }),

    // Get leaves by status (helper query)
    getLeavesByStatus: builder.query({
      query: (status) => `/api/leaves?status=${status}`,
      providesTags: (result, error, status) => [
        { type: "Leave", id: `STATUS_${status}` },
      ],
    }),

    // Get pending leaves (for HR dashboard)
    getPendingLeaves: builder.query({
      query: () => "/api/leaves?status=pending",
      providesTags: [{ type: "Leave", id: "PENDING" }],
    }),
  }),
});

export const {
  useCreateLeaveRequestMutation,
  useGetAllLeavesQuery,
  useGetMyLeavesQuery,
  useGetLeaveStatsQuery,
  useGetLeaveByIdQuery,
  useUpdateLeaveRequestMutation,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
  useDeleteLeaveMutation,
  useGetLeavesByStatusQuery,
  useGetPendingLeavesQuery,
} = leavesApi;
