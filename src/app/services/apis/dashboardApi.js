import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "@/app/utils/page";
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api/dashboard`,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => "/",
      providesTags: ["Dashboard"],
      // Auto-refresh every 30 seconds
      pollingInterval: 30000,
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
