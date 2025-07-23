import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "@/app/utils/page";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const financeApi = createApi({
  reducerPath: "financeApi",
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
  tagTypes: ["Finance"],
  endpoints: (builder) => ({
    // Get total revenue (Finance/SuperAdmin)
    getTotalRevenue: builder.query({
      query: () => "/api/finance/revenue",
      providesTags: [{ type: "Finance", id: "REVENUE" }],
    }),

    // Get monthly revenue (Finance/SuperAdmin)
    getMonthlyRevenue: builder.query({
      query: (year) => {
        const params = year ? `?year=${year}` : "";
        return `/api/finance/revenue/monthly${params}`;
      },
      providesTags: (result, error, year) => [
        { type: "Finance", id: `MONTHLY_REVENUE_${year || "current"}` },
      ],
    }),

    // Get orders financial report (Finance/SuperAdmin)
    getOrdersReport: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `/api/finance/orders?${searchParams}`;
      },
      providesTags: [{ type: "Finance", id: "ORDERS_REPORT" }],
    }),

    // Get salaries report (Finance/HR/SuperAdmin)
    getSalariesReport: builder.query({
      query: () => "/api/finance/salaries",
      providesTags: [{ type: "Finance", id: "SALARIES" }],
    }),

    // Get profit & loss (Finance/SuperAdmin)
    getProfitReport: builder.query({
      query: () => "/api/finance/profit",
      providesTags: [{ type: "Finance", id: "PROFIT" }],
    }),

    // Get sales performance (Finance/Manager/SuperAdmin)
    getSalesPerformance: builder.query({
      query: () => "/api/finance/sales-performance",
      providesTags: [{ type: "Finance", id: "SALES_PERFORMANCE" }],
    }),

    // Get finance dashboard (Finance/SuperAdmin)
    getFinanceDashboard: builder.query({
      query: () => "/api/finance/dashboard",
      providesTags: [{ type: "Finance", id: "DASHBOARD" }],
    }),

    // Get attendance costs (Finance/HR/SuperAdmin)
    getAttendanceCosts: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `/api/finance/attendance-costs?${searchParams}`;
      },
      providesTags: [{ type: "Finance", id: "ATTENDANCE_COSTS" }],
    }),

    // Helper queries for specific date ranges
    getRevenueByDateRange: builder.query({
      query: ({ startDate, endDate }) => {
        const params = new URLSearchParams({
          startDate,
          endDate,
        });
        return `/api/finance/orders?${params}`;
      },
      providesTags: (result, error, { startDate, endDate }) => [
        { type: "Finance", id: `REVENUE_${startDate}_${endDate}` },
      ],
    }),

    // Get quarterly revenue
    getQuarterlyRevenue: builder.query({
      query: (year) => {
        const params = year ? `?year=${year}` : "";
        return `/api/finance/revenue/monthly${params}`;
      },
      transformResponse: (response) => {
        // Transform monthly data to quarterly
        const months = response.months || [];
        const quarters = [
          { quarter: "Q1", months: [1, 2, 3], revenue: 0, ordersCount: 0 },
          { quarter: "Q2", months: [4, 5, 6], revenue: 0, ordersCount: 0 },
          { quarter: "Q3", months: [7, 8, 9], revenue: 0, ordersCount: 0 },
          { quarter: "Q4", months: [10, 11, 12], revenue: 0, ordersCount: 0 },
        ];

        months.forEach((monthData) => {
          const monthNum = parseInt(monthData.month.split("-")[1]);
          const quarter = quarters.find((q) => q.months.includes(monthNum));
          if (quarter) {
            quarter.revenue += monthData.revenue;
            quarter.ordersCount += monthData.ordersCount;
          }
        });

        return {
          ...response,
          quarters,
        };
      },
      providesTags: (result, error, year) => [
        { type: "Finance", id: `QUARTERLY_REVENUE_${year || "current"}` },
      ],
    }),

    // Get top performing products by revenue
    getTopProductsByRevenue: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key]) searchParams.append(key, params[key]);
        });
        return `/api/finance/orders?${searchParams}`;
      },
      transformResponse: (response) => {
        // This would need backend support, but showing structure
        // The backend should group by product and sum revenue
        return response;
      },
      providesTags: [{ type: "Finance", id: "TOP_PRODUCTS" }],
    }),

    // Get expense breakdown
    getExpenseBreakdown: builder.query({
      query: () => "/api/finance/profit",
      transformResponse: (response) => {
        return {
          salaries: response.expenses.salaries,
          productCosts: response.expenses.productCosts,
          totalExpenses: response.expenses.total,
          percentages: {
            salaries: (
              (response.expenses.salaries / response.expenses.total) *
              100
            ).toFixed(1),
            productCosts: (
              (response.expenses.productCosts / response.expenses.total) *
              100
            ).toFixed(1),
          },
        };
      },
      providesTags: [{ type: "Finance", id: "EXPENSE_BREAKDOWN" }],
    }),

    // Refresh all finance data
    refreshFinanceData: builder.mutation({
      query: () => ({
        url: "/api/finance/dashboard",
        method: "GET",
      }),
      invalidatesTags: [{ type: "Finance" }],
    }),
  }),
});

export const {
  useGetTotalRevenueQuery,
  useGetMonthlyRevenueQuery,
  useGetOrdersReportQuery,
  useGetSalariesReportQuery,
  useGetProfitReportQuery,
  useGetSalesPerformanceQuery,
  useGetFinanceDashboardQuery,
  useGetAttendanceCostsQuery,
  useGetRevenueByDateRangeQuery,
  useGetQuarterlyRevenueQuery,
  useGetTopProductsByRevenueQuery,
  useGetExpenseBreakdownQuery,
  useRefreshFinanceDataMutation,
} = financeApi;
