import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "@/app/utils/page";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
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
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({
    // Check in to work (All Users) - ✅ Email Triggered
    checkIn: builder.mutation({
      query: (checkInData) => ({
        url: "/api/attendance/check-in",
        method: "POST",
        body: checkInData,
      }),
      invalidatesTags: [
        { type: "Attendance", id: "LIST" },
        { type: "Attendance", id: "MY_ATTENDANCE" },
        { type: "Attendance", id: "TODAY" },
      ],
    }),

    // Check out from work (All Users) - ✅ Email Triggered
    checkOut: builder.mutation({
      query: (checkOutData) => ({
        url: "/api/attendance/check-out",
        method: "POST",
        body: checkOutData,
      }),
      invalidatesTags: [
        { type: "Attendance", id: "LIST" },
        { type: "Attendance", id: "MY_ATTENDANCE" },
        { type: "Attendance", id: "TODAY" },
      ],
    }),

    // Get all attendance (HR/SuperAdmin)
    getAllAttendance: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `/api/attendance?${searchParams}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Attendance", id: _id })),
              { type: "Attendance", id: "LIST" },
            ]
          : [{ type: "Attendance", id: "LIST" }],
    }),

    // Get my attendance (All Users)
    getMyAttendance: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `/api/attendance/my-attendance?${searchParams}`;
      },
      providesTags: [{ type: "Attendance", id: "MY_ATTENDANCE" }],
    }),

    // Get today's attendance (HR/SuperAdmin)
    getTodayAttendance: builder.query({
      query: () => "/api/attendance/today",
      providesTags: [{ type: "Attendance", id: "TODAY" }],
    }),

    // Get attendance statistics (HR/SuperAdmin)
    getAttendanceStats: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `/api/attendance/stats?${searchParams}`;
      },
      providesTags: [{ type: "Attendance", id: "STATS" }],
    }),

    // Get attendance by ID (HR/SuperAdmin)
    getAttendanceById: builder.query({
      query: (id) => `/api/attendance/${id}`,
      providesTags: (result, error, id) => [{ type: "Attendance", id }],
    }),

    // Edit attendance (HR/SuperAdmin)
    editAttendance: builder.mutation({
      query: ({ id, ...attendanceData }) => ({
        url: `/api/attendance/${id}`,
        method: "PUT",
        body: attendanceData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Attendance", id },
        { type: "Attendance", id: "LIST" },
        { type: "Attendance", id: "MY_ATTENDANCE" },
        { type: "Attendance", id: "STATS" },
      ],
    }),

    // Delete attendance (SuperAdmin)
    deleteAttendance: builder.mutation({
      query: (id) => ({
        url: `/api/attendance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Attendance", id },
        { type: "Attendance", id: "LIST" },
        { type: "Attendance", id: "STATS" },
      ],
    }),

    // Get current user's today attendance status
    getMyTodayStatus: builder.query({
      query: () => "/api/attendance/today",
      providesTags: [{ type: "Attendance", id: "MY_TODAY" }],
    }),
  }),
});

export const {
  useCheckInMutation,
  useCheckOutMutation,
  useGetAllAttendanceQuery,
  useGetMyAttendanceQuery,
  useGetTodayAttendanceQuery,
  useGetAttendanceStatsQuery,
  useGetAttendanceByIdQuery,
  useEditAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetMyTodayStatusQuery,
} = attendanceApi;
